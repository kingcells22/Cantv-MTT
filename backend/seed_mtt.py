import pandas as pd
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from models import Estado, Municipio, Parroquia, MttPrincipal, OrganizacionComunal, Voceria, Seguimiento
import warnings

# Ignorar warnings de pandas
warnings.filterwarnings('ignore')

# Configuración de BD
DATABASE_URL = "postgresql+psycopg2://postgres:123456@localhost/mtt_db"
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
db = SessionLocal()

# === FUNCIONES DE LIMPIEZA SEGÚN DICCIONARIO DE DATOS ===
def clean_int(val):
    if pd.isna(val) or val == 'N/D' or str(val).strip() == '': return None
    try: return int(float(val))
    except: return None

def clean_str(val):
    if pd.isna(val): return 'N/D'
    s = str(val).strip()
    return 'N/D' if s == '' or s == 'nan' else s

def clean_bool(val):
    if pd.isna(val): return False
    return str(val).strip().upper() in ['SI', 'SÍ', 'TRUE', '1']

def clean_date(val):
    if pd.isna(val) or val == 'N/D': return None
    try: return pd.to_datetime(val).date()
    except: return None

def cargar_mtts():
    print("Cargando y fusionando archivos Excel de MTT y Georreferenciación...")
    try:
        # Se lee desde la fila 1 (header=1) porque el archivo principal tiene un encabezado anidado
        df_mtt = pd.read_excel("DATA/Copia de VERS30102026 (2) (1).xlsx", header=1)
        df_geo = pd.read_excel("DATA/GEORREFERENCIACIÓN DE MTT (1).xlsx")

        # Fusionar por Código MTT para tener todos los datos juntos
        df_completo = pd.merge(df_mtt, df_geo, left_on='CODIGO DE LA MTT', right_on='CODIGO DE LA MTT', how='inner')

        print(f"Se procesarán {len(df_completo)} registros MTT unificados...")
        
        for index, row in df_completo.iterrows():
            codigo = str(row['CODIGO DE LA MTT']).strip()
            
            # --- 1. RESOLVER UBICACIÓN GEOGRÁFICA (Tolerancia a errores de tipeo) ---
            estado_nombre = clean_str(row.get('ENTIDAD FEDERAL_x', 'N/D'))
            municipio_nombre = clean_str(row.get('MUNICIPIO_x', 'N/D'))
            parroquia_nombre = clean_str(row.get('PARROQUIA_x', 'N/D'))

            # Busca o crea dinámicamente si hay errores de acentuación del INE
            estado = db.query(Estado).filter(Estado.nombre.ilike(estado_nombre)).first()
            if not estado:
                estado = Estado(nombre=estado_nombre)
                db.add(estado)
                db.commit()
            
            municipio = db.query(Municipio).filter(Municipio.nombre.ilike(municipio_nombre), Municipio.estado_id == estado.id).first()
            if not municipio:
                municipio = Municipio(nombre=municipio_nombre, estado_id=estado.id)
                db.add(municipio)
                db.commit()

            parroquia = db.query(Parroquia).filter(Parroquia.nombre.ilike(parroquia_nombre), Parroquia.municipio_id == municipio.id).first()
            if not parroquia:
                parroquia = Parroquia(nombre=parroquia_nombre, municipio_id=municipio.id)
                db.add(parroquia)
                db.commit()
            
            # --- 2. EXTRAER COORDENADAS NUMÉRICAS ---
            latitud, longitud = None, None
            coordenadas = str(row.get('Latitud (Decimal) Y Longitud (Decimal)', ''))
            if coordenadas and 'N/D' not in coordenadas and ',' in coordenadas:
                try:
                    partes = coordenadas.split(',')
                    latitud = float(partes[0].strip())
                    longitud = float(partes[1].strip())
                except:
                    pass

            # --- 3. CREAR MTT PRINCIPAL ---
            mtt = db.query(MttPrincipal).filter_by(codigo_mtt=codigo).first()
            if not mtt:
                mtt = MttPrincipal(
                    codigo_mtt=codigo,
                    parroquia_id=parroquia.id,
                    nombre=clean_str(row.get('NOMBRE DE LA MESA TECNICA DE TELECOMUNICACIONES (MTT)_x')),
                    tipo=clean_str(row.get('TIPO DE MESA TECNICA DE TELECOMUNICACIONES')),
                    fecha_creacion=clean_date(row.get('FECHA DE CREACION')),
                    estatus=clean_str(row.get('ESTATUS DE LA MTT')),
                    tiene_georreferenciacion=clean_bool(row.get('GEORREFERENCIACION')),
                    latitud=latitud,
                    longitud=longitud,
                    zona_cantv=clean_bool(row.get('ZONA SERVIDA (SI/NO)')),
                    huella_gpon=clean_bool(row.get('MTT EN EL P400/RUTA GPON\n(SI/NO)'))
                )
                db.add(mtt)
                db.commit()
                db.refresh(mtt)

                # --- 4. CREAR TABLAS RELACIONALES ---
                # Organización Comunal
                org = OrganizacionComunal(
                    mtt_id=mtt.id,
                    sector=clean_str(row.get('SECTOR_x')),
                    comuna_nombre=clean_str(row.get('NOMBRE DE LA COMUNA ESPECIFICAR UNO (1)')),
                    comuna_codigo=clean_str(row.get('CODIGO SITUR DE LA COMUNA')),
                    consejo_nombre=clean_str(row.get('NOMBRE DEL CONSEJO COMUNAL ESPECIFICAR UNO (1)')),
                    consejo_situr=clean_str(row.get('CODIGO SITUR DEL CONSEJO COMUNAL')),
                    sac_vinculada=clean_bool(row.get('SALA DE GOBIERNO VINCULADA (Si / No)')),
                    num_cc=clean_int(row.get('N° DE CONSEJOS COMUNALES_x')),
                    num_comites=clean_int(row.get('N° DE COMITES DE MESA TECNICA DE TELECOMUNICACIONES')),
                    num_familias=clean_int(row.get('N° DE FAMILIAS')),
                    num_habitantes=clean_int(row.get('N° DE HABITANTES'))
                )
                db.add(org)

                # Vocerías
                voceria = Voceria(
                    mtt_id=mtt.id,
                    estatus_voceria=clean_str(row.get('ESTATUS DE LAS VOCERIAS')),
                    total_mujeres=clean_int(row.get('CANTIDAD DE VOCERAS CC QUE CONFORMAN LA MTT \n(MUJERES VOCERAS)')) or 0,
                    total_hombres=clean_int(row.get('CANTIDAD DE VOCEROS CC QUE CONFORMAN LA MTT \n(HOMBRES VOCERAS)')) or 0,
                    v1_nombre=clean_str(row.get('NOMBRE Y APELLIDO')),
                    v1_cedula=clean_str(row.get('N° DE CEDULA DE IDENTIDAD')),
                    v1_nacimiento=clean_date(row.get('FECHA DE NACIMIENTO')),
                    v1_sexo=clean_str(row.get('SEXO')),
                    v1_telefono=clean_str(row.get('N° DE TELEFONO PARA EL CONTACTO')),
                    v2_nombre=clean_str(row.get('NOMBRE Y APELLIDO.1')),
                    v2_cedula=clean_str(row.get('N° DE CEDULA DE IDENTIDAD.1')),
                    v2_nacimiento=clean_date(row.get('FECHA DE NACIMIENTO.1')),
                    v2_sexo=clean_str(row.get('SEXO.1')),
                    v2_telefono=clean_str(row.get('N° DE TELEFONO PARA EL CONTACTO.1'))
                )
                db.add(voceria)

                # Seguimiento
                seg = Seguimiento(
                    mtt_id=mtt.id,
                    observacion=clean_str(row.get('OBSERVACION')),
                    verificado_gerencia=clean_bool(row.get('VERIFICADO POR EL GERENTE DE LA REGION')),
                    fecha_visita=clean_date(row.get('FECHA DEL CAMBIO DE ESTATUS DE LA MTT'))
                )
                db.add(seg)

        db.commit()
        print("¡Migración masiva de registros MTT y relaciones completada exitosamente!")
    
    except Exception as e:
        db.rollback()
        print(f"Error durante la migración: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    cargar_mtts()