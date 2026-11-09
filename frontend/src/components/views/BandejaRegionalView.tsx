import React, { useState } from 'react';
import { MTTRecord } from '../../types/mtt';
import { ClipboardCheck, FileText, CheckCircle, RotateCcw, AlertCircle } from 'lucide-react';

interface BandejaRegionalViewProps {
  records: MTTRecord[];
  onApproveRegional: (id: string) => void;
  onReturnRecord: (id: string, motivo: string) => void;
  onViewActa: (record: MTTRecord) => void;
  onOpenPdf: (record: MTTRecord) => void;
}

export const BandejaRegionalView: React.FC<BandejaRegionalViewProps> = ({
  records,
  onApproveRegional,
  onReturnRecord,
  onViewActa,
  onOpenPdf,
}) => {
  const [motivoInputs, setMotivoInputs] = useState<Record<string, string>>({});
  const [activeReturnId, setActiveReturnId] = useState<string | null>(null);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  // Filter records waiting for regional approval
  const pendingRegional = records.filter(
    (r) => r.estatus_validacion === 'ENVIADO_REGIONAL'
  );

  const handleApprove = (mtt: MTTRecord) => {
    if (mtt.id) {
      onApproveRegional(mtt.id);
      setFeedbackMsg(
        `Expediente "${mtt.expediente_num || mtt.nombre_mtt}" aprobado y remitido a la Bandeja GDC.`
      );
      setTimeout(() => setFeedbackMsg(null), 4000);
    }
  };

  const handleReturn = (mtt: MTTRecord) => {
    const id = mtt.id || '';
    const motivo = (motivoInputs[id] || '').trim();
    if (!motivo) {
      alert('Por favor ingrese el motivo de devolución.');
      return;
    }
    onReturnRecord(id, motivo);
    setActiveReturnId(null);
    setFeedbackMsg(`Expediente devuelto al Coordinador Territorial para su subsanación.`);
    setTimeout(() => setFeedbackMsg(null), 4000);
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-6 space-y-6">
      <div className="border-b border-gray-200 pb-3 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="p-2 bg-emerald-100 text-emerald-700 rounded-lg">
            <ClipboardCheck className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              Bandeja de Validación Estadal (Gerencia Regional)
            </h2>
            <p className="text-xs text-gray-500">
              Revisión preliminar de conformación y validación territorial
            </p>
          </div>
        </div>
        <span className="bg-emerald-100 text-emerald-900 text-xs font-bold px-3 py-1 rounded-full border border-emerald-300">
          {pendingRegional.length} Expedientes en Bandeja
        </span>
      </div>

      <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs rounded-lg p-3 flex items-start space-x-2">
        <AlertCircle className="h-4 w-4 text-emerald-600 flex-shrink-0 mt-0.5" />
        <div>
          Como <strong>Gerente Regional</strong>, valide que la información territorial coincida con la asamblea comunal y el acta física digitalizada antes de elevar el expediente a Consultoría GDC.
        </div>
      </div>

      {feedbackMsg && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs rounded-lg p-3 flex items-center space-x-2">
          <CheckCircle className="h-4 w-4 text-emerald-600 flex-shrink-0" />
          <span className="font-bold">{feedbackMsg}</span>
        </div>
      )}

      {pendingRegional.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <CheckCircle className="h-12 w-12 text-emerald-500 mx-auto mb-2" />
          <h4 className="font-bold text-gray-800 text-sm">Bandeja Regional al día</h4>
          <p className="text-xs text-gray-500 mt-1">
            No hay solicitudes de validación pendientes en su territorio estadal.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto border border-gray-200 rounded-lg">
          <table className="w-full text-left text-xs divide-y divide-gray-200">
            <thead className="bg-[#212529] text-white uppercase text-[11px] font-semibold tracking-wider">
              <tr>
                <th className="px-4 py-3">Expediente</th>
                <th className="px-4 py-3">Nombre MTT</th>
                <th className="px-4 py-3">Ubicación</th>
                <th className="px-4 py-3 text-center">Acta</th>
                <th className="px-4 py-3 text-center" style={{ minWidth: '220px' }}>
                  Acciones Regionales
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {pendingRegional.map((mtt) => {
                const id = mtt.id || '';
                return (
                  <tr key={id} className="hover:bg-emerald-50/40 transition">
                    <td className="px-4 py-3 font-mono font-bold text-gray-900">
                      {mtt.expediente_num || 'EXP-2026-N/D'}
                    </td>
                    <td className="px-4 py-3 font-semibold text-gray-900">{mtt.nombre_mtt}</td>
                    <td className="px-4 py-3 text-gray-600">
                      {mtt.entidad_federal} / {mtt.municipio} / {mtt.parroquia}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => onViewActa(mtt)}
                        className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 text-red-700 bg-red-50 hover:bg-red-100 rounded border border-red-200 transition"
                      >
                        <FileText className="h-3 w-3" />
                        <span>Ver Acta</span>
                      </button>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {activeReturnId === id ? (
                        <div className="space-y-1.5 p-2 bg-red-50 rounded border border-red-200 text-left">
                          <textarea
                            rows={2}
                            value={motivoInputs[id] || ''}
                            onChange={(e) =>
                              setMotivoInputs((prev) => ({ ...prev, [id]: e.target.value }))
                            }
                            placeholder="Describa observación de devolución..."
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
                              onClick={() => handleReturn(mtt)}
                              className="px-2 py-0.5 text-[10px] font-bold bg-red-600 text-white hover:bg-red-700 rounded shadow-sm"
                            >
                              Confirmar
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center space-x-2">
                          <button
                            onClick={() => handleApprove(mtt)}
                            className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-bold text-xs flex items-center gap-1 shadow-sm transition"
                          >
                            <CheckCircle className="h-3.5 w-3.5" />
                            <span>Aprobar a GDC</span>
                          </button>
                          <button
                            onClick={() => setActiveReturnId(id)}
                            className="px-2.5 py-1 bg-red-50 hover:bg-red-100 text-red-700 rounded border border-red-200 font-bold text-xs flex items-center gap-1 transition"
                          >
                            <RotateCcw className="h-3.5 w-3.5" />
                            <span>Devolver</span>
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

