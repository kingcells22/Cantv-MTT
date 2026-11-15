# SESSION_CONTEXT · BITÁCORA DE RELEVO Y SINCRONIZACIÓN
## Proyecto SINCOMTT (CANTV · GGFPP · FIIIDT)

### 📅 Fecha de Sesión: 2026-11-15 (Actualizado: 11:18 -04:00)
* **Sistema Operativo / Entorno:** Linux (Ubuntu x86_64) en `/home/anthony/Documentos/Proyectos/cantv-mtt-workspace`
* **IP Servidor Físico / VPS:** `171.31.100.144` (Acceso Web: `http://171.31.100.144` y Dominio `http://cantvprueba.fii.gob.ve`)
* **Proxy Perimetral FII:** `171.0.40.4` (OpenResty enrutando al servidor físico)
* **Repositorio Remoto Oficial:** `https://github.com/kingcells22/Cantv-MTT.git`
* **Rama de Trabajo Actual:** `workspace/laptop-sync` (Commit `d9a7ab9` sincronizado en GitHub)
* **Agente Activo:** `SINCOMTT-FrontendArchitect`
* **Estado Operativo:** **PAQUETE MAESTRO DE PRODUCCIÓN GENERADO Y SINCRONIZADO EN REPOSITORIO** (`sincomtt_vps_bundle_20261115_111526.tar.gz` de 8.0 MB, 36 índices PostgreSQL 16, 2.563 MTTs, 2.384 coordenadas GPS, 742 correos electrónicos, autogeneración censal GDC O(log N)). Listo para despliegue en servidor de pruebas.

---

### ⭐ REGLA DE ORO DE GOBERNANZA: ACTUALIZACIÓN OBLIGATORIA DE `.md`
- **Cumplimiento Estricto:** Toda intervención, diagnóstico, solicitud de usuario o cambio técnico se documenta inmediatamente en las bitácoras del proyecto.
- **Aislamiento Git:** Carpetas y bitácoras de desarrollo local (`.agents/`, `Agents/`, `Workflow/`, `Datos_del_Proyecto/`, `AGENTS.md`, `SESSION_CONTEXT.md`, `SESSION_HILO.md`) excluidas permanentemente por `.gitignore`.
- **Excepción Solicitada en Git:** La carpeta `Backup/` y sus archivos `.tar`, `.sql` están explícitamente permitidos para persistencia histórica en el repositorio.
- **Persistencia Física:** Vaciado de búfer con `sync` en Linux tras cada ciclo de trabajo.

---

### 🚀 1. HITOS ALCANZADOS EN ESTA INTERVENCIÓN

#### A. Barrido Exhaustivo y Fusión 100% de Archivos (`DATA_CORREGIDA_11-11-26`):
1. **Consolidación Total de Registros (2.563 MTTs):**
   - 2.485 MTTs activas provenientes de la Hoja 1 del Consolidado de Noviembre 2026 y VER8.
   - 77 MTTs cerradas, fusionadas y casos especiales con su historial y bitácora completa en `observacion`.
   - 1 MTT adicional recuperada del formato VER8.
   - **Total:** 2.563 MTTs (100% de la existencia histórica de CANTV GGFPP integrada).
2. **Enriquecimiento con Variables Reales de los Archivos:**
   - **2.384 coordenadas GPS de alta precisión (`latitud`, `longitud`):** Extraídas de la Columna O de VER8 (ej. `10.51850966, -66.94697945`).
   - **742 correos electrónicos oficiales de MTT:** Normalizados desde VER8 y Consolidado.
   - **2.536 fechas de cambio de estatus:** Trazabilidad histórica completa.
   - **2.479 centrales CANTV asignadas:** Vínculo de infraestructura de telecomunicaciones (`central_cantv_cercana`).
   - **2.496 clasificaciones CEC / Comuna:** Segmentación territorial (`cec_comuna`: COMUNA o CIRCUITO COMUNAL).
   - **Redes Sociales:** Registrados handles y usuarios de X, Instagram, Facebook y TikTok para las MTTs activas.
   - **170 Nodos GPON y Centrales:** Catálogo referencial en `frontend/src/data/nodos.json`.
3. **Estructura Geográfica Oficial INE (100% Pura):**
   - 1.137 Parroquias con su código oficial INE de 6 dígitos (`codigo_ubigeo`).
   - 338 Municipios oficiales INE.
   - 26 Entidades (24 Estados + Dto. Capital + Dep. Federales).
   - 7 Regiones administrativas CANTV.
4. **Talento Humano GGFPP Sincronizado:**
   - 112 usuarios y promotores/coordinadores institucionales cargados con sus niveles RBAC (1 a 7) + 1 usuario administrador (`admin_gdc`).
5. **Secuencias de Código Censal Precalculadas:**
   - 715 secuencias en `mtt_secuencias_parroquia` y `parish_sequences.json`, precargando el máximo correlativo por parroquia para generación atómica sin bloqueos.

#### B. Plan Maestro de 36 Índices en PostgreSQL 16 (`optimizations_indexes.sql`):
1. **Claves Foráneas (9 Índices):** Erradicación de locks y deadlocks en `vocerias`, `organizacion_comunal`, `seguimiento`, `mtt_principal`, `parroquias`, `municipios`, `estados`, `usuarios` y `mtt_secuencias_parroquia`.
2. **Identificadores y Códigos (5 Índices):** Búsqueda instantánea $O(\log N)$ para `codigo_mtt`, `codigo_ubigeo`, `codigo_ubigeo_6d`, `comuna_codigo`, y `consejo_situr`.
3. **Telecomunicaciones y Nuevos Campos (5 Índices):** `central_cantv_cercana`, `nombre_nodo`, `huella_gpon`, `correo_electronico`, y `cec_comuna`.
4. **Identidad y Auditoría (4 Índices):** `v1_cedula`, `v2_cedula`, `usuarios.cedula`, `usuarios.usuario`.
5. **Búsqueda Rápida Case-Insensitive (6 Índices Funcionales):** `LOWER(nombre)` en `mtt_principal`, `parroquias`, `municipios`, `estados`, y `LOWER()` en `comuna_nombre` y `consejo_nombre`.
6. **Bandejas y Filtros Compuestos (6 Índices):** `idx_mtt_territorio_estatus (parroquia_id, estatus)`, `estatus`, `tipo`, `fecha_creacion DESC`, `fecha_cambio_estatus DESC`, `verificado_gerencia`.
7. **Geolocalización (1 Índice):** `idx_mtt_principal_coords (latitud, longitud)` para mapas y cuadrículas cartográficas.
8. **Estadísticas del Optimizador:** `ANALYZE` ejecutado en las 11 tablas del sistema.

---

### 📦 2. ARTEFACTOS Y ARCHIVOS ACTUALIZADOS

1. **Frontend:**
   - `frontend/src/data/ubigeo_ine.json` (1.137 parroquias puras INE).
   - `frontend/src/data/mtt_dataset.json` (2.563 MTTs completas con coordenadas GPS, correos, centrales, etc.).
   - `frontend/src/data/parish_sequences.json` (715 secuencias precalculadas).
   - `frontend/src/data/nodos.json` (170 nodos y centrales GPON).
   - `frontend/src/types/mtt.ts` (esquema TypeScript con todas las variables nuevas).
   - `frontend/src/schemas/mttSchema.ts` (esquema Zod con validación estricta y defensiva).
   - `frontend/src/hooks/useUbigeo.ts` (hook tolerante a acentos con autocompletado y cálculo de correlativo).
   - `frontend/src/components/views/BandejaGdcView.tsx` (prefijo Ubigeo 6D bloqueado, sufijo `.YY` editable, badge PENDIENTE GDC).
   - `frontend/src/components/views/MatrizDatosView.tsx` (badge PENDIENTE GDC y monospace azul).

2. **Backend & Base de Datos:**
   - `backend/mtt_db_backup.sql` (volcado limpio PostgreSQL 16 de 4.52 MB con auto-aprovisionamiento, 2.563 MTTs y 36 índices).
   - `backend/optimizations_indexes.sql` (script maestro independiente con los 36 índices y comandos ANALYZE).
   - `Backup/latest.sql` y `Backup/latest.tar` (respaldo de producción actualizado para `restore_db.sh`).
   - `Agents/BDR_REGISTRO_DEFECTOS.md` (BDR-011 y BDR-012 documentados).
