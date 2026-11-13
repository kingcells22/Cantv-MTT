# WORKFLOW Y PROTOCOLOS DE DESARROLLO SINCOMTT
## Sistema Integral de Registro, Control y Consulta de Mesas Técnicas de Telecomunicaciones
### Entidades: CANTV · GGFPP · FIIIDT

---

## 1. Alcance y Arquitectura del Sistema
El sistema SINCOMTT centraliza el registro, auditoría, control territorial y consulta de las Mesas Técnicas de Telecomunicaciones (MTT) a nivel nacional en la República Bolivariana de Venezuela, sustituyendo los repositorios descentralizados en hojas de cálculo por una arquitectura web auditable, segura y de alto rendimiento.

### Topología de Red y Despliegue Unificado (VM Única Proxmox)
* **Despliegue:** Todo el sistema se orquesta mediante **Docker Compose** en contenedores basados en **Debian Bookworm** (preferido sobre Alpine para garantizar estabilidad de dependencias nativas, resolución glibc y compatibilidad total de librerías).
* **Same-Origin (Sin CORS):** El frontend corre en Nginx en el puerto 80 del host. Todo tráfico hacia `/api/` es reenviado de forma interna por Nginx hacia el contenedor de FastAPI (`http://mtt-backend:8000/api/`).
* **Aislamiento:** El backend FastAPI y la base de datos PostgreSQL 16 NO exponen puertos al host de la VM; solo se comunican en la red bridge interna `mtt-net`.

---

## 2. Playbooks de Acción para el Desarrollo

### Playbook 1: Construcción de Formularios de Alta Densidad (51 Variables)
1. **Desacoplamiento Modular en 5 Bloques:**
   - **Bloque 1:** Identificación y Estatus MTT (Columnas A - R).
   - **Bloque 2:** Organización Comunal y Demografía (Columnas S - AA).
   - **Bloque 3:** Información Técnica de Telecomunicaciones (Columnas AB - AF).
   - **Bloque 4:** Voceros y Voceras de la MTT (Columnas AG - AT).
   - **Bloque 5:** Control, Seguimiento y Verificación (Columnas AU - AY).
2. **Validación Zod Unificada:**
   - Toda entrada de usuario pasa por el esquema `mttSchema` antes de persistirse o enviarse a la API.
   - Manejo defensivo contra valores vacíos o strings incompletos aplicando estrictamente las 4 Reglas de Oro.
3. **Cálculos Reactivos en Cliente:**
   - La fecha de creación actualiza automáticamente el año de creación (`ano_creacion`).
   - La suma de voceras mujeres y voceros hombres calcula inmediatamente el `total_voceros`.

### Playbook 2: Ubigeo INE 2026 en Cascada
1. **Catálogo Oficial:** 1.137 parroquias distribuidas en 335 municipios y 24 entidades federales normalizadas por el INE.
2. **Flujo de Selección:**
   - Selección de Entidad Federal $\rightarrow$ filtra catálogo de municipios y limpia selectores inferiores.
   - Selección de Municipio $\rightarrow$ filtra catálogo de parroquias.
   - Selección de Parroquia $\rightarrow$ asigna automáticamente el código oficial `UBIGEO_PARROQUIA_INE` (6 dígitos) y el nombre normalizado.

### Playbook 3: Generación de Ficha Técnica PDF con Código QR
1. La Ficha Técnica Oficial resume el expediente de la MTT en los 5 bloques normativos.
2. Incorpora cintillo oficial de la República Bolivariana de Venezuela, CANTV y GGFPP.
3. Genera un código QR dinámico apuntando a la ruta de verificación oficial (`/verificar/${codigo_mtt}`).
4. Brinda capacidad de impresión limpia y exportación PDF mediante `@media print`.

### Playbook 4: Control de Acceso por Roles (RBAC)
Se gestionan 8 roles en 5 niveles:
* **Nivel 1:** Promotor / Promotora (Solo consulta de su territorio asignado).
* **Nivel 2:** Coordinador / Coordinadora (Registro, edición y carga de actas de su territorio).
* **Nivel 3:** Gerente Regional (Bandeja de validación preliminar / devolución con notas).
* **Nivel 4:** Consultor GDC (Asignación de código oficial MTT y control normativo) y Consultor GPACyG (Auditoría central).
* **Nivel 5:** Gerente de Línea, Gerente General y Usuario de Consulta (Dashboards analíticos, estadísticas, visualización nacional y exportación).

