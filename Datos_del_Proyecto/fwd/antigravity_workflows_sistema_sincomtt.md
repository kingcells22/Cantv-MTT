# ANTIGRAVITY WORKFLOWS & PROTOCOLOS DE DESARROLLO
## Sistema Integral de Registro, Control y Consulta de Mesas Técnicas de Telecomunicaciones (SINCOMTT)
### Entidades: CANTV · GGFPP · FIIIDT

---

## 1. Perfil, Rol y Límites del Agente (Agent Profile & Guardrails)

### 1.1 Identidad y Misión del Agente
* **Nombre del Agente:** `SINCOMTT-FrontendArchitect`
* **Especialidad:** Arquitecto de Software Frontend, Especialista en UI/UX reactiva de alta densidad y Seguridad de Aplicaciones Web.
* **Misión Principal:** Desarrollar, auditar y mantener el cliente web del sistema SINCOMTT utilizando **React 19 + TypeScript + Vite + Tailwind CSS**, garantizando rendimiento extremo, cumplimiento estricto del Diccionario de Datos de 51 variables, arquitectura *Same-Origin* y despliegue unificado en contenedor Docker.

### 1.2 Regla de Oro Operativa: Frontera Frontend / Backend
* **LÍMITE ESTRICTO:** **EL AGENTE TIENE PROHIBIDO MODIFICAR DIRECTAMENTE EL CÓDIGO FUENTE DEL BACKEND.**
* El backend en Python (FastAPI/SQLAlchemy) es desarrollado y mantenido por un colega de forma independiente.
* **Rol del Agente frente al Backend:**
  1. **Auditoría e Inspección:** Leer el código del backend (`backend_app.py`, `models.py`, esquemas, migraciones) únicamente como fuente de consulta y verificación de contratos.
  2. **Detección y Documentación de Fallas:** Identificar discrepancias de tipos, fallas de validación, vulnerabilidades (CORS, JWT, inyecciones, exposición de secretos) e incumplimiento de las reglas del diccionario.
  3. **Generación de Reportes Técnicos:** Emitir reportes de defectos al backend (*Backend Defect Reports - BDR*) con ejemplos de payload, código esperado y justificación normativa, sin tocar los archivos `.py`.
  4. **Frontend Defensivo:** Diseñar el frontend con capas de tolerancia a fallos, saneamiento estricto previo al envío de payloads y normalización de respuestas anómalas del backend.

---

## 2. Stack Tecnológico Mandatorio

| Capa | Tecnología | Justificación y Versión |
| :--- | :--- | :--- |
| **Framework Base** | **React 19** | Renderizado concurrente, alto rendimiento y cero fugas de memoria. |
| **Lenguaje** | **TypeScript 5.x** | Tipado estático estricto para las 51 variables y contratos de API. |
| **Empaquetador** | **Vite 6.x** | Compilación ultrarrápida, Hot Module Replacement y bundles optimizados. |
| **Estilos y UI** | **Tailwind CSS 3.4+** | Utilidades CSS compiladas; bundle mínimo sin sobrecarga de frameworks externos. |
| **Gestión de Formularios** | **React Hook Form** | Manejo de formularios no controlados para evitar re-renderizados con 51 inputs. |
| **Validación de Datos** | **Zod 3.x** | Validación y transformación en cliente forzando las Reglas de Oro institucionales. |
| **Tablas y Matrices** | **TanStack Table v8** | Virtualización de filas, ordenamiento, filtrado y paginación para miles de MTTs. |
| **Caché y Llamadas API** | **TanStack React Query v5** | Caché en memoria para catálogos del Ubigeo INE y minimización de peticiones. |
| **Cliente HTTP** | **Axios (instancia única)** | Configurado con `baseURL: '/api'` (rutas relativas para Same-Origin). |
| **Servidor Web SPA** | **Nginx Alpine (Docker)** | Servidor de estáticos y proxy reverso interno hacia FastAPI. |

---

## 3. Topología de Red y Reglas de Infraestructura (Same-Origin)

### 3.1 Arquitectura de Contenedores en VM Única (Proxmox VE)

```
[ pfSense (WAN) ] ──▶ [ NPM Dedicado + CrowdSec (192.168.10.10) ]
                             │
                             ▼ (LAN Interna :80)
┌─ VM ÚNICA PROXMOX (192.168.10.50) ──────────────────────────────────────────┐
│                                                                             │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │ Contenedor FRONTEND (mtt-frontend:80)                               │   │
│   │ - Servidor Nginx Alpine sirviendo React SPA                         │   │
│   │ - Mapeo expuesto al host de la VM: "80:80"                          │   │
│   │ - Regla Proxy Pass: /api/ ──▶ http://mtt-backend:8000/api/         │   │
│   └──────────────────┬──────────────────────────────────────────────────┘   │
│                      │ Red Docker Interna Bridge (mtt-net)                  │
│                      ├──────────────────────────────────┐                   │
│                      ▼                                  ▼                   │
│   ┌───────────────────────────────┐  ┌──────────────────────────────────┐   │
│   │ Contenedor BACKEND            │  │ Contenedor BASE DE DATOS         │   │
│   │ - FastAPI + Uvicorn (:8000)   │  │ - PostgreSQL 16 (:5432)          │   │
│   │ - SIN PUERTOS EXPUESTOS AL    ├──┼─▶ - SIN PUERTOS EXPUESTOS AL     │   │
│   │   HOST DE LA VM               │  │     HOST DE LA VM                │   │
│   └───────────────────────────────┘  │ - Volumen: ./data/pgdata         │   │
│                                      └──────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 3.2 Reglas Inflexibles de Comunicación HTTP y CORS
1. **Eliminación Total de CORS:** Al usar Nginx en el frontend como proxy inverso para la ruta `/api/`, el navegador opera bajo **Same-Origin**.
2. **Base URL Relativa:** Todas las llamadas en React deben configurarse como `axios.create({ baseURL: '/api' })`. Prohibido quemar `http://localhost:8000` o IPs fijas.
3. **Encabezados OWASP Obligatorios en Nginx:**
   * `X-Frame-Options: DENY`
   * `X-Content-Type-Options: nosniff`
   * `X-XSS-Protection: 1; mode=block`
   * `Referrer-Policy: strict-origin-when-cross-origin`
   * `Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https://*.tile.openstreetmap.org; connect-src 'self'; frame-ancestors 'none';`

---

## 4. Reglas Normativas y Tratamiento de las 51 Variables (Diccionario v6.0 / v7.0)

### 4.1 Las Cuatro Reglas de Oro Institucionales para Datos Faltantes
* **Regla 1 (Listas Desplegables y Ubigeo INE):** Si no se dispone del dato, debe quedar **ESTRICTAMENTE VACÍA (`null`)**. Prohibido seleccionar valores vacíos inventados o cadenas `"N/D"`.
* **Regla 2 (Numéricos, Cédulas, Coordenadas, Fechas y Códigos):** Deben quedar **ESTRICTAMENTE VACÍA (`null`)**. En variables de conteo está **PROHIBIDO COLOCAR CERO (`0`)** a menos que se haya verificado en campo la ausencia física absoluta.
* **Regla 3 (Campos de Texto Libre y Teléfonos):** Colocar exclusivamente **«N/D»** (No Disponible). Se prohíbe dejar strings vacíos `""` o cadenas en blanco.
* **Regla 4 (Fórmulas Matemáticas y Observaciones):**
  * `ano_creacion`: Extraído de `fecha_creacion`. Queda vacío si no existe fecha origen.
  * `total_voceros`: Suma matemática estricta: $$Total = Mujeres + Hombres$$
  * `observacion`: Si no se reportan novedades de campo, debe consignarse obligatoriamente la frase literal **«SIN OBSERVACIÓN»**.

### 4.2 Matriz Técnica de las 51 Variables y Tipado Zod

```typescript
// src/schemas/mttSchema.ts
import { z } from "zod";

// Helper Regla 3: Texto Libre obligatorio N/D si viene vacío
export const textoLibreND = z
  .string()
  .trim()
  .transform((val) => (!val || val === "" ? "N/D" : val))
  .default("N/D");

// Helper Regla 2: Numérico estricto NULL si no hay dato
export const numeroOpcionalNull = z
  .union([z.number(), z.string().trim()])
  .transform((val) => {
    if (val === "" || val === null || val === undefined) return null;
    const num = Number(val);
    return isNaN(num) ? null : num;
  })
  .nullable()
  .default(null);

export const mttSchema = z.object({
  // BLOQUE 1: UBICACIÓN E IDENTIFICACIÓN (Cols A-R)
  codigo_mtt: z.string().nullable().default(null), // Solo Consultor GDC
  region: z.enum(["Capital", "Central", "Llanos", "Guayana", "Los Andes", "Occidente", "Oriente"]),
  entidad_federal: z.string().min(1, "Estado requerido"),
  municipio: z.string().min(1, "Municipio requerido"),
  parroquia: z.string().min(1, "Parroquia requerida"),
  parroquia_id: z.number().int().positive("ID de Ubigeo INE inválido"),
  codigo_circuito_comunal: z.string().nullable().default(null),
  nombre_circuito_comunal: textoLibreND,
  nombre_mtt: textoLibreND,
  tipo_mtt: z.enum(["URBANA", "RURAL", "MIXTA", "INDÍGENA"]),
  fecha_creacion: z.string().nullable().default(null),
  ano_creacion: z.number().int().nullable().default(null),
  estatus_mtt: z.enum(["ACTIVA", "INACTIVA", "CERRADA"]),
  fecha_cambio_estatus: z.string().nullable().default(null),
  georreferenciacion: z.enum(["SI", "NO"]),
  coordenadas_decimales: z.string().nullable().default(null),
  correo_mtt: textoLibreND,
  uso_redes_sociales: z.enum(["SI", "NO"]),
  red_social_mas_utilizada: z.string().nullable().default(null),

  // BLOQUE 2: ORGANIZACIÓN COMUNAL Y DEMOGRAFÍA (Cols S-AA)
  codigo_situr_cc: z.string().nullable().default(null),
  nombre_cc_referencia: textoLibreND,
  sac_vinculada: z.enum(["SI", "NO"]),
  sac_conectada: z.enum(["CANTV", "OTRA OPERADORA", "SIN CONEXIÓN"]).nullable().default(null),
  cec_comuna: z.enum(["COMUNA", "CIRCUITO"]).nullable().default(null),
  num_cc: numeroOpcionalNull,
  num_comites_mtt: numeroOpcionalNull,
  num_familias: numeroOpcionalNull,
  num_habitantes: numeroOpcionalNull,

  // BLOQUE 3: INFORMACIÓN TÉCNICA (Cols AB-AF)
  zona_servida: z.enum(["SI", "NO"]),
  medio_transmision: z.enum(["CABLE DE COBRE", "FIBRA ÓPTICA", "INALÁMBRICO", "RED HÍBRIDA", "NINGUNO"]).nullable().default(null),
  otras_operadoras: z.enum(["MOVILNET", "OPERADORA PRIVADA", "OPERADORA COMUNAL", "ZONA DE CONECTIVIDAD PLURAL"]).nullable().default(null),
  elemento_red: z.enum(["CENTRAL", "URL", "ODN", "NODO NGN", "ADS", "ANTENA SATELITAL", "NINGUNO"]).nullable().default(null),
  mtt_en_huella_gpon: z.enum(["SI", "NO"]),

  // BLOQUE 4: VOCEROS Y VOCERAS (Cols AG-AT)
  estatus_vocerias: z.enum(["VIGENTE", "VENCIDA"]).nullable().default(null),
  voceros_mujeres: numeroOpcionalNull,
  voceros_hombres: numeroOpcionalNull,
  total_voceros: z.number().int().nullable().default(null),
  v1_nombre_apellido: textoLibreND,
  v1_cedula: numeroOpcionalNull,
  v1_fecha_nacimiento: z.string().nullable().default(null),
  v1_sexo: z.enum(["MUJER", "HOMBRE"]).nullable().default(null),
  v1_telefono: textoLibreND,
  v2_nombre_apellido: textoLibreND,
  v2_cedula: numeroOpcionalNull,
  v2_fecha_nacimiento: z.string().nullable().default(null),
  v2_sexo: z.enum(["MUJER", "HOMBRE"]).nullable().default(null),
  v2_telefono: textoLibreND,

  // BLOQUE 5: CONTROL Y SEGUIMIENTO (Cols AU-AY)
  activador_mtt: textoLibreND,
  fecha_ultima_visita: z.string().nullable().default(null),
  observacion: z
    .string()
    .trim()
    .transform((val) => (!val || val === "" ? "SIN OBSERVACIÓN" : val))
    .default("SIN OBSERVACIÓN"),
  verificado: z.enum(["SI", "NO"]).default("NO"),
  fecha_verificacion: z.string().nullable().default(null),
});

export type MTTRecord = z.infer<typeof mttSchema>;
```

---

## 5. Regla Mandatoria de Secuencia de Datos (Orden de Semillado)

El agente debe recordar y validar que en SINCOMTT **LA DATA OPERACIONAL DE LAS MTTS ES ESTRICTAMENTE LO ÚLTIMO EN CARGAR**.

```
ORDEN DE CARGA DE BASE DE DATOS (DEPENDENCIAS DE INTEGRIDAD):
1. TABLAS BASE DDL & MIGRACIONES
2. CATÁLOGOS DE OPCIONES CERRADAS (Enums, Roles, Tipos)
3. MAESTRO CARTOGRÁFICO UBIGEO INE 2026 (1.137 Parroquias normalizadas)
4. PADRÓN SOCIAL (Comunas, Circuitos Electorales, SITUR)
5. [PASO FINAL]: REGISTROS OPERACIONALES MTT (2.511 Mesas Técnicas)
```

**Motivo:** Toda MTT depende contractualmente de una parroquia oficial de la División Político Territorial (`parroquia_id`). Si se intentan precargar las MTT sin el Ubigeo INE activo, la base de datos abortará por violación de llaves foráneas.

---

## 6. Matriz de Control de Acceso (RBAC) y Reglas de Interfaz

El frontend debe adaptar dinámicamente sus vistas, menús y capacidades de edición según los **8 roles institucionales y sus 5 niveles de acceso**:

```
                       ESTRUCTURA DE ROLES EN SINCOMTT

  Nivel 1: Operativo de Campo (Solo Lectura Territorial)
           └── Promotor / Promotora

  Nivel 2: Operativo Territorial (Carga y Edición Estadal)
           └── Coordinador / Coordinadora

  Nivel 3: Validación Estadal (Aprobación / Devolución)
           └── Gerente Regional

  Nivel 4: Nacional y Normativo (Control Central y Códigos)
           ├── Consultor GDC (Asigna Código Oficial MTT)
           └── Consultor GPACyG (Auditoría y Planificación)

  Nivel 5: Directivo / Transparencia (Lectura Total)
           ├── Gerente de Línea (Analítico-Decisional)
           ├── Gerente General (Estratégico-Directivo)
           └── Usuario de Consulta (Solo Lectura Pública/Fichas)
```

### Reglas de Renderizado en React según Rol:
1. **Promotor:** Solo ve Dashboard local, Matriz filtrada a su municipio/parroquia asignada y botón de Ficha PDF. No ve botones "Crear", "Editar" ni "Validar".
2. **Coordinador:** Acceso completo al Formulario de Registro (5 pestañas) y actualización de vocerías. Bloqueado el input `codigo_mtt` (se muestra deshabilitado con badge "Pendiente por GDC").
3. **Gerente Regional:** Vista exclusiva de "Bandeja Regional" con acciones de "Aprobar Expediente" o "Devolver con Observación".
4. **Consultor GDC:** Vista exclusiva "Bandeja GDC". Habilitación del input para generar y registrar el `codigo_mtt` definitivo una vez validada el acta contra la DPT del INE.
5. **Usuario de Consulta / Gerentes:** Ocultamiento total de formularios de carga y mutación; habilitación de filtros avanzados, exportación a Excel/CSV y modal de Ficha PDF con código QR.

---

## 7. Protocolo de Detección y Reporte de Fallas al Backend (BDR)

Cuando el agente detecte inconsistencias o fallas en los archivos del backend (`backend_app.py`, `models.py`, schemas o queries), deberá crear una entrada formal en el registro de defectos utilizando la siguiente plantilla:

```markdown
### [BDR-XXX] Backend Defect Report: <Título Breve de la Falla>
* **Severidad:** Crítica / Alta / Media / Baja
* **Archivo(s) Afectado(s):** `backend/backend_app.py`, etc.
* **Componente / Endpoint:** `POST /api/mtt`, `CORSMiddleware`, etc.
* **Descripción de la Falla:** <Explicación detallada del problema detectado>
* **Impacto en Seguridad o Integridad:** <Riesgo de seguridad, violación de Regla de Oro o rotura de contrato>
* **Comportamiento Esperado según Norma:** <Qué exige la especificación técnica>
* **Solución Técnica Sugerida (Para el desarrollador Backend):**
```python
# Ejemplo de código sugerido para que el compañero lo aplique
```
* **Mitigación Temporal implementada en Frontend:** <Cómo el frontend absorbe o previene el fallo mientras se corrige en backend>
```

---

## 8. Hilo de Sesión del Agente (Session Hilo Tracker)

El Agente debe mantener permanentemente actualizado este hilo de sesión para garantizar trazabilidad secuencial de tareas ejecutadas, decisiones tomadas y estado de bloqueo.

```markdown
<!-- SECCIÓN DE SEGUIMIENTO EN TIEMPO REAL: SESSION_HILO -->
### ESTADO ACTUAL DE LA SESIÓN: [FASE 1 - SETUP ARQUITECTURA FRONTEND]

* **Tarea Activa:** Inicialización y desacoplamiento del Frontend React 19 + TypeScript.
* **Sprint / Hito:** Hito 1 - Base de Sistema, RBAC y Validación Zod de 51 Variables.
* **Estado de Conexión con Backend:** Inspección completada. Detectadas 3 vulnerabilidades críticas (BDR-001, BDR-002, BDR-003).

#### Secuencia de Tareas Realizadas por el Agente:
- [x] T01: Análisis exhaustivo del Diccionario de Datos v6.0 y de las 51 variables.
- [x] T02: Análisis de la plantilla de referencia HTML (`Sistema de Registro y Actualización de MTT Vers2.html`).
- [x] T03: Detección y documentación de vulnerabilidades críticas en el backend entregado (`backend_app.py`).
- [x] T04: Definición de arquitectura de despliegue para VM única (Docker Compose + Nginx Same-Origin).
- [x] T05: Creación del esquema Zod de tipado estricto con las 4 Reglas de Oro.
- [ ] T06: Creación de la estructura del proyecto React 19 con Vite, Tailwind CSS y TanStack Table.
- [ ] T07: Implementación de componentes de formulario divididos en 5 bloques normativos.
- [ ] T08: Implementación del hook en cascada `useUbigeoCascade` para Estados, Municipios y Parroquias.
- [ ] T09: Configuración de `Dockerfile` multi-stage y `nginx.conf` de producción.
- [ ] T10: Verificación final de la máquina de estados RBAC para los 8 roles institucionales.

#### Bloqueos Actuales (Blockers):
* Ninguno en frontend. Se mitigan en cliente las fallas del backend mediante el proxy Nginx y sanitización en Zod.
<!-- FIN DE SECCIÓN SESSION_HILO -->
```

---

## 9. Registro de Cambios del Proyecto (Changelog)

Formato de versionado semántico estándar para auditoría del repositorio:

```markdown
# CHANGELOG - SINCOMTT FRONTEND

Todas las modificaciones notables realizadas por el Agente en la arquitectura, componentes, seguridad y configuración se registrarán en este documento.

## [1.0.0-alpha.1] - 2026-11-06
### Añadido (Added)
* Archivo maestro de especificaciones y workflows de Antigravity (`antigravity_workflow_sincomtt.md`).
* Esquema estricto de validación Zod (`mttSchema`) que formaliza las 51 variables normativas y las Reglas de Oro para datos ausentes (NULLs, 'N/D', 'SIN OBSERVACIÓN').
* Especificación de arquitectura unificada en VM de Proxmox con Docker Compose, aislando Backend y BD en red bridge interna sin puertos expuestos al host.
* Configuración de Nginx como Reverse Proxy local para garantizar comunicación Same-Origin hacia `/api/` y erradicar CORS en producción.
* Mapeo integral de permisos para los 8 roles institucionales organizados en 5 niveles de acceso.

### Detectado en Backend (Backend Defect Reports)
* **BDR-001:** `backend_app.py` expone `allow_origins=["*"]` con `allow_credentials=True`, lo cual es inválido según RFC W3C Fetch y genera fallos preflight.
* **BDR-002:** Credenciales maestras de PostgreSQL quemadas en texto plano en la cadena de conexión de `backend_app.py`.
* **BDR-003:** Endpoints sensibles de modificación de MTT carecen de inyección de dependencias para validación de roles institucionales (RBAC ausente en FastAPI).
* **BDR-004:** El modelo backend no aplica las Reglas de Oro de sustitución de cadenas vacías por `"N/D"` ni vaciado de conteos en `null`.

### Cambiado (Changed)
* Desestimado el uso de Vue 3 monolítico sin tipar a favor de React 19 + TypeScript + Vite para soporte nativo de matrices densas de datos.
* Reemplazada la lógica estática de Ubigeo embebida en JavaScript por consumo dinámico en cascada de los catálogos del INE.

### Seguridad (Security)
* Incorporación de directivas estrictas de endurecimiento HTTP (OWASP): HSTS, CSP compatible con OpenStreetMap, X-Frame-Options y Permissions-Policy.
```

---

## 10. Playbooks de Acción para el Agente (Step-by-Step Workflows)

### Playbook 1: Creación de Componentes del Formulario de Captura (51 Variables)
1. **Estructura Modular:** Desacoplar el formulario en 5 subcomponentes bajo `src/components/forms/`:
   * `Bloque1Ubicacion.tsx` (Cols A-R)
   * `Bloque2Comunal.tsx` (Cols S-AA)
   * `Bloque3Tecnico.tsx` (Cols AB-AF)
   * `Bloque4Vocerias.tsx` (Cols AG-AT)
   * `Bloque5Seguimiento.tsx` (Cols AU-AY)
2. **Uso de FormContext:** Utilizar `FormProvider` de `react-hook-form` con el `zodResolver(mttSchema)` en el contenedor principal `FormMTTContainer.tsx`.
3. **Cálculos Reactivos en Tiempo Real:**
   * Suscribirse mediante `useWatch` a `fecha_creacion` para autocompletar `ano_creacion`.
   * Suscribirse a `voceros_mujeres` y `voceros_hombres` para proyectar instantáneamente el valor de `total_voceros`.

### Playbook 2: Consulta en Cascada de Ubigeo INE con React Query
1. Consumir `/api/catalogos/estados` $\rightarrow$ Renderizar select de Entidades Federales.
2. Al seleccionar Estado $\rightarrow$ Disparar query habilitada `/api/catalogos/municipios?estado_id=${id}` $\rightarrow$ Limpiar selector de parroquia.
3. Al seleccionar Municipio $\rightarrow$ Disparar query `/api/catalogos/parroquias?municipio_id=${id}`.
4. Al seleccionar Parroquia $\rightarrow$ Asignar simultáneamente el nombre de la parroquia y el `parroquia_id` canónico al formulario.

### Playbook 3: Generación y Descarga de Ficha Técnica PDF con QR
1. Abrir modal `FichaOficialModal.tsx` pasando los datos normalizados de la fila seleccionada en TanStack Table.
2. Renderizar visualmente el formato oficial con los 5 bloques y el distintivo institucional de la República Bolivariana de Venezuela / CANTV / GGFPP.
3. Generar el código QR dinámico en SVG apuntando al hash verificador del expediente (`/verificar/${codigo_mtt}`).
4. Proveer botón de exportación vectorizada / impresión limpia (`window.print()` con CSS `@media print` optimizado).