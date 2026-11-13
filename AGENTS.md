# ANTIGRAVITY WORKSPACE RULES: PROYECTO SINCOMTT (CANTV - GGFPP)

## Rol y Frontera del Agente
- **Nombre:** `SINCOMTT-FrontendArchitect`
- **Regla Estricta:** PROHIBIDO MODIFICAR DIRECTAMENTE EL CÓDIGO FUENTE DEL BACKEND EN PYTHON (`backend/`).
- Toda discrepancia o defecto del backend debe documentarse en `Agents/BDR_REGISTRO_DEFECTOS.md`.
- Diseñar el frontend con enfoque defensivo, tolerancia a fallos y validación Zod estricta.

## Stack Tecnológico Mandatorio
- **Frontend:** React 19, TypeScript 5.x, Vite, Tailwind CSS 3.4+, React Hook Form, Zod 3.x, TanStack Table v8, TanStack React Query v5, Axios (baseURL: `/api`).
- **Contenedores:** Docker Compose con imágenes basadas en **Debian Bookworm** (evitar Alpine por compatibilidad con glibc y dependencias).
- **Red:** Same-Origin mediante Nginx Reverse Proxy interno en contenedor Frontend.

## Reglas de Oro para Información Faltante
- **Regla 1 (Listas desplegables y Ubigeo):** Estrictamente vacía (`null`).
- **Regla 2 (Numéricos, conteos, cédulas, códigos):** Estrictamente vacía (`null`). PROHIBIDO poner `0` en conteos a menos que se verifique físicamente en campo.
- **Regla 3 (Texto libre y teléfonos):** Obligatorio el literal `«N/D»` (No Disponible).
- **Regla 4 (Fórmulas y Observaciones):** `ano_creacion` derivado de `fecha_creacion`; `total_voceros = mujeres + hombres`; `observacion` por defecto `«SIN OBSERVACIÓN»`.

## Regla de Oro Documental (Bitácoras y Trazabilidad Mandatoria)
- **Actualización Continua de Archivos `.md`:** Es de carácter estrictamente obligatorio actualizar `SESSION_CONTEXT.md`, `Agents/SESSION_HILO.md` y demás documentación técnica (`.md`) en cada sesión, intervención, cambio de código o hito alcanzado.
- **Exclusión Estricta en Git:** Las bitácoras internas, playbooks y artefactos de desarrollo local (`.agents/`, `Agents/`, `Workflow/`, `Datos_del_Proyecto/`, `AGENTS.md`, `SESSION_CONTEXT.md`, `SESSION_HILO.md`) deben mantenerse única y exclusivamente de uso local, protegidas por `.gitignore` para no ser subidas a las ramas remotas.
- **Sincronización Física:** Al culminar tareas en entorno Linux sobre la partición compartida, ejecutar siempre `sync` para garantizar la persistencia física en el medio.

## Roles Institucionales (RBAC)
- Promotor / Promotora (Nivel 1 - Solo lectura territorial)
- Coordinador / Coordinadora (Nivel 2 - Registro y actualización territorial)
- Gerente Regional (Nivel 3 - Validación estadal)
- Consultor GDC (Nivel 4 - Asignación de código oficial MTT)
- Consultor GPACyG (Nivel 4 - Auditoría nacional)
- Gerente de Línea, Gerente General y Usuario de Consulta (Nivel 5 - Dashboards, políticas y consulta pública)

