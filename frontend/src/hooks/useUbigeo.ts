import { useState, useMemo } from 'react';
import ubigeoRaw from '../data/ubigeo_ine.json';

interface ParroquiaInfo {
  nombre: string;
  ubigeo_code: string;
  cod_parroquia: string;
}

interface MunicipioInfo {
  cod_municipio: string;
  parroquias: ParroquiaInfo[];
}

interface EstadoInfo {
  cod_entidad: string;
  municipios: Record<string, MunicipioInfo>;
}

type UbigeoDict = Record<string, EstadoInfo>;

const ubigeoData: UbigeoDict = ubigeoRaw as unknown as UbigeoDict;

export const useUbigeo = (initialEstado = '', initialMunicipio = '', initialParroquia = '') => {
  const [estado, setEstado] = useState<string>(initialEstado);
  const [municipio, setMunicipio] = useState<string>(initialMunicipio);
  const [parroquia, setParroquia] = useState<string>(initialParroquia);

  const estados = useMemo(() => {
    return Object.keys(ubigeoData).sort();
  }, []);

  const municipios = useMemo(() => {
    if (!estado || !ubigeoData[estado]) return [];
    return Object.keys(ubigeoData[estado].municipios).sort();
  }, [estado]);

  const parroquias = useMemo(() => {
    if (!estado || !municipio || !ubigeoData[estado]?.municipios[municipio]) return [];
    return ubigeoData[estado].municipios[municipio].parroquias;
  }, [estado, municipio]);

  const handleEstadoChange = (newEstado: string) => {
    setEstado(newEstado);
    setMunicipio('');
    setParroquia('');
  };

  const handleMunicipioChange = (newMunicipio: string) => {
    setMunicipio(newMunicipio);
    setParroquia('');
  };

  const handleParroquiaChange = (newParroquia: string) => {
    setParroquia(newParroquia);
  };

  const setFullLocation = (e: string, m: string, p: string) => {
    setEstado(e);
    setMunicipio(m);
    setParroquia(p);
  };

  const currentUbigeoCode = useMemo(() => {
    if (!estado || !municipio || !parroquia) return null;
    const found = parroquias.find((p) => p.nombre.toUpperCase() === parroquia.toUpperCase());
    return found ? found.ubigeo_code : null;
  }, [estado, municipio, parroquia, parroquias]);

  return {
    estados,
    municipios,
    parroquias,
    estado,
    municipio,
    parroquia,
    currentUbigeoCode,
    handleEstadoChange,
    handleMunicipioChange,
    handleParroquiaChange,
    setFullLocation,
  };
};

