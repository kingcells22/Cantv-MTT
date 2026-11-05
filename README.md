<p align="center">
  <img src="https://upload.wikimedia.org/wikipedia/commons/c/cd/CANTV_logo.svg" alt="CANTV Logo" width="300"/>
</p>

# Sistema Integral de Registro, Control y Consulta de MTT (CANTV)

Backend y Base de Datos para el Registro Nacional de Mesas Técnicas de Telecomunicaciones (MTT), diseñado para sustituir herramientas ofimáticas descentralizadas por una plataforma unificada, estructurada y auditable.

## Arquitectura del Proyecto

El sistema está construido bajo una arquitectura de microservicios orientada a contenedores, separando claramente las responsabilidades:

- **Base de Datos:** PostgreSQL. Estructura relacional normalizada a partir del Diccionario de Datos Oficial (51 variables).
- **Backend:** FastAPI (Python 3). Implementa SQLAlchemy (ORM) para la gestión segura de datos, Pydantic para la validación estricta de esquemas y `bcrypt` para el cifrado de contraseñas.
- **Frontend (Prueba de Concepto):** Vue.js + Vite.

> **⚠️ NOTA IMPORTANTE SOBRE EL FRONTEND:**
> La interfaz gráfica incluida en este repositorio (`/frontend/vue-app`) fue desarrollada **exclusivamente como un entorno de pruebas funcionales (PoC)**. Su único propósito es validar la operatividad de los endpoints del backend, las políticas de CORS, la inserción relacional y el control de acceso basado en roles (RBAC). No representa el producto final y está diseñado para garantizar que el equipo de desarrollo Frontend reciba una API robusta, probada y libre de errores.

## Estructura de la Base de Datos

La base de datos (`mtt_db`) fue modelada en DBeaver siguiendo las normativas de la Gerencia de Desarrollo Comunal (GDC):

1.  **Catálogos Geográficos:** Tablas jerárquicas (Regiones > Estados > Municipios > Parroquias) pobladas con la data oficial del Instituto Nacional de Estadística (INE).
2.  **Seguridad:** Tablas de `roles` y `usuarios` con contraseñas hasheadas.
3.  **Core MTT:** Tabla central `mtt_principal` vinculada geográficamente y expandida a través de tablas relacionales (`organizacion_comunal`, `vocerias`, `seguimiento`) con eliminación en cascada.

## Despliegue Local y Migración de Datos

### 1. Población Inicial (Seeds)

Para cargar el catálogo geográfico (Ubigeo) y la data histórica unificada, se crearon scripts de migración basados en `pandas`:

- `seed_ubigeo.py`: Carga y normaliza los estados, municipios y parroquias.
- `seed_mtt.py`: Fusiona los archivos de registro y georreferenciación, limpiando valores nulos y formateando tipos de datos antes de la inserción relacional.

### 2. Extracción de Backup (Para migración a Docker)

Para exportar la estructura y los datos ya procesados en el entorno local (laptop) hacia un entorno de producción, se utiliza `pg_dump`.

Ejecutar en la terminal local teniendo PostgreSQL instalado en el sistema:

```bash
pg_dump -U postgres -d mtt_db -F p -f mtt_db_backup.sql
```
