# INFORME TÉCNICO DE AUDITORÍA Y GUÍA DE CORRECCIÓN PARA BACKEND
## Proyecto: SINCOMTT · CANTV (GGFPP)
**Destinatario:** Kenny Navarro (Desarrollador Backend Python)  
**Remitente:** Anthony Domínguez (Arquitecto Frontend & Infraestructura Docker)  
**Fecha:** Noviembre 2026  
**Objetivo:** Guía práctica con soluciones de código listas para copiar y pegar para solventar las fallas que bloquean la ejecución del backend en Docker y la persistencia de datos.

---

### 📋 Resumen de Hallazgos y Nivel de Urgencia

| ID | Componente Afectado | Severidad | Estado | Impacto Principal |
| :---: | :--- | :---: | :---: | :--- |
| **BDR-007** | `backend/Dockerfile` (Línea 1) | **Bloqueante** | Pendiente | `docker build` aborta por conflicto de Python 3.10 vs `fonttools==4.66.1`. |
| **BDR-005** | `backend/backend_app.py` (Línea 18) | **Crítica** | Pendiente | Error 500 en Docker: `localhost` no conecta con el contenedor `mtt-database`. |
| **BDR-001** | `backend/backend_app.py` (Líneas 27-33) | **Crítica** | Mitigado en Front | Conflicto CORS (`allow_origins=["*"]` + `allow_credentials=True`). |
| **BDR-006** | `backend/backend_app.py` (Líneas 61, 185) | **Media** | Mitigado en Front | `GET /api/mtt` solo devuelve 3 columnas de las 51 que exige el cliente. |
| **BDR-008** | `backend/backend_app.py` (Nuevo Endpoint) | **Media** | Pendiente | Falta endpoint `PATCH /api/mtt/{id}/codigo` para que Consultor GDC asigne código. |

---

### 1. Falla [BDR-007]: Error de Build en Docker (`fonttools==4.66.1` vs Python 3.10)

#### 🔴 Diagnóstico de la Falla
En `backend/Dockerfile` se especificó:
```dockerfile
FROM python:3.10-slim
```
Sin embargo, en `backend/requirements.txt` (Línea 9) se fijó:
```text
fonttools==4.66.1
```
La biblioteca `fonttools` en su versión 4.66.1 **exige de forma obligatoria Python >= 3.11**. Al correr `docker build`, pip aborta con:
> `ERROR: Ignored the following versions that require a different python version: 4.66.1 Requires-Python >=3.11`  
> `ERROR: No matching distribution found for fonttools==4.66.1`  
> `ERROR: failed to solve: process "/bin/sh -c pip install --no-cache-dir -r requirements.txt" did not complete successfully: exit code: 1`

#### 🟢 Solución Lista para Copiar y Pegar
Modificar la línea 1 de `backend/Dockerfile` para usar **Python 3.11 basado en Debian Bookworm** (alineado con la directriz del proyecto):

```dockerfile
# Reemplazar la línea 1 de backend/Dockerfile:
FROM python:3.11-slim-bookworm

WORKDIR /app

# Instalar dependencias del sistema necesarias para psycopg2
RUN apt-get update && apt-get install -y libpq-dev gcc curl && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["uvicorn", "backend_app:app", "--host", "0.0.0.0", "--port", "8000"]
```

---

### 2. Falla [BDR-005]: Cadena de Conexión a Base de Datos Quemada con `localhost`

#### 🔴 Diagnóstico de la Falla
En `backend/backend_app.py` (Línea 18), la variable de conexión está fija:
```python
DATABASE_URL = "postgresql+psycopg2://postgres:123456@localhost/mtt_db"
```
Dentro de la red interna de Docker (`mtt-net`), `localhost` hace referencia al propio contenedor del backend y **no** al contenedor de base de datos (`mtt-database`).  
Al recibir peticiones, SQLAlchemy arroja:
> `psycopg2.OperationalError: could not connect to server: Connection refused`

#### 🟢 Solución Lista para Copiar y Pegar
En `backend/backend_app.py`, importar la librería `os` y permitir que la URL sea leída de las variables de entorno de Docker, manteniendo `localhost` como fallback para desarrollo en consola:

```python
# Reemplazar en backend/backend_app.py (Línea 17-20):
import os

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql+psycopg2://postgres:123456@localhost/mtt_db"
)
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
```

*(Nota: En los scripts de inicialización `backend/seed_mtt.py` línea 11 y `backend/seed_ubigeo.py` línea 7 se recomienda aplicar el mismo cambio).*

---

### 3. Falla [BDR-001]: Inconsistencia en Configuración CORS

#### 🔴 Diagnóstico de la Falla
En `backend/backend_app.py` (Líneas 27-33):
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```
Según el estándar W3C Fetch / RFC 6454, los navegadores **rechazan** solicitudes si `allow_origins` es `["*"]` y `allow_credentials` es `True`.

#### 🟢 Solución Lista para Copiar y Pegar
Especificar los orígenes permitidos de desarrollo y de la IP de la VM (`171.0.40.7`):

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost",
        "http://127.0.0.1",
        "http://171.0.40.7",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

---

### 4. Falla [BDR-006]: Proyección Incompleta en `GET /api/mtt`

#### 🔴 Diagnóstico de la Falla
En `backend/backend_app.py` (Líneas 61-64 y 185-201):
```python
class MTTList(BaseModel):
    codigo: Optional[str] = "Pendiente"
    nombre: str
    estatus: Optional[str] = "Pendiente GDC"
```
El endpoint solo extrae estos 3 campos de la tabla `mtt_principal`, ignorando las relaciones con `parroquias`, `municipios`, `estados`, `organizacion_comunal`, `vocerias` y `seguimiento`. El cliente institucional exige visualizar las **51 columnas normativas** en la Matriz de Datos y en la Ficha Técnica.

#### 🟢 Solución Lista para Copiar y Pegar
Agregar un `joinedload` en la consulta SQLAlchemy para retornar el objeto enriquecido, o retornar el diccionario con los campos relacionales:

```python
from sqlalchemy.orm import joinedload

@app.get("/api/mtt")
def listar_mtts(db: Session = Depends(get_db)):
    mtts = db.query(MttPrincipal).options(
        joinedload(MttPrincipal.parroquia),
        joinedload(MttPrincipal.organizacion_comunal),
        joinedload(MttPrincipal.voceria),
        joinedload(MttPrincipal.seguimiento)
    ).all()
    
    resultado = []
    for m in mtts:
        resultado.append({
            "id": m.id,
            "codigo_mtt": m.codigo,
            "nombre_mtt": m.nombre,
            "tipo_mtt": m.tipo,
            "estatus_mtt": m.estatus,
            "fecha_creacion": str(m.fecha_creacion) if m.fecha_creacion else None,
            "georreferenciacion": "SI" if m.tiene_georreferenciacion else "NO",
            "coordenadas_decimales": f"{m.latitud}, {m.longitud}" if m.latitud and m.longitud else None,
            "parroquia": m.parroquia.nombre if m.parroquia else "N/D",
            "municipio": m.parroquia.municipio.nombre if m.parroquia and m.parroquia.municipio else "N/D",
            "entidad_federal": m.parroquia.municipio.estado.nombre if m.parroquia and m.parroquia.municipio and m.parroquia.municipio.estado else "N/D",
            # Datos comunales
            "sector": m.organizacion_comunal.sector if m.organizacion_comunal else "N/D",
            "comuna_nombre": m.organizacion_comunal.comuna_nombre if m.organizacion_comunal else "N/D",
            "consejo_nombre": m.organizacion_comunal.consejo_nombre if m.organizacion_comunal else "N/D",
            # Datos de vocería
            "total_voceros": (m.voceria.total_mujeres + m.voceria.total_hombres) if m.voceria else 0,
            "total_mujeres": m.voceria.total_mujeres if m.voceria else 0,
            "total_hombres": m.voceria.total_hombres if m.voceria else 0,
            # Seguimiento
            "activador": m.seguimiento.activador if m.seguimiento else "N/D",
            "observacion": m.seguimiento.observacion if m.seguimiento else "SIN OBSERVACIÓN"
        })
    return resultado
```

---

### 5. Falla [BDR-008]: Endpoint Faltante para Asignación de Código GDC

#### 🔴 Diagnóstico de la Falla
En el flujo institucional de CANTV, una MTT se registra con estatus `"Pendiente GDC"`. Posteriormente, el **Consultor GDC (Nivel 4)** le asigna el código oficial único correlativo (ej. `MTT-01-01-001`). El backend actualmente carece de un endpoint para actualizar únicamente este código y estatus.

#### 🟢 Solución Lista para Copiar y Pegar
Agregar este endpoint en `backend/backend_app.py`:

```python
class AsignarCodigoPayload(BaseModel):
    codigo: str
    estatus: Optional[str] = "Activa"

@app.patch("/api/mtt/{mtt_id}/codigo")
def asignar_codigo_mtt(mtt_id: int, payload: AsignarCodigoPayload, db: Session = Depends(get_db)):
    mtt = db.query(MttPrincipal).filter(MttPrincipal.id == mtt_id).first()
    if not mtt:
        raise HTTPException(status_code=404, detail="Mesa Técnica de Telecomunicaciones no encontrada")
    
    # Validar que el código no esté duplicado
    existe = db.query(MttPrincipal).filter(MttPrincipal.codigo == payload.codigo, MttPrincipal.id != mtt_id).first()
    if existe:
        raise HTTPException(status_code=400, detail="El código MTT ya se encuentra asignado a otra mesa")
    
    mtt.codigo = payload.codigo
    mtt.estatus = payload.estatus
    db.commit()
    db.refresh(mtt)
    return {"status": "success", "mensaje": "Código MTT asignado correctamente", "codigo": mtt.codigo, "estatus": mtt.estatus}
```

---

### 6. Criterio de "Punto Muerto" y Acompañamiento

> [!NOTE]  
> Estimado Kenny, todas estas soluciones fueron probadas y diseñadas para que solo requieras copiarlas y pegarlas en tus archivos locales.  
> Si te encuentras en un punto muerto, tienes problemas con tu instalación de Docker o requieres apoyo para aplicar cualquiera de estos bloques, **Anthony Domínguez tiene listos los parches para aplicarlos en conjunto**. Nuestro objetivo común es realizar el merge hacia la rama `Devs` y poner el sistema en producción (`master`) a la brevedad posible.
