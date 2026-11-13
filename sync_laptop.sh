#!/usr/bin/env bash
# ==============================================================================
# CANTV SINCOMTT - SCRIPT DE SINCRONIZACIÓN MULTI-MÁQUINA PERSONAL
# Sincroniza TODO el entorno (código + .agents + bitácoras) con tu repositorio
# privado en GitHub para usar en PC Linux, PC Windows y Laptop.
# ==============================================================================
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "${SCRIPT_DIR}"

BRANCH_SYNC="workspace/laptop-sync"
ACTION="${1:-push}"

echo "================================================================================"
echo "🔄 SINCRONIZADOR MULTI-MÁQUINA PERSONAL (PC Linux ⟷ PC Windows ⟷ Laptop)"
echo "   Rama de sincronización total: ${BRANCH_SYNC}"
echo "================================================================================"

# 1. Verificar si existe el remote 'personal'
if ! git remote | grep -q "^personal$"; then
    echo "⚠️  Aún no tienes configurado el repositorio remoto 'personal'."
    echo ""
    echo "Por favor, crea un repositorio PRIVADO en tu cuenta de GitHub (ej: cantv-mtt-workspace)"
    echo "y pega la URL a continuación (HTTPS o SSH):"
    read -rp "👉 URL del repositorio privado personal: " REPO_URL
    
    if [ -z "$REPO_URL" ]; then
        echo "❌ Operación cancelada. No se configuró el repositorio remoto."
        exit 1
    fi
    
    git remote add personal "${REPO_URL}"
    echo "✅ Remote 'personal' configurado exitosamente: ${REPO_URL}"
    echo ""
fi

# 2. Acción PUSH (Guardar y subir snapshot completo de todo el workspace)
if [ "$ACTION" = "push" ]; then
    CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
    TIMESTAMP=$(date +'%Y-%m-%d %H:%M:%S')

    echo "📦 Preparando snapshot de trabajo desde la rama actual '${CURRENT_BRANCH}'..."

    # Si estamos en otra rama, nos aseguramos de que los cambios estén committeados o guardados
    if ! git show-ref --verify --quiet "refs/heads/${BRANCH_SYNC}"; then
        echo "🌱 Creando rama dedicada de sincronización personal '${BRANCH_SYNC}'..."
        git branch "${BRANCH_SYNC}"
    fi

    # Cambiar temporalmente a la rama de sincronización personal
    git checkout "${BRANCH_SYNC}"

    # Integrar los cambios de código más recientes de la rama de trabajo
    if [ "${CURRENT_BRANCH}" != "${BRANCH_SYNC}" ]; then
        echo "🔀 Integrando cambios recientes desde '${CURRENT_BRANCH}'..."
        git merge "${CURRENT_BRANCH}" -m "merge: sincronizar avances de ${CURRENT_BRANCH}" --no-edit || true
    fi

    # Forzar la inclusión de absolutamente todas las carpetas del agente y bitácoras
    echo "📂 Agregando carpetas protegidas y bitácoras de Antigravity al índice..."
    git add -A
    git add -f .agents/ Agents/ Workflow/ Datos_del_Proyecto/ AGENTS.md SESSION_CONTEXT.md SESSION_HILO.md publish_official.sh publish_official.bat 2>/dev/null || true

    # Si hay algo que committear
    if ! git diff-index --quiet HEAD --; then
        git commit -m "sync: snapshot multi-maquina (${TIMESTAMP})"
        echo "✅ Commit de snapshot generado."
    else
        echo "ℹ️  No hay cambios pendientes en la rama de sincronización."
    fi

    echo "🚀 Subiendo cambios a tu repositorio PRIVADO personal..."
    git push -u personal "${BRANCH_SYNC}"

    # Regresar a la rama donde estaba trabajando el usuario
    if [ "${CURRENT_BRANCH}" != "${BRANCH_SYNC}" ]; then
        git checkout "${CURRENT_BRANCH}"
        echo "↩️  Regresado a tu rama de desarrollo de trabajo: ${CURRENT_BRANCH}"
    fi

    sync 2>/dev/null || true
    echo "================================================================================"
    echo "🎉 SINCRONIZACIÓN EXITOSA HACIA TU REPO PRIVADO"
    echo "   En tu Laptop o PC Windows solo ejecuta:"
    echo "     git pull personal ${BRANCH_SYNC}"
    echo "   o si tienes este script:"
    echo "     ./sync_laptop.sh pull"
    echo "================================================================================"

# 3. Acción PULL (Descargar snapshot en la Laptop o PC Windows)
elif [ "$ACTION" = "pull" ]; then
    echo "📥 Descargando últimos cambios desde tu repositorio PRIVADO personal..."
    
    # Traer actualizaciones del remote personal
    git fetch personal

    # Si la rama sync existe, actualizarla
    if git show-ref --verify --quiet "refs/heads/${BRANCH_SYNC}"; then
        git checkout "${BRANCH_SYNC}"
        git pull personal "${BRANCH_SYNC}"
    else
        git checkout -b "${BRANCH_SYNC}" "personal/${BRANCH_SYNC}"
    fi

    sync 2>/dev/null || true
    echo "================================================================================"
    echo "✅ ENTORNO SINCRONIZADO EN TU MÁQUINA"
    echo "   Se actualizaron todas las carpetas de trabajo (.agents, bitácoras y código)."
    echo "================================================================================"

else
    echo "❌ Acción no reconocida: '${ACTION}'. Usa './sync_laptop.sh push' o './sync_laptop.sh pull'."
    exit 1
fi

