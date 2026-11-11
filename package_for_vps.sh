#!/usr/bin/env bash
# ==============================================================================
# CANTV SINCOMTT - SCRIPT DE EMPAQUETADO AGNÓSTICO PARA VPS
# Genera un archivo .tar.gz autocontenido listo para desplegar en cualquier servidor
# ==============================================================================
set -e

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BUNDLE_NAME="sincomtt_vps_bundle_${TIMESTAMP}.tar.gz"

echo "📦 Empaquetando SINCOMTT para despliegue agnóstico en VPS..."

# Empaquetar el proyecto completo con rutas relativas
tar --exclude='frontend/node_modules' \
    --exclude='frontend/.vite' \
    --exclude='.git' \
    --exclude='*.log' \
    --exclude='data/pgdata/*' \
    -czvf "${BUNDLE_NAME}" \
    docker-compose.yml \
    frontend \
    backend \
    Docker.md \
    README.md \
    INFORME

echo "================================================================================"
echo "✅ ARCHIVO GENERADO CON ÉXITO: ${BUNDLE_NAME}"
echo "================================================================================"
echo "Instrucciones de Despliegue en el VPS Destino:"
echo "  1. Transferir archivo al VPS:"
echo "     scp ${BUNDLE_NAME} root@171.0.40.7:/opt/cantv-mtt/"
echo "  2. En el VPS, descomprimir:"
echo "     tar -xzvf ${BUNDLE_NAME}"
echo "  3. Levantar todo el ecosistema (Frontend + Backend + Postgres + Redis):"
echo "     docker compose up -d --build"
echo "================================================================================"
