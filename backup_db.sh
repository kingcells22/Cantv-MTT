#!/usr/bin/env bash
# ==============================================================================
# CANTV SINCOMTT - SCRIPT DE COPIA DE SEGURIDAD (BACKUP) DE BASE DE DATOS
# Genera un volcado limpio y un archivo .tar en la carpeta Backup/ del repositorio
# ==============================================================================
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKUP_DIR="${SCRIPT_DIR}/Backup"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

mkdir -p "${BACKUP_DIR}"

echo "================================================================================"
echo "💾 INICIANDO RESPALDO DE BASE DE DATOS (SINCOMTT - CANTV GGFPP)"
echo "   Fecha/Hora: $(date)"
echo "   Destino:    ${BACKUP_DIR}"
echo "================================================================================"

# 1. Validar que el contenedor mtt-database esté en ejecución
if ! docker ps --filter "name=mtt-database" --filter "status=running" | grep -q "mtt-database"; then
    echo "❌ ERROR: El contenedor 'mtt-database' no se encuentra en ejecución."
    echo "   Inicie el contenedor con: docker compose up -d mtt-database"
    exit 1
fi

# 2. Validar que PostgreSQL responda
if ! docker exec mtt-database pg_isready -U postgres -d mtt_db > /dev/null 2>&1; then
    echo "❌ ERROR: PostgreSQL en 'mtt-database' no está aceptando conexiones."
    exit 1
fi

# 3. Obtener telemetría previa para auditoría
TOTAL_MTT=$(docker exec mtt-database psql -U postgres -d mtt_db -t -c "SELECT count(*) FROM mtt_principal;" 2>/dev/null | tr -d ' ' || echo "0")
echo "📊 Registros actuales en mtt_principal: ${TOTAL_MTT}"

# 4. Generar el volcado SQL con opciones limpias para restauración segura
SQL_FILE="${BACKUP_DIR}/mtt_db_backup_${TIMESTAMP}.sql"
TAR_FILE="${BACKUP_DIR}/mtt_db_backup_${TIMESTAMP}.tar"
META_FILE="${BACKUP_DIR}/metadata_${TIMESTAMP}.json"

echo "⏳ Extrayendo volcado con pg_dump..."
docker exec mtt-database pg_dump -U postgres -d mtt_db \
    --clean \
    --if-exists \
    --no-owner \
    --no-privileges \
    --encoding=UTF8 > "${SQL_FILE}"

# 5. Generar archivo de metadatos de trazabilidad
cat <<EOF > "${META_FILE}"
{
  "timestamp": "${TIMESTAMP}",
  "date_human": "$(date)",
  "database": "mtt_db",
  "engine": "PostgreSQL 16 (Debian Bookworm)",
  "records_mtt_principal": ${TOTAL_MTT},
  "sql_file": "mtt_db_backup_${TIMESTAMP}.sql",
  "tar_file": "mtt_db_backup_${TIMESTAMP}.tar"
}
EOF

# 6. Empaquetar en archivo .tar para el repositorio
echo "📦 Creando archivo comprimido .tar en ${BACKUP_DIR}..."
tar -cf "${TAR_FILE}" -C "${BACKUP_DIR}" "mtt_db_backup_${TIMESTAMP}.sql" "metadata_${TIMESTAMP}.json"

# 7. Mantener enlaces/copias latest para conveniencia
cp -f "${TAR_FILE}" "${BACKUP_DIR}/latest.tar"
cp -f "${SQL_FILE}" "${BACKUP_DIR}/latest.sql"

# Limpiar archivos temporales JSON para no saturar la carpeta (queda dentro del tar)
rm -f "${META_FILE}"

FILE_SIZE=$(ls -lh "${TAR_FILE}" | awk '{print $5}')
echo "================================================================================"
echo "✅ RESPALDO COMPLETADO EXITOSAMENTE"
echo "   Archivo TAR: ${TAR_FILE} (${FILE_SIZE})"
echo "   Archivo SQL: ${SQL_FILE}"
echo "   Copia Latest: ${BACKUP_DIR}/latest.tar"
echo "   Total MTTs:  ${TOTAL_MTT}"
echo "================================================================================"
echo "Para restaurar en cualquier momento ejecute:"
echo "   ./restore_db.sh"
echo "================================================================================"
