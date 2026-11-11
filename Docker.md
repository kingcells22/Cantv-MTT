# GUÍA DE DESPLIEGUE DOCKER (PROYECTO SINCOMTT)
## CANTV · Gerencia General de Formación y Participación del Poder Popular (GGFPP)

Esta guía documenta la infraestructura agnóstica de contenedores para el despliegue del Sistema SINCOMTT en la Máquina Virtual con IP asignada `171.0.40.7` (o cualquier VPS / Proxmox / Debian / Ubuntu / RHEL).

---

### 1. Arquitectura de Contenedores de Alto Rendimiento

La solución utiliza una arquitectura de cuatro capas completamente basada en **Debian Bookworm** para asegurar estabilidad de glibc, cero problemas de concurrencia y máxima eficiencia de memoria:

```mermaid
flowchart TD
    Client["Navegador Cliente\n(http://171.0.40.7)"] -->|Puerto 80:80| Nginx["mtt-frontend\n(Nginx Bookworm)"]
    
    subgraph Red Interna ["Red Aislada mtt-net (Bridge)"]
        Nginx -->|SPA Estática React 19| Static["Dist React 19 + Tailwind"]
        Nginx -->|Reverse Proxy /api/*| Backend["mtt-backend\n(FastAPI / Python 3.12:8000)"]
        Backend -->|Caché en RAM :6379\n(Catálogos / Ubigeo / Sesiones)| Redis[("mtt-redis\n(Redis 7 Bookworm:6379)\nMax 128MB LRU")]
        Backend -->|Pool Conexiones Reutilizables :5432\n(pool_pre_ping=True, 20-50 conex)| DB[("mtt-database\n(PostgreSQL 16:5432)\n2.187 Registros + 12 Índices")]
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
  # CACHE: Redis 7 (Debian Bookworm) - Aceleración de Catálogos y Sesiones
  # Aislado en red interna con desalojo LRU y límite estricto de 128MB RAM
  # ============================================================================
  mtt-redis:
    image: redis:7-bookworm
    container_name: mtt-redis
    restart: always
    expose:
      - "6379"
    networks:
      - mtt-net
    command: ["redis-server", "--appendonly", "yes", "--maxmemory", "128mb", "--maxmemory-policy", "allkeys-lru"]
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 3s
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
      mtt-redis:
        condition: service_healthy
    environment:
      - DATABASE_URL=postgresql+psycopg2://postgres:123456@mtt-database:5432/mtt_db
      - REDIS_URL=redis://mtt-redis:6379/0
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
      - ./backend/optimizations_indexes.sql:/docker-entrypoint-initdb.d/02_indexes.sql:ro
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

### 3. Portabilidad Total: Empaquetar y Desplegar en VPS con `.tar.gz`

El proyecto está diseñado de forma **completamente agnóstica** (rutas relativas, auto-inicialización de BD con scripts SQL e imágenes autocontenidas).

#### Paso 1: Generar el archivo comprimido en tu máquina local
```bash
./package_for_vps.sh
```
Esto genera un archivo `sincomtt_vps_bundle_YYYYMMDD_HHMMSS.tar.gz` con todo lo necesario (código, configuraciones, backups SQL e índices).

#### Paso 2: Copiar al VPS destino
```bash
scp sincomtt_vps_bundle_*.tar.gz root@171.0.40.7:/opt/cantv-mtt/
```

#### Paso 3: En el VPS, descomprimir y encender
```bash
cd /opt/cantv-mtt
tar -xzvf sincomtt_vps_bundle_*.tar.gz
docker compose up -d --build
```
> **¿Qué ocurre automáticamente en el VPS virgen?**
> 1. PostgreSQL se inicia, detecta que no hay base de datos y ejecuta automáticamente `/docker-entrypoint-initdb.d/01_backup.sql` y `02_indexes.sql`.
> 2. Redis se inicia con 128MB de RAM máxima y desalojo LRU.
> 3. El Backend espera a que PostgreSQL y Redis estén sanos (`service_healthy`), conecta su pool de 20-50 conexiones y arranca FastAPI.
> 4. Nginx arranca, compila la SPA React 19 y atiende peticiones en el puerto 80.

---

### 4. Visión a Futuro: Panel Administrativo tipo Odoo / Directus / DBeaver Web

Para futuras fases del proyecto (administración masiva de catálogos, edición directa de registros en cuadrícula tipo hoja de cálculo, auditoría de usuarios y flujos de aprobación), el diseño desacoplado del stack permite acoplar de forma transparente:
- **Opción A (Headless CMS / Data Platform):** Integración de Directus o NocoDB conectado directamente a la misma base de datos `mtt-database` en la red `mtt-net`.
- **Opción B (Módulo Administrativo Avanzado en React):** Expandir el panel de Administración del propio Frontend React 19 con capacidades de edición en línea (*inline spreadsheet editing*), importación masiva de Excel con validación previa y logs de auditoría.
