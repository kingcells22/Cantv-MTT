import React, { useState, useMemo } from 'react';
import { MTTRecord } from '../../types/mtt';
import { ShieldAlert, FileText, Check, RotateCcw, AlertTriangle, CheckCircle2, Lock } from 'lucide-react';
import ubigeoRaw from '../../data/ubigeo_ine.json';
import parishSequencesRaw from '../../data/parish_sequences.json';

interface BandejaGdcViewProps {
  records: MTTRecord[];
  onAssignCode: (id: string, code: string) => void;
  onReturnRecord: (id: string, motivo: string) => void;
  onViewActa: (record: MTTRecord) => void;
  onOpenPdf: (record: MTTRecord) => void;
}

const ubigeoData: any = ubigeoRaw;
const baseSequences: Record<string, number> = parishSequencesRaw as any;

// Helper to normalize strings
const normalize = (str: string) =>
  (str || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toUpperCase();

export const BandejaGdcView: React.FC<BandejaGdcViewProps> = ({
  records,
  onAssignCode,
  onReturnRecord,
  onViewActa,
  onOpenPdf,
}) => {
  const [suffixInputs, setSuffixInputs] = useState<Record<string, string>>({});
  const [motivoInputs, setMotivoInputs] = useState<Record<string, string>>({});
  const [activeReturnId, setActiveReturnId] = useState<string | null>(null);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);
  const [filterTab, setFilterTab] = useState<'pending' | 'assigned'>('pending');

  // Compute live sequences from existing records in system
  const liveSequences = useMemo(() => {
    const seqs: Record<string, number> = { ...baseSequences };
    records.forEach((r) => {
      if (r.codigo_mtt && r.codigo_mtt.includes('.')) {
        const parts = r.codigo_mtt.split('.');
        const prefix = parts[0].trim();
        const num = parseInt(parts[1].trim(), 10);
        if (prefix && !isNaN(num) && num > (seqs[prefix] || 0)) {
          seqs[prefix] = num;
        }
      }
    });
    return seqs;
  }, [records]);

  // Helper to derive 6-digit Ubigeo code automatically from record
  const getRecordUbigeoPrefix = (mtt: MTTRecord): string | null => {
    if (mtt.codigo_ubigeo_base && mtt.codigo_ubigeo_base.length === 6 && !mtt.codigo_ubigeo_base.endsWith('00')) {
      return mtt.codigo_ubigeo_base;
    }
    if (mtt.parroquia_id && mtt.parroquia_id.length === 6 && !mtt.parroquia_id.endsWith('00')) {
      return mtt.parroquia_id;
    }
    if (mtt.codigo_mtt && mtt.codigo_mtt.includes('.')) {
      const p = mtt.codigo_mtt.split('.')[0].trim();
      if (p.length === 6 && !p.endsWith('00')) return p;
    }
    
    // Look up in official INE ubigeo dictionary
    const normEst = normalize(mtt.entidad_federal);
    const normMun = normalize(mtt.municipio);
    const normParr = normalize(mtt.parroquia);

    const foundEstKey = Object.keys(ubigeoData).find((e) => normalize(e) === normEst);
    if (!foundEstKey) return null;

    const munDict = ubigeoData[foundEstKey]?.municipios || {};
    const foundMunKey = Object.keys(munDict).find((m) => normalize(m) === normMun);
    if (!foundMunKey) return null;

    const parrList = munDict[foundMunKey]?.parroquias || [];
    const foundParr = parrList.find((p: any) => normalize(p.nombre) === normParr);
    return foundParr ? foundParr.ubigeo_code : null;
  };

  // Filter records
  const pendingGdc = useMemo(() => {
    return records.filter(
      (r) => !r.codigo_mtt || r.codigo_mtt === '' || r.codigo_mtt === 'PENDIENTE' || r.codigo_mtt.toUpperCase() === 'PENDIENTE GDC'
    );
  }, [records]);

  const assignedGdc = useMemo(() => {
    return records.filter(
      (r) => r.codigo_mtt && r.codigo_mtt !== '' && r.codigo_mtt !== 'PENDIENTE' && r.codigo_mtt.toUpperCase() !== 'PENDIENTE GDC'
    );
  }, [records]);

  const displayedRecords = filterTab === 'pending' ? pendingGdc : assignedGdc.slice(0, 100);

  const handleAssign = (mtt: MTTRecord, prefix: string, suffix: string) => {
    const cleanSuffix = (suffix || '').trim().replace(/[^0-9]/g, '');
    if (!cleanSuffix || cleanSuffix.length === 0) {
      alert('Por favor ingrese el número correlativo adicional de 2 dígitos (ej. 01, 35, 45).');
      return;
    }
    const formattedSuffix = cleanSuffix.padStart(2, '0');
    const finalFullCode = `${prefix}.${formattedSuffix}`;

    if (mtt.id) {
      onAssignCode(mtt.id, finalFullCode);
      setFeedbackMsg(`¡Código oficial censal "${finalFullCode}" asignado con éxito a la MTT "${mtt.nombre_mtt}"!`);
      setTimeout(() => setFeedbackMsg(null), 4500);
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
      <div className="border-b border-gray-200 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-blue-100 text-blue-700 rounded-lg">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              Bandeja GDC · Asignación y Control de Códigos Oficiales MTT
            </h2>
            <p className="text-xs text-gray-500">
              Gerencia de Organización Comunal · Nomenclatura Oficial Censal [INE 6D].[Correlativo 2D]
            </p>
          </div>
        </div>
        
        {/* Tab switchers */}
        <div className="flex items-center space-x-2 bg-gray-100 p-1 rounded-lg border border-gray-200">
          <button
            onClick={() => setFilterTab('pending')}
            className={`px-3 py-1.5 text-xs font-bold rounded-md transition ${
              filterTab === 'pending'
                ? 'bg-amber-500 text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Pendientes ({pendingGdc.length})
          </button>
          <button
            onClick={() => setFilterTab('assigned')}
            className={`px-3 py-1.5 text-xs font-bold rounded-md transition ${
              filterTab === 'assigned'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Oficiales Asignados ({assignedGdc.length})
          </button>
        </div>
      </div>

      {/* Regla de Oro Banner */}
      <div className="bg-blue-50 border border-blue-200 text-blue-900 text-xs rounded-lg p-3.5 flex items-start space-x-3">
        <Lock className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
        <div className="space-y-1">
          <div className="font-bold text-blue-950">
            Blindaje Institucional de Código Censal Automatizado (Regla de Oro GDC):
          </div>
          <div className="text-[11px] leading-relaxed text-blue-800">
            La base de 6 dígitos del código se deriva <strong>automáticamente de la cartografía oficial del INE</strong> (Estado 2D + Municipio 2D + Parroquia 2D) y es <strong>estrictamente inmutable</strong>. El funcionario autorizado de GDC solo confirma o ajusta el <strong>correlativo adicional (.01, .35, .45)</strong> asignado según la secuencia de registro territorial.
          </div>
        </div>
      </div>

      {feedbackMsg && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs rounded-lg p-3 flex items-center space-x-2 animate-fadeIn">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0" />
          <span className="font-bold">{feedbackMsg}</span>
        </div>
      )}

      {displayedRecords.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <CheckCircle2 className="h-12 w-12 text-emerald-500 mx-auto mb-2" />
          <h4 className="font-bold text-gray-800 text-sm">
            {filterTab === 'pending' ? 'Bandeja GDC al día' : 'No hay registros asignados aún'}
          </h4>
          <p className="text-xs text-gray-500 mt-1">
            {filterTab === 'pending'
              ? 'No hay expedientes pendientes de asignación de código oficial en este momento.'
              : 'Los códigos asignados aparecerán listados aquí.'}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto border border-gray-200 rounded-lg">
          <table className="w-full text-left text-xs divide-y divide-gray-200">
            <thead className="bg-[#212529] text-white uppercase text-[11px] font-semibold tracking-wider">
              <tr>
                <th className="px-4 py-3">Expediente</th>
                <th className="px-4 py-3">Nombre MTT</th>
                <th className="px-4 py-3">Ubicación Territorial (INE)</th>
                <th className="px-4 py-3 text-center">Código Oficial MTT</th>
                <th className="px-4 py-3 text-center">Acta PDF</th>
                <th className="px-4 py-3 text-center" style={{ minWidth: '280px' }}>
                  {filterTab === 'pending' ? 'Asignación Automatizada GDC' : 'Gestión'}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {displayedRecords.map((mtt) => {
                const id = mtt.id || '';
                const ubigeoPrefix = getRecordUbigeoPrefix(mtt);
                const isIndeterminate = !ubigeoPrefix || ubigeoPrefix.endsWith('00');
                
                // Suggested suffix from sequences
                const nextSeq = ubigeoPrefix ? (liveSequences[ubigeoPrefix] || 0) + 1 : 1;
                const suggestedSuffix = String(nextSeq).padStart(2, '0');
                const currentSuffix = suffixInputs[id] ?? suggestedSuffix;

                return (
                  <tr key={id} className="hover:bg-amber-50/30 transition">
                    <td className="px-4 py-3 font-mono font-bold text-gray-900">
                      {mtt.expediente_num || 'EXP-2026-N/D'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-bold text-gray-900">{mtt.nombre_mtt}</div>
                      <div className="text-[11px] text-gray-500">
                        {mtt.tipo_mtt} · Voceros: {mtt.total_voceros ?? 'N/D'} · {mtt.fecha_creacion || 'Fecha N/D'}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      <div className="font-semibold text-gray-900">
                        {mtt.entidad_federal} / {mtt.municipio}
                      </div>
                      <div className="text-[11px] text-gray-500 flex items-center gap-1.5">
                        <span>Parr. {mtt.parroquia}</span>
                        {ubigeoPrefix && (
                          <span className="font-mono text-[10px] bg-blue-50 text-blue-700 px-1.5 py-0.2 rounded border border-blue-200">
                            Ubigeo: {ubigeoPrefix}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Estatus / Código MTT Visual Column (Exact match to user's uploaded image) */}
                    <td className="px-4 py-3 text-center">
                      {mtt.codigo_mtt && mtt.codigo_mtt !== 'PENDIENTE' && mtt.codigo_mtt.toUpperCase() !== 'PENDIENTE GDC' ? (
                        <span className="font-mono font-bold text-blue-600 text-sm tracking-wide">
                          {mtt.codigo_mtt}
                        </span>
                      ) : (
                        <span className="font-mono font-bold text-[11px] px-2.5 py-1 rounded bg-amber-100 text-amber-800 border border-amber-300 inline-block shadow-sm">
                          PENDIENTE GDC
                        </span>
                      )}
                    </td>

                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => onViewActa(mtt)}
                        className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 text-red-700 bg-red-50 hover:bg-red-100 rounded border border-red-200 transition"
                      >
                        <FileText className="h-3.5 w-3.5" />
                        <span>Ver Acta</span>
                      </button>
                    </td>

                    <td className="px-4 py-3 text-center">
                      {filterTab === 'assigned' ? (
                        <div className="flex items-center justify-center gap-2">
                          <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200 flex items-center gap-1">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            <span>Oficial Aprobado</span>
                          </span>
                          <button
                            onClick={() => onOpenPdf(mtt)}
                            className="text-[10px] font-bold text-blue-600 hover:text-blue-800 px-2 py-1 rounded border border-blue-200 hover:bg-blue-50 transition"
                          >
                            Ficha QR
                          </button>
                        </div>
                      ) : activeReturnId === id ? (
                        <div className="space-y-1.5 p-2 bg-red-50 rounded border border-red-200 text-left animate-fadeIn">
                          <label className="block text-[10px] font-bold text-red-800">
                            Motivo de Devolución a Región:
                          </label>
                          <textarea
                            rows={2}
                            value={motivoInputs[id] || ''}
                            onChange={(e) =>
                              setMotivoInputs((prev) => ({ ...prev, [id]: e.target.value }))
                            }
                            placeholder="Describa la inconsistencia del acta comunitaria..."
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
                      ) : isIndeterminate ? (
                        <div className="p-2 bg-amber-50 rounded border border-amber-200 text-center space-y-1">
                          <span className="text-[10px] font-bold text-amber-800 flex items-center justify-center gap-1">
                            <AlertTriangle className="h-3 w-3 text-amber-600" />
                            <span>Parroquia No Determinada</span>
                          </span>
                          <p className="text-[9px] text-amber-700">
                            Debe determinarse la parroquia oficial en territorio para generar el código.
                          </p>
                          <button
                            onClick={() => setActiveReturnId(id)}
                            className="text-[10px] text-red-600 font-bold hover:underline"
                          >
                            Devolver por falta de Ubigeo
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-1.5">
                          {/* Segmented Code Builder UI */}
                          <div className="flex items-center justify-center gap-1 bg-gray-50 border border-gray-300 rounded-lg p-1 shadow-sm">
                            {/* Inmutable 6-digit Ubigeo base */}
                            <div
                              className="flex items-center gap-1 font-mono font-bold text-xs px-2 py-1 bg-gray-200 text-gray-800 rounded border border-gray-300 select-none"
                              title="6 Dígitos Ubigeo INE oficial (Inmutables)"
                            >
                              <Lock className="h-2.5 w-2.5 text-gray-500" />
                              <span>{ubigeoPrefix}</span>
                            </div>

                            <span className="font-mono font-extrabold text-sm text-gray-500">.</span>

                            {/* Additional Correlative Input (.YY) */}
                            <input
                              type="text"
                              maxLength={2}
                              value={currentSuffix}
                              onChange={(e) => {
                                const clean = e.target.value.replace(/[^0-9]/g, '').slice(0, 2);
                                setSuffixInputs((prev) => ({ ...prev, [id]: clean }));
                              }}
                              placeholder={suggestedSuffix}
                              title="Número adicional correlativo (ej. 01, 35, 45)"
                              className="w-10 text-center font-mono font-bold text-xs p-1 border-2 border-blue-500 rounded bg-white text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
                            />

                            {/* Confirm Action Button */}
                            <button
                              onClick={() => handleAssign(mtt, ubigeoPrefix!, currentSuffix)}
                              title={`Confirmar y asignar código oficial censal ${ubigeoPrefix}.${currentSuffix}`}
                              className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded font-bold text-xs flex items-center gap-1 transition shadow-sm ml-1"
                            >
                              <Check className="h-3.5 w-3.5" />
                              <span>Asignar</span>
                            </button>
                          </div>

                          <div className="flex items-center justify-between px-1 text-[10px] text-gray-500">
                            <span>Sugerido: <strong>.{suggestedSuffix}</strong></span>
                            <button
                              onClick={() => setActiveReturnId(id)}
                              className="text-red-600 hover:text-red-800 font-medium hover:underline flex items-center gap-0.5"
                            >
                              <RotateCcw className="h-2.5 w-2.5" />
                              <span>Devolver</span>
                            </button>
                          </div>
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
