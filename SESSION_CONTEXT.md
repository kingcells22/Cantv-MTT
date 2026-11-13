# SESSION_CONTEXT · BITÁCORA DE RELEVO Y SINCRONIZACIÓN
## Proyecto SINCOMTT (CANTV · GGFPP · FIIIDT)

### 📅 Fecha de Sesión: 2026-11-13 (Actualizado: 08:02 -06:00)
* **Sistema Operativo / Entorno:** Linux (Debian/Ubuntu x86_64) en `/home/anthony/DiscoSecundario/proyecto/CANTV-MMT`
* **IP Servidor Físico / VPS:** `171.31.100.144` (Acceso Web: `http://171.31.100.144` y Dominio `http://cantvprueba.fii.gob.ve`)
* **Proxy Perimetral FII:** `171.0.40.4` (OpenResty enrutando al servidor físico)
* **Repositorio Remoto Oficial:** `https://github.com/kingcells22/Cantv-MTT.git`
* **Rama de Trabajo Actual:** `feature/frontend-react19` (Commit local `b21b7dd`)
* **Agente Activo:** `SINCOMTT-FrontendArchitect`
* **Estado Operativo:** **FULL STACK 4 CAPAS TOTALMENTE AGNÓSTICO, EN LÍNEA Y VERIFICADO** (Frontend Nginx + Backend FastAPI + PostgreSQL 16 + Redis 7). Operativo en servidor físico `171.31.100.144` y bajo dominio `cantvprueba.fii.gob.ve`.

---

### ⭐ REGLA DE ORO DE GOBERNANZA: ACTUALIZACIÓN OBLIGATORIA DE `.md`
- **Cumplimiento Estricto:** Toda intervención, diagnóstico, solicitud de usuario o cambio técnico se documenta inmediatamente en las bitácoras del proyecto.
- **Aislamiento Git:** Carpetas y bitácoras de desarrollo local (`.agents/`, `Agents/`, `Workflow/`, `Datos_del_Proyecto/`, `AGENTS.md`, `SESSION_CONTEXT.md`, `SESSION_HILO.md`) excluidas permanentemente por `.gitignore`.
- **Excepción Solicitada en Git:** La carpeta `Backup/` y sus archivos `.tar`, `.sql` están explícitamente permitidos para persistencia histórica en el repositorio.
- **Persistencia Física:** Vaciado de búfer con `sync` en Linux tras cada ciclo de trabajo.

---

### 💾 1. SCRIPTS DE RESPALDO Y RESTAURACIÓN INTELIGENTE (ENTREGADOS)

#### A. Script de Respaldo Automatizado (`backup_db.sh`):
* **Ruta:** `backup_db.sh` (con permisos de ejecución `+x`).
* **Destino:** Carpeta `Backup/` versionada en Git.
* **Operación:**
  - Extrae volcado limpio de PostgreSQL (`pg_dump -U postgres -d mtt_db --clean --if-exists --no-owner --no-privileges`).
  - Genera archivo `.sql` y lo empaqueta en un `.tar` con metadatos.
  - Actualiza automáticamente `Backup/latest.tar` y `Backup/latest.sql`.
* **Prueba en Vivo:** Respaldo generado `Backup/mtt_db_backup_20261113_071236.tar` (860 KB, 2.187 MTTs, 100% íntegro).

#### B. Script Inteligente de Restauración (`restore_db.sh`):
* **Ruta:** `restore_db.sh` (con permisos de ejecución `+x`).
* **Características Clave:**
  - **Detección Automática:** Escanea `Backup/` y `backend/` mostrando menú interactivo numerado con tamaños y fechas de creación.
  - **Modo No Interactivo:** Permite ejecución por CLI: `./restore_db.sh --yes Backup/latest.tar`.
  - **Streaming Tar:** Extrae el SQL interno en memoria usando tubería con `tar --wildcards -xOf` directamente hacia `docker exec -i mtt-database psql`. Cero archivos temporales en disco.
  - **Re-indexación Automática:** Tras la carga del dump, ejecuta inmediatamente `backend/optimizations_indexes.sql` para reactivar los 12 índices B-Tree.
  - **Sincronización Redis:** Ejecuta `FLUSHALL` en `mtt-redis` para evitar que la interfaz sirva registros cacheados obsoletos.
* **Prueba en Vivo:** Restauración probada con éxito. Telemetría post-restauración: 2.187 MTTs, 1 Usuario activo, 12 índices activos, Redis purgado.

---

### 🚢 2. VALIDACIÓN DE DOCKER AGNÓSTICO PARA MIGRACIÓN A SERVIDOR FÍSICO / VPS

Todo el stack fue auditado para garantizar portabilidad inmediata al 100%:

1. **Rutas Relativas en Todo el Ecosistema:**
   - `docker-compose.yml` utiliza únicamente montajes relativos (`./frontend`, `./backend`, `./data/pgdata`, `./backend/mtt_db_backup.sql`, `./backend/optimizations_indexes.sql`).
   - Cero dependencias de nombres de usuario o rutas absolutas locales (`/home/anthony/...`).
2. **Auto-Aprovisionamiento en Servidor Vacío:**
   - La base de datos monta los scripts en `/docker-entrypoint-initdb.d/`:
     - `01_backup.sql`: Restaura automáticamente la BD completa.
     - `02_indexes.sql`: Crea los 12 índices B-Tree de alta velocidad.
3. **Red Interna Aislada y DNS Dinámico:**
   - Los contenedores se comunican por DNS de red Docker (`mtt-net`): `mtt-backend`, `mtt-database`, `mtt-redis`.
   - Nginx utiliza `resolver 127.0.0.11 valid=30s ipv6=off;` evitando errores si los contenedores cambian de IP interna.
4. **Soporte Multi-IP en Nginx (`server_name`):**
   - Configurado con `server_name _ localhost 171.0.40.7;`. Responde a cualquier IP física asignada al servidor sin requerir reconfiguración.
5. **Paquete Autocontenido Generado:**
   - `sincomtt_vps_bundle_20261113_071258.tar.gz` (4.6 MB) listo para transferir vía `scp` y desplegar con `docker compose up -d --build`.

---

### 💻 3. ARQUITECTURA DE SINCRONIZACIÓN MULTI-MÁQUINA PERSONAL (`sync_laptop.sh`)
Para permitir que el usuario trabaje alternadamente entre su **PC Linux de escritorio, PC Windows de escritorio y Laptop**, se creó una solución de doble remote:
* **Repositorio Oficial (`origin`):** Se mantiene limpio, exclusivo para el equipo de desarrollo/Soporte-IT de CANTV, protegido por `.gitignore`.
* **Repositorio Personal Privado (`personal`):** Repositorio privado del usuario donde se almacena un snapshot completo del entorno, incluyendo `.agents/`, `Agents/`, `Workflow/`, `SESSION_CONTEXT.md` y la memoria de Antigravity.
* **Script de Un Solo Toque:** [sync_laptop.sh](file:///home/anthony/DiscoSecundario/proyecto/CANTV-MMT/sync_laptop.sh):
  - `./sync_laptop.sh push`: Conmuta automáticamente a la rama `workspace/laptop-sync`, fuerza el rastreo de carpetas locales y las sube a `personal`.
  - `./sync_laptop.sh pull`: Descarga las actualizaciones en la laptop y refresca el contexto del agente.
* **Protección en Git:** `sync_laptop.sh` y `sync_personal.sh` están formalmente ignorados en `.gitignore` (Commit `3857f87`).

---

### 📋 4. HOJA DE RUTA Y TAREAS ENLISTADAS (PARA MAÑANA Y SIGUIENTES HITOS)

#### Bloque A: Automatización de Generación de Códigos MTT (Análisis de Mañana)
- [ ] **TAREA-01: Estructura de Tabla de Correlativos Parroquiales:**
  - Diseñar tabla `mtt_secuencias_parroquia` (`id`, `parroquia_id`, `codigo_ubigeo_6d`, `ultimo_correlativo`, `updated_at`).
  - Pre-poblar los correlativos iniciales a partir de los 2.187 registros existentes.
- [ ] **TAREA-02: Función Transaccional de Asignación Automática:**
  - Implementar lógica atómica (`SELECT ... FOR UPDATE`) que genere el código oficial censal `XXXXXX.YY` sin margen de colisión.
- [ ] **TAREA-03: Integración en Frontend:**
  - Sugerencia automática de código en Bandeja GDC con confirmación ágil.

#### Bloque B: Generador de QR Oficial y Vista de Validación
- [ ] **TAREA-04: Motor de Generación QR Real:**
  - Generación de código QR real embebible en PDF y carnetización institucional.
- [ ] **TAREA-05: Vista Pública de Validación de QR:**
  - Ruta pública `/validar-mtt/:codigo` para verificación en tiempo real de la vigencia del acta.

#### Bloque C: Matriz de Roles y Permisos (RBAC Institucional)
- [ ] **TAREA-06: Configuración de Roles Formales (Niveles 1 al 5):**
  - Promotor/a, Coordinador/a, Gerente Regional, Consultor GDC, Consultor GPACyG, Gerente de Línea / Usuario Consulta.

---

### 📦 4. ESTADO DE GIT Y COMISIÓN LOCAL
* **Último Commit:** `b21b7dd` (`feat(backup): add automated backup and intelligent restore scripts with repository persistence`).
* **Archivos Confirmados:**
  - `.gitignore` (excepciones para Backup/)
  - `backup_db.sh`
  - `restore_db.sh`
  - `package_for_vps.sh`
  - `frontend/nginx.conf`
  - `Backup/latest.tar`, `Backup/latest.sql`, `Backup/mtt_db_backup_20261113_071236.tar`, `Backup/mtt_db_backup_20261113_071236.sql`
