from sqlalchemy import Column, Integer, String, Boolean, Date, Numeric, ForeignKey, Text, Computed
from sqlalchemy.orm import declarative_base, relationship

Base = declarative_base()

# === CATÁLOGOS GEOGRÁFICOS ===
class Region(Base):
    __tablename__ = 'regiones'
    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(50), unique=True, nullable=False)

class Estado(Base):
    __tablename__ = 'estados'
    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(50), unique=True, nullable=False)
    region_id = Column(Integer, ForeignKey('regiones.id'))

class Municipio(Base):
    __tablename__ = 'municipios'
    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(100), nullable=False)
    estado_id = Column(Integer, ForeignKey('estados.id'))

class Parroquia(Base):
    __tablename__ = 'parroquias'
    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(100), nullable=False)
    municipio_id = Column(Integer, ForeignKey('municipios.id'))

# === SEGURIDAD ===
class Rol(Base):
    __tablename__ = 'roles'
    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(100), unique=True, nullable=False)
    nivel_acceso = Column(String(50))
    descripcion = Column(Text)

class Usuario(Base):
    __tablename__ = 'usuarios'
    id = Column(Integer, primary_key=True, index=True)
    usuario = Column(String(50), unique=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    rol_id = Column(Integer, ForeignKey('roles.id'))
    activo = Column(Boolean, default=True)

# === MTT PRINCIPAL Y RELACIONES ===
class MttPrincipal(Base):
    __tablename__ = 'mtt_principal'
    id = Column(Integer, primary_key=True, index=True)
    codigo_mtt = Column(String(50), unique=True)
    parroquia_id = Column(Integer, ForeignKey('parroquias.id'))
    nombre = Column(Text, default='N/D') # Ajustado a Text
    tipo = Column(String(50))
    fecha_creacion = Column(Date)
    estatus = Column(String(50), default='Pendiente GDC')
    tiene_georreferenciacion = Column(Boolean)
    latitud = Column(Numeric(10, 5))
    longitud = Column(Numeric(10, 5))
    zona_cantv = Column(Boolean)
    medio_transmision = Column(String(50))
    otras_operadoras = Column(String(50))
    elemento_red = Column(String(100))
    huella_gpon = Column(Boolean)

    # Relaciones para acceder fácilmente a los datos vinculados
    organizacion = relationship("OrganizacionComunal", back_populates="mtt", uselist=False, cascade="all, delete")
    voceria = relationship("Voceria", back_populates="mtt", uselist=False, cascade="all, delete")
    seguimiento = relationship("Seguimiento", back_populates="mtt", cascade="all, delete")

class OrganizacionComunal(Base):
    __tablename__ = 'organizacion_comunal'
    id = Column(Integer, primary_key=True, index=True)
    mtt_id = Column(Integer, ForeignKey('mtt_principal.id', ondelete='CASCADE'))
    sector = Column(Text, default='N/D') # Ajustado a Text
    comuna_nombre = Column(Text, default='N/D') # Ajustado a Text
    comuna_codigo = Column(String(50))
    consejo_nombre = Column(Text, default='N/D') # Ajustado a Text
    consejo_situr = Column(String(50))
    sac_vinculada = Column(Boolean)
    sac_conectada = Column(String(50))
    num_comunas = Column(Integer)
    num_cc = Column(Integer)
    num_comites = Column(Integer)
    num_familias = Column(Integer)
    num_habitantes = Column(Integer)

    mtt = relationship("MttPrincipal", back_populates="organizacion")

class Voceria(Base):
    __tablename__ = 'vocerias'
    id = Column(Integer, primary_key=True, index=True)
    mtt_id = Column(Integer, ForeignKey('mtt_principal.id', ondelete='CASCADE'))
    estatus_voceria = Column(String(50))
    total_mujeres = Column(Integer, default=0)
    total_hombres = Column(Integer, default=0)
    total_voceros = Column(Integer, Computed('total_mujeres + total_hombres'))
    v1_nombre = Column(Text, default='N/D') # Ajustado a Text
    v1_cedula = Column(String(20))
    v1_nacimiento = Column(Date)
    v1_sexo = Column(String(15))
    v1_telefono = Column(String(20), default='N/D')
    v2_nombre = Column(Text, default='N/D') # Ajustado a Text
    v2_cedula = Column(String(20))
    v2_nacimiento = Column(Date)
    v2_sexo = Column(String(15))
    v2_telefono = Column(String(20), default='N/D')

    mtt = relationship("MttPrincipal", back_populates="voceria")

class Seguimiento(Base):
    __tablename__ = 'seguimiento'
    id = Column(Integer, primary_key=True, index=True)
    mtt_id = Column(Integer, ForeignKey('mtt_principal.id', ondelete='CASCADE'))
    activador = Column(String(150), default='N/D')
    fecha_visita = Column(Date)
    observacion = Column(Text, default='SIN OBSERVACIÓN')
    verificado_gerencia = Column(Boolean, default=False)
    fecha_verificacion = Column(Date)

    mtt = relationship("MttPrincipal", back_populates="seguimiento")