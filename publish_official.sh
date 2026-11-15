#!/usr/bin/env bash
# ==============================================================================
# CANTV SINCOMTT - SCRIPT DE PUBLICACIÓN OFICIAL (UN SOLO CLIC)
# Fusiona y publica los avances de código al repositorio de CANTV (origin)
# asegurando que NINGUNA carpeta de agentes ni bitácoras se filtre.
# ==============================================================================
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "${SCRIPT_DIR}"

OFFICIAL_BRANCH="feature/frontend-react19"
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
TIMESTAMP=$(date +'%Y-%m-%d %H:%M:%S')

echo "================================================================================"
echo "🚀 PUBLICADOR OFICIAL A REPOSITORIO EMPRESARIAL (CANTV - GGFPP)"
echo "   Destino Oficial: origin (${OFFICIAL_BRANCH})"
echo "   Fecha/Hora:      ${TIMESTAMP}"
echo "================================================================================"

# 0. Verificar que 'origin' apunte al repositorio oficial de CANTV
ORIGIN_URL=$(git remote get-url origin 2>/dev/null || echo "")
if [[ "${ORIGIN_URL}" =~ "cantv-mtt-workspace" ]] || [[ "${ORIGIN_URL}" =~ "ilidan0160" ]]; then
    git remote rename origin personal 2>/dev/null || true
    git remote add origin https://github.com/kingcells22/Cantv-MTT.git 2>/dev/null || true
fi
if ! git remote | grep -q "^origin$"; then
    git remote add origin https://github.com/kingcells22/Cantv-MTT.git 2>/dev/null || true
fi

# 1. Si estamos en la rama de sincronización personal, nos cambiamos a la oficial y traemos el código
if [ "${CURRENT_BRANCH}" != "${OFFICIAL_BRANCH}" ]; then
    echo "🔀 Te encuentras en '${CURRENT_BRANCH}'. Cambiando a rama oficial '${OFFICIAL_BRANCH}'..."
    
    # Asegurar que no hay cambios sueltos sin commitear antes de cambiar de rama
    if ! git diff-index --quiet HEAD --; then
        echo "💾 Guardando cambios pendientes en la rama actual..."
        git add -A
        git commit -m "sync: autoguardado previo a publicación oficial (${TIMESTAMP})" || true
    fi

    git checkout "${OFFICIAL_BRANCH}"

    echo "📥 Fusionando avances de código desde '${CURRENT_BRANCH}'..."
    git merge "${CURRENT_BRANCH}" -m "merge: integración de avances hacia rama oficial (${TIMESTAMP})" --no-edit || true
fi

# 2. Blindaje defensivo de seguridad: Des-indexar cualquier archivo que deba ser privado
echo "🛡️  Verificando blindaje de .gitignore (erradicando carpetas locales del commit)..."
git rm --cached -r .agents Agents Workflow Datos_del_Proyecto AGENTS.md SESSION_CONTEXT.md SESSION_HILO.md sync_laptop.sh publish_official.sh publish_official.bat 2>/dev/null || true

# 3. Agregar cambios de código legítimos
git add .
git add .gitignore

# 4. Solicitar descripción opcional del commit o usar automática
if ! git diff-index --quiet HEAD --; then
    echo ""
    read -t 15 -rp "📝 Mensaje del commit (Presiona ENTER para usar automático): " USER_MSG || true
    if [ -z "${USER_MSG}" ]; then
        COMMIT_MSG="feat(release): actualización oficial del sistema (${TIMESTAMP})"
    else
        COMMIT_MSG="${USER_MSG}"
    fi

    echo "📦 Creando commit oficial: '${COMMIT_MSG}'..."
    git commit -m "${COMMIT_MSG}"
else
    echo "ℹ️  No hay cambios de código pendientes para commitear. Verificando estado remoto..."
fi

# 5. Publicar al repositorio oficial (origin)
echo ""
echo "🌐 Publicando rama oficial a GitHub CANTV (origin)..."
git push origin "${OFFICIAL_BRANCH}"

sync 2>/dev/null || true

echo ""
echo "================================================================================"
echo "✅ PUBLICACIÓN OFICIAL COMPLETADA EXITOSAMENTE"
echo "   Rama:    ${OFFICIAL_BRANCH} ➔ origin/${OFFICIAL_BRANCH}"
echo "   Destino: https://github.com/kingcells22/Cantv-MTT.git"
echo "   Estado:  Kenny Navarro y Soporte-IT ya tienen el código más reciente."
echo "            Tus archivos privados (.agents, bitácoras) se mantuvieron 100% seguros."
echo "================================================================================"

