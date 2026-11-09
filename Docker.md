# GUÍA DE DESPLIEGUE DOCKER (PROYECTO SINCOMTT)
## CANTV · Gerencia General de Formación y Participación del Poder Popular (GGFPP)

Esta guía documenta la infraestructura de contenedores para el despliegue del Sistema SINCOMTT en la Máquina Virtual con IP asignada `171.0.40.7` (o cualquier entorno de pruebas Proxmox/Debian).

---

### 1. Arquitectura de Contenedores

La solución utiliza una arquitectura de tres capas completamente basada en **Debian Bookworm** para asegurar estabilidad de glibc y compatibilidad con librerías nativas:

```mermaid
flowchart TD
    Client["Navegador Cliente\n(http://171.0.40.7)"] -->|Puerto 80:80| Nginx["mtt-frontend\n(Nginx Bookworm)"]
    
    subgraph Red Interna ["Red Aislada mtt-net (Bridge)"]
        Nginx -->|SPA Estática React 19| Static["Dist React 19 + Tailwind"]
        Nginx -->|Reverse Proxy /api/*| Backend["mtt-backend\n(FastAPI / Python 3.12:8000)"]
        Backend -->|SQLAlchemy + psycopg2 :5432| DB[("mtt-database\n(PostgreSQL 16:5432)\n2.187 Registros")]
    end
```

---

### 2. Archivo `docker-compose.yml` Oficial

```yaml
version: '3.8'

services:
  # ============================================================================
  # FRONTEND: React 19 + Vite + Tailwind en Servidor Nginx (Debian Bookworm)
  # Expone el puerto 80 al host y actúa como Reverse Proxy hacia /api/ (Same-Origin)
  # ============================================================================
  mtt-frontend:
    container_name: mtt-frontend
    build:
      context: ./frontend
      dockerfile: Dockerfile
    restart: always
    ports:
      - "80:80"
    networks:
      - mtt-net
    depends_on:
      - mtt-backend
    environment:
      - VIRTUAL_HOST=171.0.40.7,localhost
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost/health"]
      interval: 30s
      timeout: 5s
      retries: 3

  # ============================================================================
  # BACKEND: FastAPI + Uvicorn (Debian Bookworm)
  # Aislado en red interna mtt-net (SIN puertos expuestos directamente al Host)
  # ============================================================================
  mtt-backend:
    container_name: mtt-backend
    build:
      context: ./backend
      dockerfile: Dockerfile
    restart: always
    expose:
      - "8000"
    networks:
      - mtt-net
    depends_on:
      mtt-database:
        condition: service_healthy
    environment:
      - DATABASE_URL=postgresql+psycopg2://postgres:123456@mtt-database:5432/mtt_db
      - ENVIRONMENT=production
      - HOST_IP=171.0.40.7

  # ============================================================================
  # DATABASE: PostgreSQL 16 (Debian Bookworm)
  # Aislado en red interna con volumen persistente y restauración de backup oficial
  # ============================================================================
  mtt-database:
    image: postgres:16-bookworm
    container_name: mtt-database
    restart: always
    expose:
      - "5432"
    networks:
      - mtt-net
    environment:
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=123456
      - POSTGRES_DB=mtt_db
      - PGDATA=/var/lib/postgresql/data/pgdata
    volumes:
      - ./data/pgdata:/var/lib/postgresql/data/pgdata
      - ./backend/mtt_db_backup.sql:/docker-entrypoint-initdb.d/01_backup.sql:ro
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres -d mtt_db"]
      interval: 10s
      timeout: 5s
      retries: 5

networks:
  mtt-net:
    name: mtt-net
    driver: bridge
```

---

### 3. Comandos de Despliegue y Gestión

#### Opción A: Con Docker Compose (Recomendado)
```bash
# Construir imágenes y levantar en segundo plano
docker compose up -d --build

# Ver el estado de los tres contenedores
docker compose ps

# Ver logs en tiempo real
docker compose logs -f
```

#### Opción B: Con comandos directos de Docker CLI (Entornos sin Compose)
```bash
# 1. Crear la red interna aislada
docker network create mtt-net

# 2. Levantar la base de datos PostgreSQL 16
docker run -d --name mtt-database --network mtt-net --restart always \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=123456 \
  -e POSTGRES_DB=mtt_db \
  -v $(pwd)/backend/mtt_db_backup.sql:/docker-entrypoint-initdb.d/01_backup.sql:ro \
  postgres:16-bookworm

# 3. Construir y levantar el Backend (FastAPI / Python 3.12)
docker build -t mtt-backend ./backend
docker run -d --name mtt-backend --network mtt-net --restart always \
  -e DATABASE_URL=postgresql+psycopg2://postgres:123456@mtt-database:5432/mtt_db \
  -e HOST_IP=171.0.40.7 \
  mtt-backend

# 4. Construir y levantar el Frontend (React 19 + Nginx Reverse Proxy)
docker build -t mtt-frontend ./frontend
docker run -d --name mtt-frontend --network mtt-net --restart always -p 80:80 mtt-frontend
```

---

### 4. Pruebas de Verificación y Salud del Despliegue

```bash
# Comprobar salud del frontend
curl -i http://localhost/health

# Comprobar catálogos geográficos
curl -s http://localhost/api/catalogos/estados

# Comprobar registros de MTTs en base de datos
curl -s http://localhost/api/mtt | grep -o '"nombre":' | wc -l
```
