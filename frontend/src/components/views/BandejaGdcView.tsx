import React, { useState } from 'react';
import { MTTRecord } from '../../types/mtt';
import { ShieldAlert, FileText, Check, RotateCcw, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface BandejaGdcViewProps {
  records: MTTRecord[];
  onAssignCode: (id: string, code: string) => void;
  onReturnRecord: (id: string, motivo: string) => void;
  onViewActa: (record: MTTRecord) => void;
  onOpenPdf: (record: MTTRecord) => void;
}

export const BandejaGdcView: React.FC<BandejaGdcViewProps> = ({
  records,
  onAssignCode,
  onReturnRecord,
  onViewActa,
  onOpenPdf,
}) => {
  const [codeInputs, setCodeInputs] = useState<Record<string, string>>({});
  const [motivoInputs, setMotivoInputs] = useState<Record<string, string>>({});
  const [activeReturnId, setActiveReturnId] = useState<string | null>(null);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  // Filter records that need GDC code assignment
  const pendingGdc = records.filter(
    (r) => !r.codigo_mtt || r.codigo_mtt === '' || r.codigo_mtt === 'PENDIENTE'
  );

  const handleAssign = (mtt: MTTRecord) => {
    const code = (codeInputs[mtt.id || ''] || '').trim();
    if (!code) {
      alert('Por favor ingrese el código oficial que desea asignar (ej. MTT-101-15-02).');
      return;
    }
    if (mtt.id) {
      onAssignCode(mtt.id, code);
      setFeedbackMsg(`¡Código oficial "${code}" asignado con éxito a la MTT "${mtt.nombre_mtt}"!`);
      setTimeout(() => setFeedbackMsg(null), 4000);
    }
  };

  const handleReturnSubmit = (mtt: MTTRecord) => {
    const motivo = (motivoInputs[mtt.id || ''] || '').trim();
    if (!motivo) {
      alert('Por favor describa el motivo de la devolución por inconsistencia.');
      return;
    }
    if (mtt.id) {
      onReturnRecord(mtt.id, motivo);
      setActiveReturnId(null);
      setFeedbackMsg(`Expediente devuelto a la coordinación estadal con observación.`);
      setTimeout(() => setFeedbackMsg(null), 4000);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-6 space-y-6">
      <div className="border-b border-gray-200 pb-3 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="p-2 bg-amber-100 text-amber-700 rounded-lg">
            <ShieldAlert className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              Bandeja GDC (Asignación de Códigos Oficiales)
            </h2>
            <p className="text-xs text-gray-500">
              Control Nacional y Auditoría de Actas Digitalizadas vs Padrón INE
            </p>
          </div>
        </div>
        <span className="bg-amber-100 text-amber-900 text-xs font-bold px-3 py-1 rounded-full border border-amber-300">
          {pendingGdc.length} Expedientes en Revisión
        </span>
      </div>

      {/* Warning banner matching template */}
      <div className="bg-amber-50 border border-amber-300 text-amber-900 text-xs rounded-lg p-3 flex items-start space-x-2">
        <AlertTriangle className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
        <div>
          <span className="font-bold">Verificación Normativa Obligatoria: </span>
          Verifique los datos territoriales y demográficos contra el acta digitalizada para asignar el código oficial MTT definitivo o devolver el expediente por inconsistencia.
        </div>
      </div>

      {feedbackMsg && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs rounded-lg p-3 flex items-center space-x-2 animate-fadeIn">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0" />
          <span className="font-bold">{feedbackMsg}</span>
        </div>
      )}

      {pendingGdc.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <CheckCircle2 className="h-12 w-12 text-emerald-500 mx-auto mb-2" />
          <h4 className="font-bold text-gray-800 text-sm">Bandeja GDC al día</h4>
          <p className="text-xs text-gray-500 mt-1">
            No hay expedientes pendientes de asignación de código oficial en este momento.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto border border-gray-200 rounded-lg">
          <table className="w-full text-left text-xs divide-y divide-gray-200">
            <thead className="bg-[#212529] text-white uppercase text-[11px] font-semibold tracking-wider">
              <tr>
                <th className="px-4 py-3">Expediente</th>
                <th className="px-4 py-3">Nombre MTT</th>
                <th className="px-4 py-3">Ubicación (INE)</th>
                <th className="px-4 py-3 text-center">Acta Digitalizada</th>
                <th className="px-4 py-3 text-center">Estatus</th>
                <th className="px-4 py-3 text-center" style={{ minWidth: '240px' }}>
                  Acción GDC
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {pendingGdc.map((mtt) => {
                const id = mtt.id || '';
                return (
                  <tr key={id} className="hover:bg-amber-50/40 transition">
                    <td className="px-4 py-3 font-mono font-bold text-gray-900">
                      {mtt.expediente_num || 'EXP-2026-N/D'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-bold text-gray-900">{mtt.nombre_mtt}</div>
                      <div className="text-[11px] text-gray-500">
                        {mtt.tipo_mtt} · Voceros: {mtt.total_voceros ?? 'N/D'}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      <div>
                        {mtt.entidad_federal} / {mtt.municipio}
                      </div>
                      <div className="text-[11px] text-gray-400">
                        Parr. {mtt.parroquia} ({mtt.parroquia_id || 'INE'})
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => onViewActa(mtt)}
                        className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 text-red-700 bg-red-50 hover:bg-red-100 rounded border border-red-200 transition"
                      >
                        <FileText className="h-3 w-3" />
                        <span>Ver Acta PDF</span>
                      </button>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                        Validado Regional
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {activeReturnId === id ? (
                        <div className="space-y-1.5 p-2 bg-red-50 rounded border border-red-200 text-left">
                          <label className="block text-[10px] font-bold text-red-800">
                            Motivo de Devolución:
                          </label>
                          <textarea
                            rows={2}
                            value={motivoInputs[id] || ''}
                            onChange={(e) =>
                              setMotivoInputs((prev) => ({ ...prev, [id]: e.target.value }))
                            }
                            placeholder="Describa el error de acta o inconsistencia..."
                            className="w-full text-xs p-1.5 border border-red-300 rounded bg-white outline-none"
                          />
                          <div className="flex justify-end gap-1">
                            <button
                              onClick={() => setActiveReturnId(null)}
                              className="px-2 py-0.5 text-[10px] text-gray-600 hover:bg-gray-200 rounded"
                            >
                              Cancelar
                            </button>
                            <button
                              onClick={() => handleReturnSubmit(mtt)}
                              className="px-2 py-0.5 text-[10px] font-bold bg-red-600 text-white hover:bg-red-700 rounded shadow-sm"
                            >
                              Confirmar Devolución
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-1">
                          <div className="flex items-center gap-1">
                            <input
                              type="text"
                              value={codeInputs[id] || ''}
                              onChange={(e) =>
                                setCodeInputs((prev) => ({ ...prev, [id]: e.target.value }))
                              }
                              placeholder="Ej. MTT-101-15-02"
                              className="px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-emerald-500 font-mono flex-1 outline-none"
                            />
                            <button
                              onClick={() => handleAssign(mtt)}
                              title="Asignar Código Oficial"
                              className="p-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded transition shadow-sm"
                            >
                              <Check className="h-3.5 w-3.5" />
                            </button>
                          </div>
                          <button
                            onClick={() => setActiveReturnId(id)}
                            className="w-full text-[10px] font-bold text-red-600 hover:text-red-800 py-0.5 hover:bg-red-50 rounded border border-red-200 flex items-center justify-center gap-1 transition"
                          >
                            <RotateCcw className="h-3 w-3" />
                            <span>Devolver por Inconsistencia</span>
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

