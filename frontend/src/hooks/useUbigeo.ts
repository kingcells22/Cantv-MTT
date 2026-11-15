import { useState, useMemo, useCallback } from 'react';
import ubigeoRaw from '../data/ubigeo_ine.json';
import parishSequencesRaw from '../data/parish_sequences.json';

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
type SequenceDict = Record<string, number>;

const ubigeoData: UbigeoDict = ubigeoRaw as unknown as UbigeoDict;
const parishSequences: SequenceDict = parishSequencesRaw as unknown as SequenceDict;

// Normalize accents and trim
const normalize = (str: string) =>
  str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toUpperCase();

export const useUbigeo = (initialEstado = '', initialMunicipio = '', initialParroquia = '') => {
  const [estado, setEstado] = useState<string>(initialEstado);
  const [municipio, setMunicipio] = useState<string>(initialMunicipio);
  const [parroquia, setParroquia] = useState<string>(initialParroquia);

  const estados = useMemo(() => {
    return Object.keys(ubigeoData).sort();
  }, []);

  const municipios = useMemo(() => {
    if (!estado) return [];
    // Tolerant lookup
    const foundStateKey = Object.keys(ubigeoData).find((e) => normalize(e) === normalize(estado));
    if (!foundStateKey || !ubigeoData[foundStateKey]) return [];
    return Object.keys(ubigeoData[foundStateKey].municipios).sort();
  }, [estado]);

  const parroquias = useMemo(() => {
    if (!estado || !municipio) return [];
    const foundStateKey = Object.keys(ubigeoData).find((e) => normalize(e) === normalize(estado));
    if (!foundStateKey || !ubigeoData[foundStateKey]) return [];
    
    const munDict = ubigeoData[foundStateKey].municipios;
    const foundMunKey = Object.keys(munDict).find((m) => normalize(m) === normalize(municipio));
    if (!foundMunKey || !munDict[foundMunKey]) return [];
    
    return munDict[foundMunKey].parroquias;
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

  // 6-digit Ubigeo Code (Automatic and strictly derived from State, Municipality, Parish)
  const currentUbigeoCode = useMemo(() => {
    if (!estado || !municipio || !parroquia) return null;
    const normParr = normalize(parroquia);
    const found = parroquias.find((p) => normalize(p.nombre) === normParr);
    return found ? found.ubigeo_code : null;
  }, [estado, municipio, parroquia, parroquias]);

  // Next suggested Correlative (.YY) for this parish based on existing MTT sequences
  const nextCorrelativo = useMemo(() => {
    if (!currentUbigeoCode) return null;
    const currentMax = parishSequences[currentUbigeoCode] || 0;
    return String(currentMax + 1).padStart(2, '0');
  }, [currentUbigeoCode]);

  // Suggested Full Official Code: XXXXXX.YY
  const suggestedFullCode = useMemo(() => {
    if (!currentUbigeoCode || !nextCorrelativo) return null;
    return `${currentUbigeoCode}.${nextCorrelativo}`;
  }, [currentUbigeoCode, nextCorrelativo]);

  // Reverse resolver: Resolve full hierarchy from a 6-digit ubigeo code
  const resolveLocationFromUbigeoCode = useCallback((code6d: string) => {
    if (!code6d || code6d.length !== 6) return null;
    for (const [estName, estInfo] of Object.entries(ubigeoData)) {
      for (const [munName, munInfo] of Object.entries(estInfo.municipios)) {
        for (const p of munInfo.parroquias) {
          if (p.ubigeo_code === code6d) {
            return {
              estado: estName,
              municipio: munName,
              parroquia: p.nombre,
              ubigeoCode: p.ubigeo_code,
              codEntidad: estInfo.cod_entidad,
              codMunicipio: munInfo.cod_municipio,
              codParroquia: p.cod_parroquia,
            };
          }
        }
      }
    }
    return null;
  }, []);

  return {
    estados,
    municipios,
    parroquias,
    estado,
    municipio,
    parroquia,
    currentUbigeoCode,
    nextCorrelativo,
    suggestedFullCode,
    handleEstadoChange,
    handleMunicipioChange,
    handleParroquiaChange,
    setFullLocation,
    resolveLocationFromUbigeoCode,
  };
};
