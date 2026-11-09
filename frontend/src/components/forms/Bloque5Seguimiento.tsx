import React from 'react';
import { Upload, FileCheck, AlertCircle } from 'lucide-react';

interface Bloque5Props {
  formData: any;
  onChange: (field: string, value: any) => void;
  isEdit?: boolean;
}

export const Bloque5Seguimiento: React.FC<Bloque5Props> = ({ formData, onChange, isEdit = false }) => {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      onChange('acta_nombre', file.name);
    }
  };

  return (
    <div className="space-y-4 pt-2">
      <div className="border-b-2 border-blue-600 pb-1 mb-4">
        <h3 className="text-base font-bold text-blue-600 tracking-wide uppercase">
          5. Control, Seguimiento y Verificación
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* Activador/a MTT */}
        <div className="md:col-span-4">
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            Activador o Activadora de la MTT
          </label>
          <input
            type="text"
            value={formData.activador_mtt || ''}
            onChange={(e) => onChange('activador_mtt', e.target.value)}
            className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
            placeholder="Nombre del promotor/a o «N/D»"
          />
        </div>

        {/* Fecha Última Visita */}
        <div className="md:col-span-4">
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            Fecha de la Última Visita
          </label>
          <input
            type="date"
            value={formData.fecha_ultima_visita || ''}
            onChange={(e) => onChange('fecha_ultima_visita', e.target.value || null)}
            className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
          />
        </div>

        {/* Observación (Regla 4: SIN OBSERVACIÓN) */}
        <div className="md:col-span-4">
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            Observación de Campo
          </label>
          <input
            type="text"
            value={formData.observacion || ''}
            onChange={(e) => onChange('observacion', e.target.value)}
            className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
            placeholder="Por defecto: «SIN OBSERVACIÓN»"
          />
        </div>
      </div>

      {/* Carga de Documentación Oficial */}
      <div className="mt-4 pt-3 border-t border-gray-200">
        <div className="flex items-center space-x-2 text-red-700 mb-2 font-bold text-xs uppercase tracking-wider">
          <AlertCircle className="h-4 w-4" />
          <span>Carga Obligatoria de Documentación Oficial Digitalizada</span>
        </div>

        <div className="bg-red-50/50 border-2 border-dashed border-red-300 rounded-lg p-4 text-center hover:bg-red-50 transition">
          <input
            type="file"
            id="actaUpload"
            accept=".pdf,image/png,image/jpeg"
            onChange={handleFileChange}
            className="hidden"
          />
          <label
            htmlFor="actaUpload"
            className="cursor-pointer flex flex-col items-center justify-center space-y-2"
          >
            <div className="p-2.5 bg-red-100 text-red-600 rounded-full">
              <Upload className="h-6 w-6" />
            </div>
            <div>
              <span className="text-sm font-semibold text-red-800">
                {formData.acta_nombre ? (
                  <span className="flex items-center gap-1.5 text-emerald-700 font-bold">
                    <FileCheck className="h-4 w-4" /> Archivo cargado: {formData.acta_nombre}
                  </span>
                ) : (
                  <span>
                    Adjuntar {isEdit ? 'Acta de Renovación / Actualización' : 'Acta de Conformación de la MTT'} (PDF o Imagen)
                  </span>
                )}
              </span>
              <p className="text-xs text-gray-500 mt-1">
                Haga clic aquí para seleccionar el archivo escaneado (Formato PDF, JPG o PNG)
              </p>
            </div>
          </label>
        </div>
      </div>
    </div>
  );
};

