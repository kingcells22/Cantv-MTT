import React from 'react';
import {
  MEDIOS_TRANSMISION,
  OTRAS_OPERADORAS_LIST,
  OPERADORAS_LIST,
  ELEMENTOS_RED,
  NOMBRES_NODOS,
} from '../../data/catalogos';

interface Bloque3Props {
  formData: any;
  onChange: (field: string, value: any) => void;
}

export const Bloque3Tecnico: React.FC<Bloque3Props> = ({ formData, onChange }) => {
  return (
    <div className="space-y-4 pt-2">
      <div className="border-b-2 border-blue-600 pb-1 mb-4 flex items-center justify-between">
        <h3 className="text-base font-bold text-blue-600 tracking-wide uppercase">
          3. Información Técnica de Telecomunicaciones (VER8)
        </h3>
        <span className="text-[11px] bg-blue-50 text-blue-700 font-bold px-2 py-0.5 rounded border border-blue-200">
          Variables 28 - 33
        </span>
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

        {/* Operadoras */}
        <div className="md:col-span-6">
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            Operadoras en la Zona
          </label>
          <select
            value={formData.operadoras || formData.otras_operadoras || ''}
            onChange={(e) => {
              const val = e.target.value || null;
              onChange('operadoras', val);
              onChange('otras_operadoras', val);
            }}
            className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
          >
            <option value="">Seleccione operadora...</option>
            {OPERADORAS_LIST.map((op) => (
              <option key={op} value={op}>
                {op}
              </option>
            ))}
          </select>
        </div>

        {/* Central CANTV Cercana (VER8) */}
        <div className="md:col-span-6">
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            Central CANTV Cercana (VER8)
          </label>
          <input
            type="text"
            value={formData.central_cantv_cercana || ''}
            onChange={(e) => onChange('central_cantv_cercana', e.target.value || null)}
            placeholder="Ej. Central Sabana Grande, Central El Silencio..."
            className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
          />
        </div>

        {/* Nombre Nodo (VER8 - 170 Nodos) */}
        <div className="md:col-span-6">
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            Nombre de Nodo (VER8)
          </label>
          <select
            value={formData.nombre_nodo || ''}
            onChange={(e) => onChange('nombre_nodo', e.target.value || null)}
            className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white font-mono text-xs"
          >
            <option value="">Seleccione Nodo de Red...</option>
            {NOMBRES_NODOS.map((nodo) => (
              <option key={nodo} value={nodo}>
                {nodo}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

