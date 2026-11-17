# PLAN MAESTRO DE EJECUCIÓN, BACKEND, FRONTEND Y CIBERSEGURIDAD (PLANE BACKLOG)
## Proyecto: SINCOMTT · CANTV (GGFPP) · FIIIDT

**Propósito del Documento:** Matriz integral de seguimiento (Épicas e Historias/Tareas para carga en herramienta **Plane**) que consolida todo el trabajo completado para la **Fase de Pruebas Piloto con personal de CANTV** y la hoja de ruta pendiente para el **Paso a Producción Definitiva**.

---

## Resumen Ejecutivo por Área

| Épica | Área Técnica | Estado Actual (Pruebas Piloto) | Tareas Listas | Tareas Pendientes Producción |
| :--- | :--- | :--- | :---: | :---: |
| **ÉPICA 1** | Infraestructura, Docker y Red Same-Origin | ✅ Operativo en Contenedores Debian | 4 | 3 |
| **ÉPICA 2** | Base de Datos PostgreSQL 16, Redis 7 e Integridad | ✅ Operativo (2.557 MTTs · 58 Índices) | 4 | 2 |
| **ÉPICA 3** | Backend API REST (FastAPI · Python 3.12) | ⚠️ Parcial (Endpoints base activos) | 2 | 3 |
| **ÉPICA 4** | Frontend SPA (React 19 + TypeScript + Tailwind) | ✅ Operativo (Modos híbridos activos) | 6 | 3 |
| **ÉPICA 5** | Ciberseguridad (Zero-Trust · NIST SP 800-63B · OWASP) | ✅ Protegido para Pruebas Piloto | 7 | 3 |
| **ÉPICA 6** | Gestión de Pruebas Piloto CANTV (QA) | 🔄 En Ejecución | 0 | 3 |

---

## ÉPICA 1: Infraestructura, Contenedores Docker y Red Same-Origin

### Completado (Operativo para Pruebas Piloto)
* **[INFRA-01] Ecosistema de 4 Contenedores Debian Bookworm (`docker-compose.yml`):**
  * `mtt-frontend`: Nginx Bookworm + compilado estático React 19 / Vite.
  * `mtt-backend`: Python 3.12 Slim Bookworm + FastAPI + Uvicorn.
  * `mtt-database`: PostgreSQL 16 Bookworm con volumen persistente `./data/pgdata`.
  * `mtt-redis`: Redis 7 Bookworm configurado con `--appendonly yes --maxmemory 128mb --maxmemory-policy allkeys-lru`.
* **[INFRA-02] Arquitectura Same-Origin y Aislamiento (`mtt-net`):** Tráfico `/api/` canalizado internamente por Nginx hacia `http://mtt-backend:8000` mediante DNS interno Docker (`127.0.0.11`). Puertos `5432`, `6379` y `8000` aislados sin exposición pública al host.
* **[INFRA-03] Scripts de Portabilidad y Respaldo:** Implementados `backup_db.sh`, `restore_db.sh` (con verificación de índices y purga automática de Redis `FLUSHALL`) y `package_for_vps.sh`.
* **[INFRA-04] Aislamiento de Ramas Git:** Rama corporativa `feature/frontend-react19` depurada exclusivamente con código fuente, Dockerfiles, respaldos oficiales SQL y documentación técnica pública.

### Pendiente (Paso a Producción Definitiva)
* **[INFRA-05] Gestión Externa de Secretos (`.env`):** Mover contraseña de PostgreSQL (`POSTGRES_PASSWORD`), URLs de conexión y credenciales SMTP fuera de `docker-compose.yml` hacia variables de entorno protegidas en servidor.
* **[INFRA-06] Backups Automáticos Programados (`cron`):** Configurar tarea programada diaria con `backup_db.sh` y política de retención rotativa externa.
* **[INFRA-07] Endurecimiento TLS / HSTS:** Verificar renovación automática de certificados SSL/TLS en el proxy perimetral y activar cabecera `Strict-Transport-Security`.

---

## ÉPICA 2: Base de Datos PostgreSQL 16, Redis 7 e Integridad de Datos

### Completado (Operativo para Pruebas Piloto)
* **[DB-01] Modelo Relacional Normalizado (12 Tablas):** `regiones` (7), `estados` (26), `municipios` (338), `parroquias` (1.137 con código Ubigeo INE 6D), `roles` (8), `usuarios` (122), `mtt_principal`, `organizacion_comunal`, `vocerias`, `seguimiento`, `mtt_secuencias_parroquia` (715 secuencias) y `configuracion_sistema`.
* **[DB-02] Saneamiento Integral e Integridad (`2.557` MTTs puras):** Erradicadas 4 filas residuales de encabezado/leyenda Excel y 2 duplicados exactos; corregido código con espacio en `id=2553` (`171001.01`, `parroquia_id=733`). Verificado `0` registros huérfanos entre `mtt_principal` y tablas hijas (`organizacion_comunal`, `vocerias`, `seguimiento`), y `0` códigos duplicados.
* **[DB-03] Plan Maestro de Indexación (58 Índices Activos):** Índices B-Tree en llaves primarias/foráneas, códigos censales (`codigo_mtt`, `codigo_ubigeo`), búsquedas funcionales `LOWER()`, geolocalización (`latitud`, `longitud`), cédulas de voceros, correos y tokens de recuperación, con estadísticas recalculadas vía `VACUUM ANALYZE`.
* **[CACHE-01] Caché Cache-Aside con Redis 7 (`backend_app.py`):** Caché activo de catálogos INE (`/api/catalogos/*`, TTL 24h) y listado MTT (`/api/mtt`, TTL 2 min) con invalidación automática al crear/asignar códigos y fallback transparente a PostgreSQL si Redis no responde.

### Pendiente (Paso a Producción Definitiva)
* **[DB-04] Validación de 16 MTTs con Código Municipal `XXYY00` / `061005`:** Definir con Gerencia Regional y Consultores GDC si las 16 MTTs históricas con `parroquia_id = NULL` permanecen como excepción histórica o se reasignan a una parroquia específica del catálogo INE.
* **[DB-05] Tabla de Auditoría Inmutable (`audit_logs`):** Incorporar tabla transaccional para registrar inserciones, ediciones, aprobaciones regionales, asignaciones GDC, reseteos de clave y cambios de estatus de usuarios con marca temporal e IP origen.

---

## ÉPICA 3: Backend API REST (FastAPI · Python 3.12)

### Completado (Operativo en `backend/backend_app.py`)
* **[BE-01] Pool SQLAlchemy de Alto Rendimiento y Fin de N+1:** Configurado `pool_size=20`, `max_overflow=30`, `pool_pre_ping=True`, `pool_recycle=1800` y carga relacional encadenada mediante `joinedload`.
* **[BE-02] Endpoints Base Activos:**
  * Autenticación: `POST /api/login` (validación `bcrypt.checkpw()`), `POST /api/usuarios`.
  * Catálogos cacheados: `GET /api/catalogos/estados`, `/municipios/{estado_id}`, `/parroquias/{municipio_id}`.
  * Operación MTT: `GET /api/mtt`, `POST /api/mtt`, `PATCH /api/mtt/{mtt_id}/codigo`.

### Pendiente Crítico en Backend Python (Requerido para Producción)
* **[BE-03] Autenticación JWT y Control RBAC en Endpoints (`BDR-003`):**
  * Emitir token JWT firmado al hacer login válido en `POST /api/login`.
  * Proteger todas las rutas con dependencias FastAPI (`Depends(get_current_user)` y verificación estricta de `rol_id` por endpoint).
* **[BE-04] Endpoints de Administración SMTP, Usuarios y Recuperación (`BDR-013` / `BDR-014`):**
  * Actualizar `backend/models.py` (`Usuario` con `nombre`, `cedula`, `correo_institucional`, `must_change_password`, `reset_token_hash`, `reset_token_expires_at`; modelos `ConfiguracionSistema` y `MttSecuenciaParroquia`).
  * Implementar `GET /api/config/smtp`, `PUT /api/config/smtp` y `POST /api/config/smtp/test` con despacho real vía `smtplib` (TLS/SSL).
  * Implementar `GET /api/usuarios`, `PUT /api/usuarios/{id}/password` y `PATCH /api/usuarios/{id}/estatus` (activación/suspensión persistente en PostgreSQL).
  * Implementar `POST /api/auth/recuperar-clave` y `POST /api/auth/reset-clave` con generación CSPRNG, hash SHA-256, TTL de 15 minutos y revocación en Redis.
* **[BE-05] Endpoints Completos del Ciclo MTT y Catálogo (`BDR-011` / `BDR-014`):**
  * Implementar `PUT /api/mtt/{id}` para guardar edición de vocerías y validaciones/devoluciones regionales directamente en PostgreSQL.
  * Implementar `GET /api/mtt/siguiente-codigo/{parroquia_id}` con bloqueo `WITH FOR UPDATE` sobre `mtt_secuencias_parroquia` para evitar colisiones de correlativos.
  * Eliminar límite fijo `.limit(100)` de `GET /api/mtt` añadiendo paginación real (`limit`/`offset`) y proyectar las 51 columnas completas.
  * Alinear nomenclatura de roles IDs 6 y 7 en `public.roles` y añadir el dominio oficial de pruebas/producción en `CORSMiddleware`.

---

## ÉPICA 4: Frontend SPA (React 19 + TypeScript + Tailwind CSS)

### Completado (Desplegado para Pruebas Piloto)
* **[FE-01] Formulario Normativo de 5 Bloques (51 Variables):** Validación Zod estricta (`mttSchema.ts`), indicadores visuales obligatorios (`*`), cálculo automático de `ano_creacion` y `total_voceros`, y sanitización automática bajo las 4 Reglas de Oro (`null`, `«N/D»`, `«SIN OBSERVACIÓN»`).
* **[FE-02] Ubigeo INE 2026 en Cascada:** Combos limpios sin prefijos numéricos (`Bloque2Comunal.tsx`) y resolución automática del entero `parroquia_id` contra `/api/catalogos/*` antes de enviar `POST /api/mtt`.
* **[FE-03] Vistas Operativas por Flujo Institucional:** `DashboardView`, `RegistroView`, `ActualizacionView`, `BandejaRegionalView`, `BandejaGdcView` (prefijo 6D bloqueado + sufijo `.YY` + sugerencia correlativa), y `MatrizDatosView` (TanStack Table v8 con 51 columnas y exportación).
* **[FE-04] Persistencia Híbrida Resiliente (`useMTTStorage.ts` + `api.ts`):** Sincronización en segundo plano con `/api/mtt` y `/api/catalogos/estados`, escritura real en PostgreSQL mediante `POST /api/mtt` y `PATCH /api/mtt/{id}/codigo`, manteniendo disponibles los 2.557 registros completos.
* **[FE-05] Ficha PDF Oficial + Código QR Autónomo (`qrCode.ts`, `FichaPdfModal.tsx`, `App.tsx`):** Generador QR ISO/IEC 18004 en TypeScript puro, impresión limpia `@media print` y visor público en ruta `/verificar/:codigo`.
* **[FE-06] Panel Maestro de Administración (`SmtpConfigView.tsx` + `RecuperarPasswordModal.tsx`):** Gestión de pasarela SMTP, tabla de usuarios con columna **"Contraseña Activa"** + visor ocular, reseteo de claves y suspensión inmediata en sesión *(persistencia local hasta habilitar `[BE-04]`)*.

### Pendiente (Post-Implementación de Endpoints Backend)
* **[FE-07] Interceptor Axios con JWT:** Adjuntar `Authorization: Bearer <token>` automáticamente en todas las solicitudes e interceptar respuestas `401`/`403` para cerrar sesión expirada.
* **[FE-08] Conexión Directa de Panel Administrativo y Edición Regional a FastAPI:** Migrar `SmtpConfigView`, `RecuperarPasswordModal`, `ActualizacionView` y `BandejaRegionalView` desde almacenamiento local hacia `[BE-04]` y `[BE-05]`, retirando catálogos de contraseñas demo en cliente.
* **[FE-09] Gestión Documental Real de Actas PDF:** Subida de archivos PDF binarios (`multipart/form-data`) al servidor/almacenamiento institucional con descarga verificada desde Bandeja Regional y GDC.

---

## ÉPICA 5: Ciberseguridad Integral (Zero-Trust · NIST SP 800-63B · OWASP)

### Controles Ya Activos (En Pruebas Piloto)
* **[SEC-01] Zero-Trust DOM Gatekeeper (`App.tsx` + `AuthContext.tsx`):** Inicio estricto en `isAuthenticated = false`; desmontaje total de `Navbar`, `Sidebar`, vistas y datos del DOM mientras el usuario no esté autenticado.
* **[SEC-02] Expiración Temporal de Sesión (`15 min` - NIST SP 800-63B):** Monitor de inactividad con ventana deslizante, indicador visual de tiempo restante en `Navbar.tsx`, purga automática de `localStorage` y aviso institucional al expirar.
* **[SEC-03] Control Estricto de Identidad y Roles (`LoginModal.tsx` + `AuthContext.tsx`):** Eliminados botones de acceso rápido y selector `<select>` de roles; rol vinculado 1:1 a la cuenta autenticada con normalización `normalizeBackendRole()`.
* **[SEC-04] Hashes Bcrypt Cost 12 Verificados:** Contraseñas reales encriptadas con Bcrypt (cost 12) en PostgreSQL y `migration_smtp_superadmin.sql` para cuentas de prueba y administración (`HTTP 200 OK` en `/api/login`).
* **[SEC-05] Complejidad NIST y Anti-Enumeración (`RecuperarPasswordModal.tsx`):** Validación mínima de 12 caracteres (mayúscula, minúscula, número y símbolo), mensajes opacos OWASP anti-enumeración de usuarios y tokens de un solo uso (TTL 15 min).
* **[SEC-06] Encabezados de Seguridad HTTP OWASP en Nginx (`frontend/nginx.conf`):** Activos `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `X-XSS-Protection: 1; mode=block`, `Referrer-Policy` y `Content-Security-Policy` (`default-src 'self'`).
* **[SEC-07] Purga de Historial Git:** Eliminación criptográfica de archivos internos de trabajo en la rama corporativa `origin/feature/frontend-react19`.

### Pendiente (Requerido Antes de Producción Nacional)
* **[SEC-08] Rate Limiting y Protección Anti-Fuerza Bruta en Redis:** Limitar intentos fallidos consecutivos en `/api/login` y `/api/auth/recuperar-clave` por IP y por cuenta.
* **[SEC-09] Retiro de Claves Demo en Frontend + Cambio Obligatorio (`must_change_password`):** Al activar `[BE-03]` y `[BE-04]`, eliminar toda validación de contraseña en cliente y forzar el cambio de contraseña temporal al primer ingreso.
* **[SEC-10] Depuración del Padrón Heredado (`111` usuarios `u_*`):** Asignar credenciales nominales reales o desactivar cuentas históricas inactivas antes de abrir acceso nacional.

---

## ÉPICA 6: Plan de Pruebas Piloto con Personal CANTV (Fase Actual)

* **[QA-01] Entrega de Accesos Piloto a GGFPP:** Distribuir el documento oficial de credenciales de prueba para los 8 perfiles institucionales (Niveles 1 al 5) al equipo evaluador designado de CANTV.
* **[QA-02] Batería de Pruebas Funcionales y Seguridad (Evaluadores CANTV):**
  1. Verificar bloqueo de acceso inicial sin credenciales y expulsión automática tras 15 min de inactividad.
  2. Validar permisos y vistas diferenciadas por cada uno de los 8 perfiles RBAC.
  3. Registrar una nueva MTT completa (5 bloques), verificar persistencia en PostgreSQL / Matriz, aprobar en Bandeja Regional y asignar código oficial `XXXXXX.YY` en Bandeja GDC.
  4. Emitir Ficha PDF oficial y validar verificación pública mediante el código QR (`/verificar/:codigo`).
* **[QA-03] Levantamiento del Padrón Nominal Real CANTV:** Recopilar listado definitivo de funcionarios autorizados (Nombre completo, Cédula, Correo institucional `@cantv.com.ve`, Rol y Territorio) para sustituir las cuentas genéricas de prueba previo al pase a producción definitiva.
