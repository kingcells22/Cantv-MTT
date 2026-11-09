import React, { useEffect } from 'react';
import { REGIONES, SAC_CONECTADA_LIST, CEC_COMUNA_LIST } from '../../data/catalogos';
import { useUbigeo } from '../../hooks/useUbigeo';

interface Bloque2Props {
  formData: any;
  onChange: (field: string, value: any) => void;
}

export const Bloque2Comunal: React.FC<Bloque2Props> = ({ formData, onChange }) => {
  const {
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
  } = useUbigeo(formData.entidad_federal, formData.municipio, formData.parroquia);

  // Sync external changes
  useEffect(() => {
    if (
      formData.entidad_federal !== estado ||
      formData.municipio !== municipio ||
      formData.parroquia !== parroquia
    ) {
      if (formData.entidad_federal && !estado) {
        setFullLocation(formData.entidad_federal, formData.municipio, formData.parroquia);
      }
    }
  }, [formData.entidad_federal, formData.municipio, formData.parroquia]);

  // Sync code to formData
  useEffect(() => {
    if (currentUbigeoCode && formData.parroquia_id !== currentUbigeoCode) {
      onChange('parroquia_id', currentUbigeoCode);
    }
  }, [currentUbigeoCode]);

  return (
    <div className="space-y-4 pt-2">
      <div className="border-b-2 border-blue-600 pb-1 mb-4 flex items-center justify-between">
        <h3 className="text-base font-bold text-blue-600 tracking-wide uppercase">
          2. Organización Comunal y Demografía (Maestro INE)
        </h3>
        {currentUbigeoCode && (
          <span className="text-xs bg-blue-100 text-blue-800 font-mono font-bold px-2 py-0.5 rounded">
            Ubigeo INE: {currentUbigeoCode}
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* Región */}
        <div className="md:col-span-3">
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            Región *
          </label>
          <select
            value={formData.region || 'CAPITAL'}
            onChange={(e) => onChange('region', e.target.value)}
            className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
          >
            {REGIONES.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>

        {/* Entidad Federal (Estado) */}
        <div className="md:col-span-3">
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            Entidad Federal (Estado) *
          </label>
          <select
            value={estado || ''}
            onChange={(e) => {
              const val = e.target.value;
              handleEstadoChange(val);
              onChange('entidad_federal', val);
              onChange('municipio', '');
              onChange('parroquia', '');
            }}
            required
            className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white font-medium"
          >
            <option value="">Seleccione Estado...</option>
            {estados.map((edo) => (
              <option key={edo} value={edo}>
                {edo}
              </option>
            ))}
          </select>
        </div>

        {/* Municipio */}
        <div className="md:col-span-3">
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            Municipio *
          </label>
          <select
            value={municipio || ''}
            onChange={(e) => {
              const val = e.target.value;
              handleMunicipioChange(val);
              onChange('municipio', val);
              onChange('parroquia', '');
            }}
            disabled={!estado || municipios.length === 0}
            required
            className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white disabled:bg-gray-100 disabled:text-gray-400"
          >
            <option value="">
              {!estado ? 'Seleccione Estado primero...' : 'Seleccione Municipio...'}
            </option>
            {municipios.map((muni) => (
              <option key={muni} value={muni}>
                {muni}
              </option>
            ))}
          </select>
        </div>

        {/* Parroquia */}
        <div className="md:col-span-3">
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            Parroquia *
          </label>
          <select
            value={parroquia || ''}
            onChange={(e) => {
              const val = e.target.value;
              handleParroquiaChange(val);
              onChange('parroquia', val);
            }}
            disabled={!municipio || parroquias.length === 0}
            required
            className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white disabled:bg-gray-100 disabled:text-gray-400"
          >
            <option value="">
              {!municipio ? 'Seleccione Municipio primero...' : 'Seleccione Parroquia...'}
            </option>
            {parroquias.map((p) => (
              <option key={p.ubigeo_code} value={p.nombre}>
                {p.nombre} ({p.ubigeo_code})
              </option>
            ))}
          </select>
        </div>

        {/* Nombre Circuito Comunal */}
        <div className="md:col-span-4">
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            Nombre Circuito Comunal / Comuna
          </label>
          <input
            type="text"
            value={formData.nombre_circuito_comunal || ''}
            onChange={(e) => onChange('nombre_circuito_comunal', e.target.value)}
            className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
            placeholder="Comuna asociada o «N/D»"
          />
        </div>

        {/* Código Circuito Comunal */}
        <div className="md:col-span-4">
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            Código Circuito Comunal / Comuna
          </label>
          <input
            type="text"
            value={formData.codigo_circuito_comunal || ''}
            onChange={(e) => onChange('codigo_circuito_comunal', e.target.value)}
            className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
            placeholder="Ej. C-URB-2017-09-0001"
          />
        </div>

        {/* CEC / Comuna */}
        <div className="md:col-span-4">
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            CEC / Comuna
          </label>
          <select
            value={formData.cec_comuna || ''}
            onChange={(e) => onChange('cec_comuna', e.target.value || null)}
            className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
          >
            <option value="">Seleccione si aplica...</option>
            {CEC_COMUNA_LIST.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {/* Nombre Consejo Comunal */}
        <div className="md:col-span-6">
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            Nombre del Consejo Comunal Referencia
          </label>
          <input
            type="text"
            value={formData.nombre_cc_referencia || ''}
            onChange={(e) => onChange('nombre_cc_referencia', e.target.value)}
            className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
            placeholder="Consejo Comunal de referencia"
          />
        </div>

        {/* Código SITUR */}
        <div className="md:col-span-6">
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            Código SITUR del Consejo Comunal
          </label>
          <input
            type="text"
            value={formData.codigo_situr_cc || ''}
            onChange={(e) => onChange('codigo_situr_cc', e.target.value)}
            className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
            placeholder="Ej. SITUR-1002"
          />
        </div>

        {/* SAC Vinculada */}
        <div className="md:col-span-3">
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            SAC Vinculada (SI/NO)
          </label>
          <select
            value={formData.sac_vinculada || 'NO'}
            onChange={(e) => onChange('sac_vinculada', e.target.value)}
            className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
          >
            <option value="SI">Sí</option>
            <option value="NO">No</option>
          </select>
        </div>

        {/* SAC Conectada */}
        <div className="md:col-span-3">
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            SAC Conectada
          </label>
          <select
            value={formData.sac_conectada || ''}
            onChange={(e) => onChange('sac_conectada', e.target.value || null)}
            className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
          >
            <option value="">Seleccione...</option>
            {SAC_CONECTADA_LIST.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        {/* N° CC */}
        <div className="md:col-span-3">
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            N° de Consejos Comunales
          </label>
          <input
            type="number"
            min="0"
            value={formData.num_cc ?? ''}
            onChange={(e) => onChange('num_cc', e.target.value)}
            className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
            placeholder="Total CCs"
          />
        </div>

        {/* N° Comités MTT */}
        <div className="md:col-span-3">
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            N° de Comités de MTT
          </label>
          <input
            type="number"
            min="0"
            value={formData.num_comites_mtt ?? ''}
            onChange={(e) => onChange('num_comites_mtt', e.target.value)}
            className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
            placeholder="Total comités"
          />
        </div>

        {/* N° Familias */}
        <div className="md:col-span-6">
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            N° de Familias
          </label>
          <input
            type="number"
            min="0"
            value={formData.num_familias ?? ''}
            onChange={(e) => onChange('num_familias', e.target.value)}
            className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
            placeholder="Total familias en territorio"
          />
        </div>

        {/* N° Habitantes */}
        <div className="md:col-span-6">
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            N° de Habitantes
          </label>
          <input
            type="number"
            min="0"
            value={formData.num_habitantes ?? ''}
            onChange={(e) => onChange('num_habitantes', e.target.value)}
            className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
            placeholder="Total habitantes censados"
          />
        </div>
      </div>
    </div>
  );
};

