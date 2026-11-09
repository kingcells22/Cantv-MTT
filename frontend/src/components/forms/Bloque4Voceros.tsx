import React from 'react';
import { ESTATUS_VOCERIAS_LIST } from '../../data/catalogos';

interface Bloque4Props {
  formData: any;
  onChange: (field: string, value: any) => void;
}

export const Bloque4Voceros: React.FC<Bloque4Props> = ({ formData, onChange }) => {
  const handleMujeresChange = (val: string) => {
    const numMujeres = val === '' ? null : Number(val);
    onChange('voceros_mujeres', numMujeres);
    const m = numMujeres ?? 0;
    const h = (formData.voceros_hombres ? Number(formData.voceros_hombres) : 0);
    const total = numMujeres === null && formData.voceros_hombres === null ? null : m + h;
    onChange('total_voceros', total);
  };

  const handleHombresChange = (val: string) => {
    const numHombres = val === '' ? null : Number(val);
    onChange('voceros_hombres', numHombres);
    const h = numHombres ?? 0;
    const m = (formData.voceros_mujeres ? Number(formData.voceros_mujeres) : 0);
    const total = numHombres === null && formData.voceros_mujeres === null ? null : m + h;
    onChange('total_voceros', total);
  };

  return (
    <div className="space-y-4 pt-2">
      <div className="border-b-2 border-blue-600 pb-1 mb-4">
        <h3 className="text-base font-bold text-blue-600 tracking-wide uppercase">
          4. Información de Voceros y Voceras de la MTT
        </h3>
      </div>

      {/* Resumen de Vocerías y Fórmula Reactiva */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 bg-gray-50 p-3 rounded-lg border border-gray-200">
        <div className="md:col-span-3">
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            Estatus de las Vocerías
          </label>
          <select
            value={formData.estatus_vocerias || 'VIGENTE'}
            onChange={(e) => onChange('estatus_vocerias', e.target.value)}
            className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white font-medium"
          >
            {ESTATUS_VOCERIAS_LIST.map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>
        </div>

        <div className="md:col-span-3">
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            N° Voceros (Mujeres)
          </label>
          <input
            type="number"
            min="0"
            value={formData.voceros_mujeres ?? ''}
            onChange={(e) => handleMujeresChange(e.target.value)}
            className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
            placeholder="Cantidad mujeres"
          />
        </div>

        <div className="md:col-span-3">
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            N° Voceros (Hombres)
          </label>
          <input
            type="number"
            min="0"
            value={formData.voceros_hombres ?? ''}
            onChange={(e) => handleHombresChange(e.target.value)}
            className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
            placeholder="Cantidad hombres"
          />
        </div>

        <div className="md:col-span-3">
          <label className="block text-xs font-bold text-blue-900 mb-1">
            Total Voceras y Voceros (Fórmula)
          </label>
          <input
            type="number"
            readOnly
            value={formData.total_voceros ?? ''}
            className="w-full px-3 py-1.5 text-sm bg-blue-100 border border-blue-300 text-blue-900 font-bold rounded cursor-not-allowed outline-none"
            placeholder="Calculado (M + H)"
          />
        </div>
      </div>

      {/* Vocero 1 */}
      <div className="p-3 border border-gray-200 rounded-lg bg-white space-y-3">
        <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-blue-600"></span>
          Datos del Vocero o Vocera Principal (Vocero 1)
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          <div className="md:col-span-4">
            <label className="block text-xs text-gray-600 mb-0.5">Nombre y Apellido</label>
            <input
              type="text"
              value={formData.v1_nombre_apellido || ''}
              onChange={(e) => onChange('v1_nombre_apellido', e.target.value)}
              className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
              placeholder="Nombre y Apellido V1"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs text-gray-600 mb-0.5">N° de Cédula</label>
            <input
              type="number"
              value={formData.v1_cedula ?? ''}
              onChange={(e) => onChange('v1_cedula', e.target.value)}
              className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
              placeholder="Ej. 12345678"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs text-gray-600 mb-0.5">Fecha Nacimiento</label>
            <input
              type="date"
              value={formData.v1_fecha_nacimiento || ''}
              onChange={(e) => onChange('v1_fecha_nacimiento', e.target.value)}
              className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs text-gray-600 mb-0.5">Sexo</label>
            <select
              value={formData.v1_sexo || ''}
              onChange={(e) => onChange('v1_sexo', e.target.value || null)}
              className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
            >
              <option value="">Seleccione...</option>
              <option value="MUJER">Mujer</option>
              <option value="HOMBRE">HOMBRE</option>
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs text-gray-600 mb-0.5">Teléfono Contacto</label>
            <input
              type="text"
              value={formData.v1_telefono || ''}
              onChange={(e) => onChange('v1_telefono', e.target.value)}
              className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
              placeholder="0412-1234567 o «N/D»"
            />
          </div>
        </div>
      </div>

      {/* Vocero 2 */}
      <div className="p-3 border border-gray-200 rounded-lg bg-white space-y-3">
        <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-blue-600"></span>
          Datos del Vocero o Vocera Secundario (Vocero 2)
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          <div className="md:col-span-4">
            <label className="block text-xs text-gray-600 mb-0.5">Nombre y Apellido</label>
            <input
              type="text"
              value={formData.v2_nombre_apellido || ''}
              onChange={(e) => onChange('v2_nombre_apellido', e.target.value)}
              className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
              placeholder="Nombre y Apellido V2"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs text-gray-600 mb-0.5">N° de Cédula</label>
            <input
              type="number"
              value={formData.v2_cedula ?? ''}
              onChange={(e) => onChange('v2_cedula', e.target.value)}
              className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
              placeholder="Ej. 87654321"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs text-gray-600 mb-0.5">Fecha Nacimiento</label>
            <input
              type="date"
              value={formData.v2_fecha_nacimiento || ''}
              onChange={(e) => onChange('v2_fecha_nacimiento', e.target.value)}
              className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs text-gray-600 mb-0.5">Sexo</label>
            <select
              value={formData.v2_sexo || ''}
              onChange={(e) => onChange('v2_sexo', e.target.value || null)}
              className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
            >
              <option value="">Seleccione...</option>
              <option value="MUJER">Mujer</option>
              <option value="HOMBRE">Hombre</option>
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs text-gray-600 mb-0.5">Teléfono Contacto</label>
            <input
              type="text"
              value={formData.v2_telefono || ''}
              onChange={(e) => onChange('v2_telefono', e.target.value)}
              className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
              placeholder="0414-9876543 o «N/D»"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

