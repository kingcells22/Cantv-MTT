import React from 'react';
import { TIPOS_MTT, REDES_SOCIALES_LIST } from '../../data/catalogos';

interface Bloque1Props {
  formData: any;
  onChange: (field: string, value: any) => void;
  isEdit?: boolean;
}

export const Bloque1Identificacion: React.FC<Bloque1Props> = ({ formData, onChange, isEdit = false }) => {
  return (
    <div className="space-y-4">
      <div className="border-b-2 border-blue-600 pb-1 mb-4 flex items-center justify-between">
        <h3 className="text-base font-bold text-blue-600 tracking-wide uppercase">
          1. Identificación y Estatus MTT
        </h3>
        {formData.codigo_mtt ? (
          <span className="text-xs bg-emerald-100 text-emerald-800 font-mono font-bold px-2.5 py-0.5 rounded">
            Código: {formData.codigo_mtt}
          </span>
        ) : (
          <span className="text-xs bg-amber-100 text-amber-800 font-medium px-2 py-0.5 rounded">
            Código Oficial: Pendiente por GDC
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* Nombre MTT */}
        <div className="md:col-span-6">
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            Nombre de la Mesa Técnica de Telecomunicaciones (MTT) *
          </label>
          <input
            type="text"
            value={formData.nombre_mtt || ''}
            onChange={(e) => onChange('nombre_mtt', e.target.value)}
            required
            className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
            placeholder="Denominación según acta de asamblea"
          />
        </div>

        {/* Tipo de MTT */}
        <div className="md:col-span-3">
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            Tipo de MTT *
          </label>
          <select
            value={formData.tipo_mtt || 'URBANA'}
            onChange={(e) => onChange('tipo_mtt', e.target.value)}
            className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
          >
            {TIPOS_MTT.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        {/* Fecha de Creación */}
        <div className="md:col-span-3">
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            Fecha de Creación *
          </label>
          <input
            type="date"
            value={formData.fecha_creacion || ''}
            onChange={(e) => {
              const val = e.target.value;
              onChange('fecha_creacion', val);
              if (val) {
                const year = new Date(val).getFullYear();
                onChange('ano_creacion', year);
              } else {
                onChange('ano_creacion', null);
              }
            }}
            required
            className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
          />
        </div>

        {/* Georreferenciación (SI/NO) */}
        <div className="md:col-span-4">
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            Georreferenciación (SI/NO)
          </label>
          <select
            value={formData.georreferenciacion || 'SI'}
            onChange={(e) => onChange('georreferenciacion', e.target.value)}
            className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
          >
            <option value="SI">Sí</option>
            <option value="NO">No</option>
          </select>
        </div>

        {/* Coordenadas Decimales */}
        <div className="md:col-span-8">
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            Georreferenciación / Coordenadas (Decimales)
          </label>
          <input
            type="text"
            value={formData.coordenadas_decimales || ''}
            onChange={(e) => onChange('coordenadas_decimales', e.target.value)}
            className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
            placeholder="Ej. 10.4806, -66.9036"
          />
        </div>

        {/* Correo Electrónico */}
        <div className="md:col-span-4">
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            Correo E. de la MTT
          </label>
          <input
            type="text"
            value={formData.correo_mtt || ''}
            onChange={(e) => onChange('correo_mtt', e.target.value)}
            className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
            placeholder="mtt@cantv.gob.ve o «N/D»"
          />
        </div>

        {/* Uso de Redes Sociales */}
        <div className="md:col-span-4">
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            Uso de Redes Sociales (SI/NO)
          </label>
          <select
            value={formData.uso_redes_sociales || 'NO'}
            onChange={(e) => onChange('uso_redes_sociales', e.target.value)}
            className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
          >
            <option value="SI">Sí</option>
            <option value="NO">No</option>
          </select>
        </div>

        {/* Red Social Más Utilizada */}
        <div className="md:col-span-4">
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            Red Social Más Utilizada
          </label>
          <select
            value={formData.red_social_mas_utilizada || ''}
            onChange={(e) => onChange('red_social_mas_utilizada', e.target.value || null)}
            className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
          >
            <option value="">Seleccione si aplica...</option>
            {REDES_SOCIALES_LIST.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

