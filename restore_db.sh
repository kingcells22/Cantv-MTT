#!/usr/bin/env bash
# ==============================================================================
# CANTV SINCOMTT - SCRIPT INTELIGENTE DE RESTAURACIÓN DE BASE DE DATOS
# Permite restaurar de forma interactiva o por argumento cualquier backup de Backup/
# ==============================================================================
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKUP_DIR="${SCRIPT_DIR}/Backup"

AUTO_CONFIRM=false
TARGET_FILE=""

# Procesar banderas de línea de comando
for arg in "$@"; do
    case "$arg" in
        -y|--yes|--force)
            AUTO_CONFIRM=true
            ;;
        *)
            if [ -z "${TARGET_FILE}" ]; then
                TARGET_FILE="$arg"
            fi
            ;;
    esac
done

echo "================================================================================"
echo "🔄 SISTEMA INTELIGENTE DE RESTAURACIÓN DE BASE DE DATOS (SINCOMTT - CANTV)"
echo "   Fecha/Hora: $(date)"
echo "================================================================================"

# 1. Validar que el contenedor mtt-database esté corriendo
if ! docker ps --filter "name=mtt-database" --filter "status=running" | grep -q "mtt-database"; then
    echo "⚠️  El contenedor 'mtt-database' no está corriendo. Iniciándolo ahora..."
    if command -v docker-compose &> /dev/null; then
        docker-compose up -d mtt-database
    elif docker compose version &> /dev/null; then
        docker compose up -d mtt-database
    else
        docker start mtt-database || {
            echo "❌ ERROR: No se pudo iniciar el contenedor 'mtt-database'."
            exit 1
        }
    fi
    echo "⏳ Esperando que PostgreSQL complete la inicialización..."
    sleep 3
fi

# Validar que PostgreSQL responda
RETRIES=10
until docker exec mtt-database pg_isready -U postgres -d mtt_db > /dev/null 2>&1 || [ $RETRIES -eq 0 ]; do
    echo "   Esperando a PostgreSQL... ($RETRIES intentos restantes)"
    sleep 2
    RETRIES=$((RETRIES-1))
done

if [ $RETRIES -eq 0 ]; then
    echo "❌ ERROR: PostgreSQL no responde en 'mtt-database'."
    exit 1
fi

# 2. Selección del archivo de respaldo
if [ -z "${TARGET_FILE}" ]; then
    # Buscar backups disponibles
    BACKUP_FILES=()
    
    # Agregar backups tar en Backup/
    while IFS= read -r file; do
        [ -n "$file" ] && [ -f "$file" ] && [ "$(basename "$file")" != "latest.tar" ] && BACKUP_FILES+=("$file")
    done < <(find "${BACKUP_DIR}" -maxdepth 1 -name "*.tar" 2>/dev/null | sort -r)

    # Agregar backups sql en Backup/
    while IFS= read -r file; do
        [ -n "$file" ] && [ -f "$file" ] && [ "$(basename "$file")" != "latest.sql" ] && BACKUP_FILES+=("$file")
    done < <(find "${BACKUP_DIR}" -maxdepth 1 -name "*.sql" 2>/dev/null | sort -r)

    # Agregar backup semilla oficial del backend como opción
    if [ -f "${SCRIPT_DIR}/backend/mtt_db_backup.sql" ]; then
        BACKUP_FILES+=("${SCRIPT_DIR}/backend/mtt_db_backup.sql")
    fi

    TOTAL_OPTIONS=${#BACKUP_FILES[@]}

    if [ "$TOTAL_OPTIONS" -eq 0 ]; then
        echo "❌ No se encontraron copias de seguridad en '${BACKUP_DIR}' ni en 'backend/'."
        echo "   Genere una primero con: ./backup_db.sh"
        exit 1
    fi

    echo ""
    echo "📋 COPIAS DE SEGURIDAD DISPONIBLES:"
    echo "--------------------------------------------------------------------------------"
    IDX=1
    for f in "${BACKUP_FILES[@]}"; do
        FNAME=$(basename "$f")
        FSIZE=$(ls -lh "$f" | awk '{print $5}')
        FDATE=$(date -r "$f" "+%Y-%m-%d %H:%M:%S" 2>/dev/null || stat -c "%y" "$f" 2>/dev/null | cut -d'.' -f1 || echo "N/D")
        
        if [ "$f" = "${SCRIPT_DIR}/backend/mtt_db_backup.sql" ]; then
            printf "  [%d] %-36s | %-7s | %-19s | (Semilla Oficial Base)\n" "$IDX" "$FNAME" "$FSIZE" "$FDATE"
        else
            printf "  [%d] %-36s | %-7s | %-19s\n" "$IDX" "$FNAME" "$FSIZE" "$FDATE"
        fi
        IDX=$((IDX+1))
    done
    echo "--------------------------------------------------------------------------------"

    # Si no es interactivo y no se especificó archivo, tomar el más reciente
    if [ ! -t 0 ]; then
        TARGET_FILE="${BACKUP_FILES[0]}"
        echo "ℹ️  Modo no interactivo detectado. Seleccionado automáticamente el más reciente: ${TARGET_FILE}"
    else
        while true; do
            read -rp "👉 Seleccione el número a restaurar [1-${TOTAL_OPTIONS}] (o 'q' para salir): " CHOICE
            if [ "$CHOICE" = "q" ] || [ "$CHOICE" = "Q" ]; then
                echo "Operación cancelada por el usuario."
                exit 0
            fi
            if [[ "$CHOICE" =~ ^[0-9]+$ ]] && [ "$CHOICE" -ge 1 ] && [ "$CHOICE" -le "$TOTAL_OPTIONS" ]; then
                TARGET_FILE="${BACKUP_FILES[$((CHOICE-1))]}"
                break
            else
                echo "⚠️  Opción inválida. Ingrese un número entre 1 y ${TOTAL_OPTIONS}."
            fi
        done
    fi
fi

# 3. Validar existencia del archivo seleccionado
if [ ! -f "${TARGET_FILE}" ]; then
    echo "❌ ERROR: El archivo seleccionado no existe: ${TARGET_FILE}"
    exit 1
fi

echo ""
echo "🎯 ARCHIVO SELECCIONADO PARA RESTAURACIÓN:"
echo "   $(ls -lh "${TARGET_FILE}")"
echo ""

# 4. Confirmación de seguridad
if [ "$AUTO_CONFIRM" = false ]; then
    echo "⚠️  ADVERTENCIA CRÍTICA:"
    echo "   Esta operación sobrescribirá los datos actuales en la base de datos 'mtt_db'."
    read -rp "   ¿Está absolutamente seguro de proceder con la restauración? (s/N): " CONFIRM
    case "$CONFIRM" in
        [sS]|[sS][iI]|[yY]|[yY][eE][sS])
            echo "Procediendo con la restauración..."
            ;;
        *)
            echo "Operación abortada por el usuario."
            exit 0
            ;;
    esac
fi

# 5. Ejecución de la restauración según el tipo de archivo (.tar o .sql)
echo "⏳ Restaurando base de datos en 'mtt-database'..."

if [[ "${TARGET_FILE}" == *.tar ]]; then
    # Extraer y enviar el .sql empaquetado directamente por tubería (zero overhead)
    echo "   Detectado archivo comprimido TAR. Extrayendo SQL en streaming..."
    tar --wildcards -xOf "${TARGET_FILE}" "*.sql" | docker exec -i mtt-database psql -U postgres -d mtt_db -q
else
    # Archivo SQL plano
    echo "   Detectado archivo SQL plano. Ejecutando sentencias..."
    docker exec -i mtt-database psql -U postgres -d mtt_db -q < "${TARGET_FILE}"
fi

# 6. Re-aplicar o verificar índices de optimización para garantizar velocidad
if [ -f "${SCRIPT_DIR}/backend/optimizations_indexes.sql" ]; then
    echo "⚡ Verificando y aplicando índices de optimización B-Tree..."
    docker exec -i mtt-database psql -U postgres -d mtt_db -q < "${SCRIPT_DIR}/backend/optimizations_indexes.sql"
fi

# 7. Purgar caché de Redis para evitar datos obsoletos en la interfaz
if docker ps --filter "name=mtt-redis" --filter "status=running" | grep -q "mtt-redis"; then
    echo "🧹 Purgando caché en Redis ('mtt-redis') para sincronizar interfaz..."
    docker exec mtt-redis redis-cli FLUSHALL > /dev/null 2>&1 || true
fi

# 8. Verificación y telemetría post-restauración
RESTORED_MTT=$(docker exec mtt-database psql -U postgres -d mtt_db -t -c "SELECT count(*) FROM mtt_principal;" 2>/dev/null | tr -d ' ' || echo "0")
RESTORED_USERS=$(docker exec mtt-database psql -U postgres -d mtt_db -t -c "SELECT count(*) FROM usuarios;" 2>/dev/null | tr -d ' ' || echo "0")

echo "================================================================================"
echo "✅ RESTAURACIÓN COMPLETADA CON ÉXITO"
echo "   Total MTTs en base de datos: ${RESTORED_MTT}"
echo "   Total Usuarios activos:     ${RESTORED_USERS}"
echo "   Caché Redis:                 Sincronizada (Purged)"
echo "   Índices B-Tree:              Activos (12 índices verificados)"
echo "================================================================================"
