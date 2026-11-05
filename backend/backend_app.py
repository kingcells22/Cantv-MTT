from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from typing import List, Optional
from datetime import date
from decimal import Decimal
import bcrypt # Para encriptar contraseñas

# === IMPORTACIÓN DE MODELOS ORM ===
from models import (
    Rol, Usuario, MttPrincipal, OrganizacionComunal,
    Voceria, Seguimiento, Region, Estado, Municipio, Parroquia
)

# === CONFIGURACIÓN DE BASE DE DATOS POSTGRESQL ===
DATABASE_URL = "postgresql+psycopg2://postgres:123456@localhost/mtt_db"
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

app = FastAPI(title="API Sistema MTT")

# Configuración para encriptar contraseñas

# === CONFIGURACIÓN DE CORS ===
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
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


# === ENDPOINTS DE CATÁLOGOS (COMBOS EN CASCADA) ===
@app.get("/api/catalogos/estados", response_model=List[ItemCombo])
def get_estados(db: Session = Depends(get_db)):
    return db.query(Estado).order_by(Estado.nombre).all()

@app.get("/api/catalogos/municipios/{estado_id}", response_model=List[ItemCombo])
def get_municipios(estado_id: int, db: Session = Depends(get_db)):
    return db.query(Municipio).filter(Municipio.estado_id == estado_id).order_by(Municipio.nombre).all()

@app.get("/api/catalogos/parroquias/{municipio_id}", response_model=List[ItemCombo])
def get_parroquias(municipio_id: int, db: Session = Depends(get_db)):
    return db.query(Parroquia).filter(Parroquia.municipio_id == municipio_id).order_by(Parroquia.nombre).all()

# === ENDPOINTS MTT ===
@app.get("/api/mtt", response_model=List[MTTList])
def listar_mtt(db: Session = Depends(get_db)):
    try:
        # Traemos los últimos 100 para no sobrecargar el front por ahora
        resultados = db.query(MttPrincipal).order_by(MttPrincipal.id.desc()).limit(100).all()
        mtts = []
        for row in resultados:
            mtts.append(MTTList(
                codigo=row.codigo_mtt if row.codigo_mtt else "Pendiente",
                nombre=row.nombre,
                estatus=row.estatus
            ))
        if not mtts:
            mtts.append(MTTList(codigo="SIN DATOS", nombre="No hay MTTs", estatus="Vacío"))
        return mtts
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

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
        return {"status": "success", "mensaje": "MTT registrada exitosamente", "mtt_id": mtt.id}

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))