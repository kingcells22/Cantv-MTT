import pandas as pd
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from models import Estado, Municipio, Parroquia

# Configuración de BD
DATABASE_URL = "postgresql+psycopg2://postgres:123456@localhost/mtt_db"
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
db = SessionLocal()

def poblar_bd():
    ruta_archivo = "DATA/COD_UBIGEO_NUEVO_20102026.xlsx"
    print(f"Leyendo archivo Excel {ruta_archivo}...")
    try:
        # Leer el Excel desde la subcarpeta DATA
        df = pd.read_excel(ruta_archivo)
        df = df.dropna(subset=["parroquia_ine"])

        cache_estados = {}
        cache_municipios = {}

        print("Procesando datos geográficos del INE...")
        for index, row in df.iterrows():
            # 1. Procesar Estado
            estado_nombre = str(row.get("entidad_ine", "")).strip()
            if estado_nombre not in cache_estados:
                estado = db.query(Estado).filter_by(nombre=estado_nombre).first()
                if not estado:
                    estado = Estado(nombre=estado_nombre)
                    db.add(estado)
                    db.commit()
                    db.refresh(estado)
                cache_estados[estado_nombre] = estado.id

            # 2. Procesar Municipio
            municipio_nombre = str(row.get("municipio_ine", "")).strip()
            mun_key = f"{estado_nombre}-{municipio_nombre}"
            if mun_key not in cache_municipios:
                municipio = db.query(Municipio).filter_by(nombre=municipio_nombre, estado_id=cache_estados[estado_nombre]).first()
                if not municipio:
                    municipio = Municipio(nombre=municipio_nombre, estado_id=cache_estados[estado_nombre])
                    db.add(municipio)
                    db.commit()
                    db.refresh(municipio)
                cache_municipios[mun_key] = municipio.id

            # 3. Procesar Parroquia
            parroquia_nombre = str(row.get("parroquia_ine", "")).strip()
            parroquia = db.query(Parroquia).filter_by(nombre=parroquia_nombre, municipio_id=cache_municipios[mun_key]).first()
            if not parroquia:
                parroquia = Parroquia(nombre=parroquia_nombre, municipio_id=cache_municipios[mun_key])
                db.add(parroquia)
        
        db.commit()
        print("¡Migración de Ubigeo completada exitosamente!")

    except Exception as e:
        db.rollback()
        print(f"Error durante la migración: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    poblar_bd()