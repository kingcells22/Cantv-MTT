# SISTEMA INTEGRAL SINCOMTT · CANTV (GGFPP)
## Matriz de Coordinación y Plan de Acción Técnico

Este directorio contiene los informes técnicos especializados divididos por responsable para subsanar discrepancias, acelerar la integración y preparar el despliegue a producción en la máquina virtual institucional (`171.0.40.7`).

---

### 👥 Distribución de Responsabilidades y Roles

| Responsable | Área Técnica | Rama de Trabajo | Informe Técnico |
| :--- | :--- | :--- | :--- |
| **Anthony Domínguez** | Arquitectura Frontend, UI/UX Oficial, Contenedores Docker Debian, Reverse Proxy Nginx, Ubigeo INE y Pruebas End-to-End | `feature/frontend-react19` | [01_ANTHONY_DOMINGUEZ/INFORME_TECNICO_ANTHONY_DOMINGUEZ.md](01_ANTHONY_DOMINGUEZ/INFORME_TECNICO_ANTHONY_DOMINGUEZ.md) |
| **Kenny Navarro** | Arquitectura Backend, API REST FastAPI, Modelado SQLAlchemy, Persistencia PostgreSQL, Schemas Pydantic y Dockerfile Python | `Devs` | [02_KENNY_NAVARRO/INFORME_TECNICO_KENNY_NAVARRO.md](02_KENNY_NAVARRO/INFORME_TECNICO_KENNY_NAVARRO.md) |

---

### 🗺️ Hoja de Ruta de Integración y Promoción de Ramas (Git Workflow)

```mermaid
gitGraph
   commit id: "Inicial (origin/master)"
   branch Devs
   checkout Devs
   commit id: "Backend Base (Kenny)"
   branch feature/frontend-react19
   checkout feature/frontend-react19
   commit id: "Frontend React 19 + Docker + Informes (Anthony)"
   checkout Devs
   merge feature/frontend-react19 id: "Merge en Rama de Pruebas (Devs)"
   commit id: "Correcciones Backend BDR-001 a 007"
   checkout master
   merge Devs id: "Paso a Producción (origin/master)"
```

1. **Fase 1 (Actual): Publicación de Rama de Características:**
   - Rama activa: `feature/frontend-react19`.
   - Contiene: Frontend React 19 completo, orquestación Docker Debian Bookworm, datos del Ubigeo INE (1.137 parroquias), 150 registros semilla históricos y este set de informes técnicos.
2. **Fase 2: Pruebas y Subsanación de Fallas en Rama `Devs`:**
   - Kenny Navarro corrige las fallas documentadas en su informe técnico con las soluciones de código provistas.
   - Si se presenta un punto muerto técnico, Anthony Domínguez aplica directamente las soluciones para no demorar el cronograma.
   - Se realiza el merge de `feature/frontend-react19` hacia `Devs`.
3. **Fase 3: Promoción a Rama `master` (Producción):**
   - Validación integral en VM `171.0.40.7` con los contenedores `mtt-frontend`, `mtt-backend` y `mtt-database` saludables.
   - Merge definitivo a `origin/master`.
