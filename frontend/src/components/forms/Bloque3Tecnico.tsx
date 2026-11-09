import React from 'react';
import {
  MEDIOS_TRANSMISION,
  OTRAS_OPERADORAS_LIST,
  ELEMENTOS_RED,
} from '../../data/catalogos';

interface Bloque3Props {
  formData: any;
  onChange: (field: string, value: any) => void;
}

export const Bloque3Tecnico: React.FC<Bloque3Props> = ({ formData, onChange }) => {
  return (
    <div className="space-y-4 pt-2">
      <div className="border-b-2 border-blue-600 pb-1 mb-4">
        <h3 className="text-base font-bold text-blue-600 tracking-wide uppercase">
          3. Información Técnica de Telecomunicaciones
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* Zona Servida */}
        <div className="md:col-span-4">
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            Zona Servida por CANTV (SI/NO) *
          </label>
          <select
            value={formData.zona_servida || 'SI'}
            onChange={(e) => onChange('zona_servida', e.target.value)}
            className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
          >
            <option value="SI">Sí</option>
            <option value="NO">No</option>
          </select>
        </div>

        {/* Elemento de la Red */}
        <div className="md:col-span-4">
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            Elemento de la Red
          </label>
          <select
            value={formData.elemento_red || ''}
            onChange={(e) => onChange('elemento_red', e.target.value || null)}
            className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
          >
            <option value="">Seleccione Elemento...</option>
            {ELEMENTOS_RED.map((el) => (
              <option key={el} value={el}>
                {el}
              </option>
            ))}
          </select>
        </div>

        {/* MTT en Huella GPON */}
        <div className="md:col-span-4">
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            MTT en Huella GPON (SI/NO) *
          </label>
          <select
            value={formData.mtt_en_huella_gpon || 'NO'}
            onChange={(e) => onChange('mtt_en_huella_gpon', e.target.value)}
            className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
          >
            <option value="SI">Sí</option>
            <option value="NO">No</option>
          </select>
        </div>

        {/* Medio de Transmisión */}
        <div className="md:col-span-6">
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            Medio de Transmisión
          </label>
          <select
            value={formData.medio_transmision || ''}
            onChange={(e) => onChange('medio_transmision', e.target.value || null)}
            className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
          >
            <option value="">Seleccione Medio...</option>
            {MEDIOS_TRANSMISION.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>

        {/* Otras Operadoras */}
        <div className="md:col-span-6">
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            Otras Operadoras en la Zona
          </label>
          <select
            value={formData.otras_operadoras || ''}
            onChange={(e) => onChange('otras_operadoras', e.target.value || null)}
            className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
          >
            <option value="">Seleccione si existe otra operadora...</option>
            {OTRAS_OPERADORAS_LIST.map((op) => (
              <option key={op} value={op}>
                {op}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

