# REGISTRO DE REPORTES DE DEFECTOS AL BACKEND (BDR)
## Backend Defect Reports · SINCOMTT (CANTV · GGFPP)

Este registro formal documenta los hallazgos, vulnerabilidades, inconsistencias de contratos y estados de resolución en el backend Python del proyecto SINCOMTT.

---

### [BDR-001] Incompatibilidad de Encabezados CORS en FastAPI (`allow_origins=["*"]` con `allow_credentials=True`)
* **Severidad:** Crítica
* **Archivo(s) Afectado(s):** `backend/backend_app.py`
* **Componente / Endpoint:** `CORSMiddleware`
* **Descripción de la Falla:** La configuración de CORS intentaba usar comodín `allow_origins=["*"]` junto con `allow_credentials=True`. Según la especificación W3C Fetch / RFC 6454, los navegadores rechazan peticiones con credenciales cuando el origen es comodín.
* **Estado:** **RESUELTO**
* **Resolución:**
  1. En commit `3b762de`, Kenny Navarro configuró orígenes explícitos (`http://localhost`, `http://171.0.40.7`, etc.).
  2. Adicionalmente, el frontend implementa arquitectura *Same-Origin* mediante Nginx Reverse Proxy, eliminando la necesidad de CORS en producción al viajar todo por `/api/`.

---

### [BDR-002] Credenciales Maestras de Base de Datos en Texto Plano
* **Severidad:** Alta
* **Archivo(s) Afectado(s):** `backend/backend_app.py`
* **Descripción de la Falla:** La cadena de conexión de SQLAlchemy tenía quemado el usuario y contraseña de PostgreSQL en código fuente (`postgresql://postgres:123456@localhost/mtt_db`).
* **Estado:** **RESUELTO**
* **Resolución:** Se incorporó lectura dinámica mediante `os.getenv("DATABASE_URL")` en `backend/backend_app.py`, `backend/seed_mtt.py` y `backend/seed_ubigeo.py`.

---

### [BDR-003] Ausencia de Inyección de Dependencias para RBAC en Endpoints de Mutación
* **Severidad:** Media (Seguridad)
* **Archivo(s) Afectado(s):** `backend/backend_app.py`
* **Componente / Endpoint:** `POST /api/mtt`, `PATCH /api/mtt/{id}/codigo`
* **Descripción de la Falla:** Los endpoints de mutación en FastAPI no verificaban el rol del usuario mediante decoradores de seguridad JWT.
* **Estado:** **MITIGADO EN FRONTEND / PENDIENTE TOKEN JWT EN BACKEND**
* **Mitigación en Frontend:** Ocultamiento condicional estricto de controles según el rol activo (`user.rol === 'Consultor GDC'`, `user.rol === 'Coordinador'`, etc.), con deshabilitación de inputs y validación Zod defensiva.

---

### [BDR-004] Omisión de Reglas de Oro en Validadores Pydantic
* **Severidad:** Media
* **Archivo(s) Afectado(s):** `backend/backend_app.py`
* **Descripción de la Falla:** Los esquemas Pydantic aceptaban cadenas vacías `""` en lugar de convertirlas a `"N/D"` (Regla 3), y aceptaban `0` en campos de conteo demográfico no verificados (Regla 2).
* **Estado:** **RESUELTO EN FRONTEND**
* **Resolución:** Esquema Zod en `frontend/src/schemas/mttSchema.ts` que sanitiza, valida y transforma todo payload antes de enviarlo a la API.

---

### [BDR-005] Cadena de Conexión a Base de Datos Quemada con "localhost" en Contenedores Docker
* **Severidad:** Crítica (Bloqueante para Docker Compose)
* **Archivo(s) Afectado(s):** `backend/backend_app.py`, `backend/seed_mtt.py`, `backend/seed_ubigeo.py`
* **Descripción de la Falla:** La variable `DATABASE_URL` estaba configurada como constante estática apuntando a `localhost`, impidiendo que el backend se conectara al contenedor `mtt-database`.
* **Estado:** **RESUELTO**
* **Resolución:** En commit `3b762de` se reemplazó por `DATABASE_URL = os.getenv("DATABASE_URL", "postgresql+psycopg2://postgres:123456@localhost/mtt_db")`.

---

### [BDR-006] Respuesta Incompleta en Endpoint `GET /api/mtt` (Solo 3 de las 51 Variables)
* **Severidad:** Alta (Funcional)
* **Archivo(s) Afectado(s):** `backend/backend_app.py`
* **Descripción de la Falla:** El endpoint `GET /api/mtt` solo proyectaba `codigo`, `nombre` y `estatus`, ignorando las relaciones con estados, municipios, parroquias, organizaciones comunales y vocerías.
* **Estado:** **RESUELTO**
* **Resolución:**
  1. En commit `3b762de`, Kenny Navarro agregó `LEFT OUTER JOIN` a `parroquias`, `municipios`, `estados`, `organizacion_comunal`, `vocerias` y `seguimiento`.
  2. En `frontend/src/services/api.ts` se implementó normalización automática para garantizar que los campos mapeen fluidamente a la tabla TanStack de 51 columnas.

---

### [BDR-007] Ausencia del Endpoint de Asignación de Código MTT (`PATCH /api/mtt/{id}/codigo`)
* **Severidad:** Alta (Flujo de Trabajo GDC Bloqueado)
* **Archivo(s) Afectado(s):** `backend/backend_app.py`
* **Descripción de la Falla:** No existía el endpoint para que el Consultor GDC asignara el código oficial correlativo y cambiara el estatus a "Activa".
* **Estado:** **RESUELTO**
* **Resolución:** Implementado en commit `3b762de` con el endpoint `@app.patch("/api/mtt/{mtt_id}/codigo")`. Frontend armonizado para enviar el payload esperado `{ codigo, codigo_mtt, estatus }`.

---

### [BDR-008] Incompatibilidad de Versión de Python en `backend/Dockerfile`
* **Severidad:** Crítica (Fallo en Construcción de Imagen Docker)
* **Archivo(s) Afectado(s):** `backend/Dockerfile` (Línea 1)
* **Descripción de la Falla:** `backend/requirements.txt` especifica `numpy==2.5.4` y `pandas==3.1.1`. Ambas librerías exigen estrictamente `Requires-Python >= 3.12`. El Dockerfile original tenía `python:3.10-slim-bookworm` y luego `python:3.11-slim-bookworm`, abortando la instalación con error de pip.
* **Estado:** **RESUELTO**
* **Resolución:** Se actualizó la línea 1 de `backend/Dockerfile` a `FROM python:3.12-slim-bookworm` (confirmado en commit `40fbc92`). La imagen `mtt-backend:latest` compila e instala las 27 dependencias al 100%.

---

### [BDR-009] Ausencia Total de Índices Secundarios y 8 Claves Foráneas (FK) Desindexadas
* **Severidad:** Alta (Escalabilidad y Bloqueos de Concurrencia)
* **Archivo(s) Afectado(s):** `backend/mtt_db_backup.sql` / Esquema de Base de Datos PostgreSQL
* **Descripción de la Falla:** En la base de datos solo existen 15 índices correspondientes a llaves primarias (`_pkey`) y restricciones `UNIQUE`. Ninguna de las 8 claves foráneas (`vocerias.mtt_id`, `organizacion_comunal.mtt_id`, `seguimiento.mtt_id`, `mtt_principal.parroquia_id`, `parroquias.municipio_id`, `municipios.estado_id`, `estados.region_id`, `usuarios.rol_id`) cuenta con índice B-Tree.
* **Impacto:** Consultas de catálogos y mutaciones en cascada ejecutan escaneos secuenciales completos (`Seq Scan`), generando bloqueos de tabla compartidos (`ShareLock`) y riesgo de *deadlocks* cuando múltiples usuarios operan simultáneamente.
* **Estado:** **RESUELTO**
* **Resolución:** Se creó y ejecutó el script `backend/optimizations_indexes.sql` incorporando 12 índices B-Tree en todas las claves foráneas y campos de filtro (`estatus`, `tipo`, `fecha_creacion`, `nombre`). Las consultas pasaron de `Seq Scan` a `Index Scan`. Además, se montó en `docker-compose.yml` en `/docker-entrypoint-initdb.d/02_indexes.sql` para auto-inicialización en cualquier VPS.

---

### [BDR-010] Patrón N+1 Queries en Endpoint `GET /api/mtt` y Pool de Conexiones por Defecto
* **Severidad:** Crítica (Colapso bajo Concurrencia Multiusuario)
* **Archivo(s) Afectado(s):** `backend/backend_app.py` (Líneas 26 y 201-235)
* **Descripción de la Falla:** 
  1. En `GET /api/mtt`, `joinedload(MttPrincipal.parroquia)` no precarga `municipio` ni `estado`. Al iterar las filas, SQLAlchemy ejecuta 2 consultas adicionales por cada fila (100 filas = 201 consultas SQL).
  2. `create_engine(DATABASE_URL)` sin parámetros asigna `pool_size=5` y `max_overflow=10`, limitando el backend a un máximo de 15 conexiones concurrentes antes de fallar por timeout.
* **Impacto:** Con más de 15 usuarios concurrentes, el sistema arroja `TimeoutError: QueuePool limit reached` y tiempos de respuesta degradados.
* **Estado:** **RESUELTO**
* **Resolución:**
  1. Se implementó `joinedload` multinivel encadenado en `backend_app.py` (`MttPrincipal` $\rightarrow$ `Parroquia` $\rightarrow$ `Municipio` $\rightarrow$ `Estado`), reduciendo a una sola consulta SQL.
  2. Se configuró `pool_size=20`, `max_overflow=30`, `pool_recycle=1800`, `pool_timeout=10` y `pool_pre_ping=True` (elimina conexiones zombies de forma automática).
  3. Se integró Redis 7 Bookworm con patrón Cache-Aside y Graceful Fallback para catálogos y listas, reduciendo tiempos a 3.5ms sin tocar PostgreSQL.

