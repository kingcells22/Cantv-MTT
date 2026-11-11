import os
import json
import logging
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session, joinedload
from typing import List, Optional
from datetime import date
from decimal import Decimal
import bcrypt # Para encriptar contraseñas
import redis

# === CONFIGURACIÓN DE LOGGING ===
logger = logging.getLogger("mtt_api")
logging.basicConfig(level=logging.INFO)

# === IMPORTACIÓN DE MODELOS ORM ===
from models import (
    Rol, Usuario, MttPrincipal, OrganizacionComunal,
    Voceria, Seguimiento, Region, Estado, Municipio, Parroquia
)

# === CONFIGURACIÓN DE BASE DE DATOS POSTGRESQL (POOLING DE ALTO RENDIMIENTO) ===
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql+psycopg2://postgres:123456@localhost/mtt_db"
)
engine = create_engine(
    DATABASE_URL,
    pool_size=20,           # 20 conexiones permanentes calientes
    max_overflow=30,        # hasta 30 conexiones pico (soporta 50 concurrentes)
    pool_timeout=10,        # tiempo máximo de espera antes de abortar
    pool_recycle=1800,      # recicla conexiones cada 30 min para evitar sockets viejos
    pool_pre_ping=True      # verifica la conexión antes de entregarla (evita zombies)
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# === CONFIGURACIÓN DE REDIS (CACHÉ DEFENSIVO CON FALLBACK) ===
REDIS_URL = os.getenv("REDIS_URL", "redis://mtt-redis:6379/0")
redis_client = None
try:
    redis_client = redis.from_url(REDIS_URL, decode_responses=True, socket_timeout=2, socket_connect_timeout=2)
    redis_client.ping()
    logger.info("Conexión exitosa a Redis Caché.")
except Exception as e:
    logger.warning(f"Redis no disponible al inicio ({e}). La API operará en modo directo a PostgreSQL.")
    redis_client = None

def get_cache(key: str):
    if not redis_client:
        return None
    try:
        data = redis_client.get(key)
        if data:
            return json.loads(data)
    except Exception as e:
        logger.warning(f"Error leyendo caché para {key}: {e}")
    return None

def set_cache(key: str, data: any, ttl_seconds: int = 3600):
    if not redis_client:
        return
    try:
        redis_client.setex(key, ttl_seconds, json.dumps(data, default=str))
    except Exception as e:
        logger.warning(f"Error guardando caché para {key}: {e}")

def invalidate_cache(pattern_or_key: str):
    if not redis_client:
        return
    try:
        if "*" in pattern_or_key:
            keys = redis_client.keys(pattern_or_key)
            if keys:
                redis_client.delete(*keys)
        else:
            redis_client.delete(pattern_or_key)
    except Exception as e:
        logger.warning(f"Error invalidando caché para {pattern_or_key}: {e}")

app = FastAPI(title="API Sistema MTT")

# Configuración para encriptar contraseñas

# === CONFIGURACIÓN DE CORS ===
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

# === GESTOR DE SESIONES DE BD ===
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# === ESQUEMAS PYDANTIC ===

class UsuarioLogin(BaseModel):
    usuario: str
    password: str # Ahora requerimos contraseña en lugar de 'perfil' desde el front
    # perfil: str  <-- Esto ya no se envía desde el front en un login real

class AsignarCodigoPayload(BaseModel):
    codigo: str
    estatus: Optional[str] = "Activa"

class UsuarioCreate(BaseModel):
    usuario: str
    password: str
    rol_id: int

class ItemCombo(BaseModel):
    id: int
    nombre: str
    class Config:
        orm_mode = True

class MTTList(BaseModel):
    codigo: Optional[str] = "Pendiente"
    nombre: str
    estatus: Optional[str] = "Pendiente GDC"

class MTTCreate(BaseModel):
    parroquia_id: int
    nombre: str = Field(default="N/D")
    tipo: Optional[str] = None
    fecha_creacion: Optional[date] = None
    estatus: Optional[str] = "Pendiente GDC"
    tiene_georreferenciacion: Optional[bool] = None
    latitud: Optional[Decimal] = None
    longitud: Optional[Decimal] = None
    sector: str = Field(default="N/D")
    comuna_nombre: str = Field(default="N/D")
    comuna_codigo: Optional[str] = None
    consejo_nombre: str = Field(default="N/D")
    consejo_situr: Optional[str] = None
    sac_vinculada: Optional[bool] = None
    sac_conectada: Optional[str] = None
    num_comunas: Optional[int] = None
    num_cc: Optional[int] = None
    num_comites: Optional[int] = None
    num_familias: Optional[int] = None
    num_habitantes: Optional[int] = None
    zona_cantv: Optional[bool] = None
    medio_transmision: Optional[str] = None
    otras_operadoras: Optional[str] = None
    elemento_red: Optional[str] = None
    huella_gpon: Optional[bool] = None
    estatus_voceria: Optional[str] = None
    total_mujeres: int = 0
    total_hombres: int = 0
    v1_nombre: str = Field(default="N/D")
    v1_cedula: Optional[str] = None
    v1_nacimiento: Optional[date] = None
    v1_sexo: Optional[str] = None
    v1_telefono: str = Field(default="N/D")
    v2_nombre: str = Field(default="N/D")
    v2_cedula: Optional[str] = None
    v2_nacimiento: Optional[date] = None
    v2_sexo: Optional[str] = None
    v2_telefono: str = Field(default="N/D")
    activador: str = Field(default="N/D")
    fecha_visita: Optional[date] = None
    observacion: str = Field(default="SIN OBSERVACIÓN")

# === ENDPOINTS DE USUARIOS Y AUTENTICACIÓN ===

@app.post("/api/usuarios")
def crear_usuario(datos: UsuarioCreate, db: Session = Depends(get_db)):
    """Endpoint para que un administrador cree nuevos usuarios"""
    user_existente = db.query(Usuario).filter(Usuario.usuario == datos.usuario).first()
    if user_existente:
        raise HTTPException(status_code=400, detail="El nombre de usuario ya está registrado")
    
    rol_existente = db.query(Rol).filter(Rol.id == datos.rol_id).first()
    if not rol_existente:
         raise HTTPException(status_code=400, detail="El ID del rol no existe")

    # Encriptar contraseña usando bcrypt directamente
    pwd_bytes = datos.password.encode('utf-8')
    hashed = bcrypt.hashpw(pwd_bytes, bcrypt.gensalt())
    
    nuevo_usuario = Usuario(
        usuario=datos.usuario,
        password_hash=hashed.decode('utf-8'),
        rol_id=datos.rol_id,
        activo=True
    )
    
    try:
        db.add(nuevo_usuario)
        db.commit()
        return {"status": "success", "mensaje": "Usuario creado exitosamente"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail="Error al crear el usuario")


@app.post("/api/login")
def login(datos: UsuarioLogin, db: Session = Depends(get_db)):
    """Login real verificando credenciales en BD con bcrypt directo"""
    user = db.query(Usuario).filter(Usuario.usuario == datos.usuario).first()
    
    if not user:
         raise HTTPException(status_code=401, detail="Usuario o contraseña incorrectos")
    
    # Verificar contraseña de forma segura
    pass_valida = bcrypt.checkpw(datos.password.encode('utf-8'), user.password_hash.encode('utf-8'))
    
    if not pass_valida:
         raise HTTPException(status_code=401, detail="Usuario o contraseña incorrectos")
    
    if not user.activo:
         raise HTTPException(status_code=403, detail="El usuario está inactivo")

    rol = db.query(Rol).filter(Rol.id == user.rol_id).first()
    nombre_rol = rol.nombre if rol else "Sin Rol"

    return {
        "status": "success",
        "mensaje": "Autenticación exitosa",
        "usuario": user.usuario,
        "rol": nombre_rol
        # Aquí enviarías un Token JWT en el futuro: "access_token": "ey..."
    }


# === ENDPOINTS DE CATÁLOGOS (COMBOS EN CASCADA CON REDIS CACHÉ) ===
@app.get("/api/catalogos/estados", response_model=List[ItemCombo])
def get_estados(db: Session = Depends(get_db)):
    cache_key = "catalogo:estados"
    cached = get_cache(cache_key)
    if cached:
        return cached
    estados = db.query(Estado).order_by(Estado.nombre).all()
    resultado = [{"id": e.id, "nombre": e.nombre} for e in estados]
    set_cache(cache_key, resultado, ttl_seconds=86400) # 24 horas de caché
    return resultado

@app.get("/api/catalogos/municipios/{estado_id}", response_model=List[ItemCombo])
def get_municipios(estado_id: int, db: Session = Depends(get_db)):
    cache_key = f"catalogo:municipios:{estado_id}"
    cached = get_cache(cache_key)
    if cached:
        return cached
    municipios = db.query(Municipio).filter(Municipio.estado_id == estado_id).order_by(Municipio.nombre).all()
    resultado = [{"id": m.id, "nombre": m.nombre} for m in municipios]
    set_cache(cache_key, resultado, ttl_seconds=86400) # 24 horas de caché
    return resultado

@app.get("/api/catalogos/parroquias/{municipio_id}", response_model=List[ItemCombo])
def get_parroquias(municipio_id: int, db: Session = Depends(get_db)):
    cache_key = f"catalogo:parroquias:{municipio_id}"
    cached = get_cache(cache_key)
    if cached:
        return cached
    parroquias = db.query(Parroquia).filter(Parroquia.municipio_id == municipio_id).order_by(Parroquia.nombre).all()
    resultado = [{"id": p.id, "nombre": p.nombre} for p in parroquias]
    set_cache(cache_key, resultado, ttl_seconds=86400) # 24 horas de caché
    return resultado

# === ENDPOINTS MTT (CON CARGA PRECOMPILADA JOINEDLOAD Y CACHÉ) ===
@app.get("/api/mtt")
def listar_mtts(db: Session = Depends(get_db)):
    cache_key = "mtt:list:100"
    cached = get_cache(cache_key)
    if cached:
        return cached

    # Solución definitiva al problema N+1: joinedload encadenado MTT -> Parroquia -> Municipio -> Estado
    mtts = db.query(MttPrincipal).options(
        joinedload(MttPrincipal.parroquia).joinedload(Parroquia.municipio).joinedload(Municipio.estado),
        joinedload(MttPrincipal.organizacion),
        joinedload(MttPrincipal.voceria),
        joinedload(MttPrincipal.seguimiento)
    ).order_by(MttPrincipal.id.desc()).limit(100).all()
    
    resultado = []
    for m in mtts:
        resultado.append({
            "id": m.id,
            "codigo": m.codigo_mtt if m.codigo_mtt else "Pendiente",
            "nombre": m.nombre,
            "tipo_mtt": m.tipo,
            "estatus": m.estatus,
            "fecha_creacion": str(m.fecha_creacion) if m.fecha_creacion else None,
            "georreferenciacion": "SI" if m.tiene_georreferenciacion else "NO",
            "coordenadas_decimales": f"{m.latitud}, {m.longitud}" if m.latitud and m.longitud else None,
            "parroquia": m.parroquia.nombre if m.parroquia else "N/D",
            "municipio": m.parroquia.municipio.nombre if m.parroquia and m.parroquia.municipio else "N/D",
            "entidad_federal": m.parroquia.municipio.estado.nombre if m.parroquia and m.parroquia.municipio and m.parroquia.municipio.estado else "N/D",
            # Datos comunales
            "sector": m.organizacion.sector if m.organizacion else "N/D",
            "comuna_nombre": m.organizacion.comuna_nombre if m.organizacion else "N/D",
            "consejo_nombre": m.organizacion.consejo_nombre if m.organizacion else "N/D",
            # Datos de vocería (validando existencia y sumando)
            "total_voceros": (m.voceria.total_mujeres + m.voceria.total_hombres) if m.voceria and m.voceria.total_mujeres is not None and m.voceria.total_hombres is not None else 0,
            "total_mujeres": m.voceria.total_mujeres if m.voceria else 0,
            "total_hombres": m.voceria.total_hombres if m.voceria else 0,
            # Seguimiento
            "activador": m.seguimiento[0].activador if m.seguimiento and len(m.seguimiento) > 0 else "N/D",
            "observacion": m.seguimiento[0].observacion if m.seguimiento and len(m.seguimiento) > 0 else "SIN OBSERVACIÓN"
        })
    set_cache(cache_key, resultado, ttl_seconds=120) # 2 minutos de caché con invalidación reactiva
    return resultado

@app.post("/api/mtt")
def crear_mtt(datos: MTTCreate, db: Session = Depends(get_db)):
    try:
        mtt = MttPrincipal(
            parroquia_id=datos.parroquia_id,
            nombre=datos.nombre if datos.nombre else 'N/D',
            tipo=datos.tipo,
            fecha_creacion=datos.fecha_creacion,
            estatus=datos.estatus,
            tiene_georreferenciacion=datos.tiene_georreferenciacion,
            latitud=datos.latitud,
            longitud=datos.longitud,
            zona_cantv=datos.zona_cantv,
            medio_transmision=datos.medio_transmision,
            otras_operadoras=datos.otras_operadoras,
            elemento_red=datos.elemento_red,
            huella_gpon=datos.huella_gpon
        )
        db.add(mtt)
        db.flush()

        org = OrganizacionComunal(
            mtt_id=mtt.id,
            sector=datos.sector if datos.sector else 'N/D',
            comuna_nombre=datos.comuna_nombre if datos.comuna_nombre else 'N/D',
            comuna_codigo=datos.comuna_codigo,
            consejo_nombre=datos.consejo_nombre if datos.consejo_nombre else 'N/D',
            consejo_situr=datos.consejo_situr,
            sac_vinculada=datos.sac_vinculada,
            sac_conectada=datos.sac_conectada,
            num_comunas=datos.num_comunas,
            num_cc=datos.num_cc,
            num_comites=datos.num_comites,
            num_familias=datos.num_familias,
            num_habitantes=datos.num_habitantes
        )
        db.add(org)

        voc = Voceria(
            mtt_id=mtt.id,
            estatus_voceria=datos.estatus_voceria,
            total_mujeres=datos.total_mujeres,
            total_hombres=datos.total_hombres,
            v1_nombre=datos.v1_nombre if datos.v1_nombre else 'N/D',
            v1_cedula=datos.v1_cedula,
            v1_nacimiento=datos.v1_nacimiento,
            v1_sexo=datos.v1_sexo,
            v1_telefono=datos.v1_telefono if datos.v1_telefono else 'N/D',
            v2_nombre=datos.v2_nombre if datos.v2_nombre else 'N/D',
            v2_cedula=datos.v2_cedula,
            v2_nacimiento=datos.v2_nacimiento,
            v2_sexo=datos.v2_sexo,
            v2_telefono=datos.v2_telefono if datos.v2_telefono else 'N/D'
        )
        db.add(voc)

        seg = Seguimiento(
            mtt_id=mtt.id,
            activador=datos.activador if datos.activador else 'N/D',
            fecha_visita=datos.fecha_visita,
            observacion=datos.observacion if datos.observacion else 'SIN OBSERVACIÓN'
        )
        db.add(seg)

        db.commit()
        # Invalidar caché de listas de MTTs para reflejar el nuevo registro
        invalidate_cache("mtt:list:*")
        return {"status": "success", "mensaje": "MTT registrada exitosamente", "mtt_id": mtt.id}

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@app.patch("/api/mtt/{mtt_id}/codigo")
def asignar_codigo_mtt(mtt_id: int, payload: AsignarCodigoPayload, db: Session = Depends(get_db)):
    mtt = db.query(MttPrincipal).filter(MttPrincipal.id == mtt_id).first()
    if not mtt:
        raise HTTPException(status_code=404, detail="Mesa Técnica de Telecomunicaciones no encontrada")
    
    # Validar que el código no esté duplicado
    existe = db.query(MttPrincipal).filter(MttPrincipal.codigo_mtt == payload.codigo, MttPrincipal.id != mtt_id).first()
    if existe:
        raise HTTPException(status_code=400, detail="El código MTT ya se encuentra asignado a otra mesa")
    
    mtt.codigo_mtt = payload.codigo
    mtt.estatus = payload.estatus
    db.commit()
    db.refresh(mtt)
    # Invalidar caché de listas de MTTs para reflejar el nuevo código/estatus
    invalidate_cache("mtt:list:*")
    return {"status": "success", "mensaje": "Código MTT asignado correctamente", "codigo": mtt.codigo_mtt, "estatus": mtt.estatus}