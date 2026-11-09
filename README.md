<p align="center">
  <img src="logo.png" alt="CANTV Logo" width="300"/>
</p>

# Sistema Integral de Registro, Control y Consulta de MTT (CANTV · SINCOMTT)
## Gerencia General de Formación y Participación del Poder Popular (GGFPP) · Gerencia de Desarrollo Comunal (GDC)

Plataforma unificada para el Registro Nacional, Actualización, Cartografía y Auditoría de las Mesas Técnicas de Telecomunicaciones (MTT) de Venezuela, diseñada para sustituir herramientas ofimáticas descentralizadas por una plataforma estructurada, segura y auditable.

---

## 🏛️ Arquitectura del Sistema

El sistema implementa una arquitectura desacoplada de alto rendimiento basada en microservicios orquestados mediante **Docker Compose (Debian Bookworm)**:

- **Frontend (Cliente Web SPA):**
  - Desarrollado en **React 19**, **TypeScript 5.x**, **Vite** y **Tailwind CSS 3.4+**.
  - Formulario estricto de 5 bloques normativos basado en la plantilla oficial (`Sistema de Registro y Actualización de MTT Vers2.html`).
  - Validación de esquemas defensiva con **Zod** y manejo reactivo con **React Hook Form**.
  - Servido mediante **Nginx Reverse Proxy (Debian Bookworm)** que implementa una arquitectura *Same-Origin* canalizando `/api/` internamente para mitigar cualquier riesgo de CORS.
  - Generación de Ficha Técnica Oficial en PDF con código QR verificador dinámico (`jspdf` + `qrcode`).
  - Matriz Nacional de Datos con **TanStack Table v8** soportando las 51 variables normativas, filtros multicriterio y exportación a Excel / CSV.

- **Backend (API REST):**
  - Desarrollado en **FastAPI** (Python 3.12).
  - ORM **SQLAlchemy** con **psycopg2** y validación Pydantic.
  - Endpoints REST para autenticación con cifrado **bcrypt**, catálogos de Ubigeo INE 2026 en cascada (Estados $\rightarrow$ Municipios $\rightarrow$ Parroquias), consulta relacional multicapa y asignación oficial de código MTT por parte de Consultores GDC.

- **Base de Datos (RDBMS):**
  - **PostgreSQL 16 (Debian Bookworm)**.
  - Estructura relacional normalizada (`mtt_principal`, `organizacion_comunal`, `vocerias`, `seguimiento`, `estados`, `municipios`, `parroquias`, `roles`, `usuarios`) poblada con 2.187 registros históricos de MTTs.

---

## 🚀 Despliegue Rápido con Docker Compose

La solución está lista para ejecutarse en entornos de producción o pruebas (VM `171.0.40.7`):

```bash
# 1. Clonar el repositorio y situarse en la raíz del proyecto
cd CANTV-MMT

# 2. Construir imágenes y levantar servicios
docker compose up -d --build

# 3. Verificar estado de los contenedores
docker compose ps
```

El aplicativo estará disponible inmediatamente en el puerto 80:
- **Interfaz Web Frontend:** `http://171.0.40.7` (o `http://localhost`)
- **Health Check Nginx:** `http://localhost/health`
- **API Backend (Interna):** `http://localhost/api/mtt`

---

## 👥 Control de Acceso Basado en Roles (RBAC)

1. **Promotor / Promotora (Nivel 1):** Consulta y lectura territorial de MTTs asignadas.
2. **Coordinador / Coordinadora (Nivel 2):** Registro inicial de MTTs y actualización de datos comunitarios y vocerías.
3. **Gerente Regional (Nivel 3):** Validación estadística y seguimiento estadal.
4. **Consultor GDC (Nivel 4):** Asignación exclusiva del código oficial MTT (`PATCH /api/mtt/{id}/codigo`) y emisión de providencias.
5. **Consultor GPACyG (Nivel 4):** Auditoría nacional y control de gestión.
6. **Gerente de Línea / Usuario Consulta (Nivel 5):** Dashboards ejecutivos, métricas globales y reportes consolidados.

---

## 📊 Reglas de Oro para Consistencia de Datos

- **Regla 1 (Listas desplegables y Ubigeo):** Estrictamente vacía (`null`) si no se cuenta con el dato fidedigno.
- **Regla 2 (Numéricos, conteos, cédulas, códigos):** Estrictamente vacía (`null`). Prohibido colocar `0` a menos que sea confirmado en campo.
- **Regla 3 (Texto libre y teléfonos):** Obligatorio el literal `«N/D»` (No Disponible).
- **Regla 4 (Fórmulas y Observaciones):** `ano_creacion` derivado de `fecha_creacion`; `total_voceros = mujeres + hombres`; `observacion` por defecto `«SIN OBSERVACIÓN»`.
