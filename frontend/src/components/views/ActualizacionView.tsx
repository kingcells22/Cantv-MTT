import React, { useState } from 'react';
import { MTTRecord, ViewType } from '../../types/mtt';
import { Bloque1Identificacion } from '../forms/Bloque1Identificacion';
import { Bloque2Comunal } from '../forms/Bloque2Comunal';
import { Bloque3Tecnico } from '../forms/Bloque3Tecnico';
import { Bloque4Voceros } from '../forms/Bloque4Voceros';
import { Bloque5Seguimiento } from '../forms/Bloque5Seguimiento';
import { mttSchema } from '../../schemas/mttSchema';
import { FileEdit, Search, AlertTriangle, CheckCircle, Save } from 'lucide-react';

interface ActualizacionViewProps {
  records: MTTRecord[];
  onUpdateRecord: (id: string, updates: Partial<MTTRecord>) => void;
  onSwitchView: (view: ViewType) => void;
}

export const ActualizacionView: React.FC<ActualizacionViewProps> = ({
  records,
  onUpdateRecord,
  onSwitchView,
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('MTT-101-04-01');
  const [selectedMtt, setSelectedMtt] = useState<MTTRecord | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSearch = () => {
    setErrorMsg(null);
    setSuccessMsg(null);
    const query = searchTerm.trim().toLowerCase();
    if (!query) {
      setErrorMsg('Por favor ingrese un Código MTT, Expediente o Cédula de Vocero para buscar.');
      return;
    }

    const found = records.find(
      (r) =>
        (r.codigo_mtt && r.codigo_mtt.toLowerCase().includes(query)) ||
        (r.expediente_num && r.expediente_num.toLowerCase().includes(query)) ||
        (r.v1_cedula && String(r.v1_cedula).includes(query)) ||
        (r.v2_cedula && String(r.v2_cedula).includes(query)) ||
        r.nombre_mtt.toLowerCase().includes(query)
    );

    if (found) {
      setSelectedMtt({ ...found });
    } else {
      setErrorMsg(`No se encontró ninguna MTT con el criterio de búsqueda: "${searchTerm}".`);
    }
  };

  const handleFieldChange = (field: string, value: any) => {
    if (!selectedMtt) return;
    setSelectedMtt((prev) => (prev ? { ...prev, [field]: value } : null));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMtt?.id) return;
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const validated = mttSchema.parse(selectedMtt);
      onUpdateRecord(selectedMtt.id, validated as any);
      setSuccessMsg(
        `¡Actualización guardada correctamente para la MTT "${selectedMtt.nombre_mtt}" (${selectedMtt.codigo_mtt || selectedMtt.expediente_num})!`
      );
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      if (err.errors && err.errors.length > 0) {
        setErrorMsg(`Error de validación: ${err.errors[0].message}`);
      } else {
        setErrorMsg('Error al validar la actualización. Revise los campos obligatorios.');
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-6 max-w-5xl mx-auto space-y-6">
      <div className="border-b border-gray-200 pb-3 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="p-2 bg-blue-100 text-blue-700 rounded-lg">
            <FileEdit className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              Actualización y Renovación de MTT
            </h2>
            <p className="text-xs text-gray-500">
              Búsqueda en padrón nacional, actualización de vocerías y anexar acta de renovación
            </p>
          </div>
        </div>
      </div>

      {/* Search Input matching template */}
      <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
        <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
          Buscar MTT por Código Oficial, Expediente o Cédula de Vocero
        </label>
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Ej. MTT-101-04-01 ó 12345678..."
            className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
          />
          <button
            type="button"
            onClick={handleSearch}
            className="px-4 py-2 bg-gray-900 hover:bg-black text-white text-xs font-bold rounded-lg shadow-sm transition flex items-center gap-1.5"
          >
            <Search className="h-4 w-4" />
            <span>Buscar MTT</span>
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="bg-red-50 border border-red-300 text-red-800 text-xs rounded-lg p-3 flex items-center space-x-2">
          <AlertTriangle className="h-4 w-4 text-red-600 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs rounded-lg p-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-5 w-5 text-emerald-600 flex-shrink-0" />
            <span className="font-semibold">{successMsg}</span>
          </div>
          <button
            onClick={() => onSwitchView('databaseView')}
            className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-bold text-xs shadow-sm transition"
          >
            Ver en Matriz
          </button>
        </div>
      )}

      {selectedMtt && (
        <div className="space-y-6 animate-fadeIn">
          {/* Warning banner matching template */}
          <div className="bg-amber-50 border border-amber-300 text-amber-900 text-xs rounded-lg p-3 flex items-start space-x-2">
            <AlertTriangle className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              Editando información registrada para la MTT:{' '}
              <strong className="font-mono text-sm text-blue-900">
                {selectedMtt.codigo_mtt || selectedMtt.expediente_num || selectedMtt.nombre_mtt}
              </strong>
              . Modifique los campos requeridos y adjunte el acta de renovación al final.
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <Bloque1Identificacion formData={selectedMtt} onChange={handleFieldChange} isEdit />
            <Bloque2Comunal formData={selectedMtt} onChange={handleFieldChange} />
            <Bloque3Tecnico formData={selectedMtt} onChange={handleFieldChange} />
            <Bloque4Voceros formData={selectedMtt} onChange={handleFieldChange} />
            <Bloque5Seguimiento formData={selectedMtt} onChange={handleFieldChange} isEdit />

            <div className="pt-4 border-t border-gray-200 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setSelectedMtt(null)}
                className="px-4 py-2 text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-md hover:shadow-lg transition flex items-center space-x-2"
              >
                <Save className="h-4 w-4" />
                <span>Guardar Actualización</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

