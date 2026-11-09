import React from 'react';
import { MTTRecord, ViewType } from '../../types/mtt';
import { Radio, Users, CheckCircle, Clock, Zap, FileText, ArrowRight } from 'lucide-react';

interface DashboardViewProps {
  records: MTTRecord[];
  onOpenPdf: (record: MTTRecord) => void;
  onSwitchView: (view: ViewType) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  records,
  onOpenPdf,
  onSwitchView,
}) => {
  const total = records.length;
  const activas = records.filter((r) => r.estatus_mtt === 'ACTIVA').length;
  const pendientes = records.filter((r) => !r.codigo_mtt || r.codigo_mtt === '' || r.codigo_mtt === 'PENDIENTE').length;
  const gpon = records.filter((r) => r.mtt_en_huella_gpon === 'SI').length;

  const recent = records.slice(0, 6);

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* KPI 1: Total */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Total MTT Registradas
              </p>
              <h3 className="text-2xl font-black text-gray-900 mt-1">
                {total.toLocaleString()}
              </h3>
            </div>
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
              <Radio className="h-6 w-6" />
            </div>
          </div>
          <p className="text-[11px] text-gray-500 mt-2 flex items-center gap-1 font-medium">
            <span className="text-blue-600 font-bold">100%</span> cobertura nacional INE
          </p>
        </div>

        {/* KPI 2: Activas */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                MTT Activas / Validadas
              </p>
              <h3 className="text-2xl font-black text-emerald-600 mt-1">
                {activas.toLocaleString()}
              </h3>
            </div>
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
              <CheckCircle className="h-6 w-6" />
            </div>
          </div>
          <p className="text-[11px] text-gray-500 mt-2 flex items-center gap-1 font-medium">
            <span className="text-emerald-600 font-bold">
              {total > 0 ? Math.round((activas / total) * 100) : 0}%
            </span>{' '}
            operatividad en campo
          </p>
        </div>

        {/* KPI 3: En Revisión */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                En Revisión de Acta / GDC
              </p>
              <h3 className="text-2xl font-black text-amber-500 mt-1">
                {pendientes.toLocaleString()}
              </h3>
            </div>
            <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
              <Clock className="h-6 w-6" />
            </div>
          </div>
          <p className="text-[11px] text-gray-500 mt-2 flex items-center gap-1 font-medium">
            <span className="text-amber-600 font-bold">Pendientes</span> por código oficial
          </p>
        </div>

        {/* KPI 4: Huella GPON */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                MTT en Huella GPON
              </p>
              <h3 className="text-2xl font-black text-cyan-600 mt-1">
                {gpon.toLocaleString()}
              </h3>
            </div>
            <div className="p-3 bg-cyan-50 text-cyan-600 rounded-xl">
              <Zap className="h-6 w-6" />
            </div>
          </div>
          <p className="text-[11px] text-gray-500 mt-2 flex items-center gap-1 font-medium">
            <span className="text-cyan-600 font-bold">Fibra Óptica</span> alta velocidad CANTV
          </p>
        </div>
      </div>

      {/* Recent MTTs table (matching client template) */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Radio className="h-4 w-4 text-blue-600" />
            <h4 className="text-sm font-bold text-gray-900 tracking-wide uppercase">
              MTT Recientes en el Sistema
            </h4>
          </div>
          <button
            onClick={() => onSwitchView('databaseView')}
            className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 transition"
          >
            <span>Ver matriz completa</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#212529] text-white uppercase text-[11px] font-semibold tracking-wider">
              <tr>
                <th className="px-4 py-3">Código MTT</th>
                <th className="px-4 py-3">Nombre MTT</th>
                <th className="px-4 py-3">Entidad / Municipio / Parroquia</th>
                <th className="px-4 py-3 text-center">Estatus</th>
                <th className="px-4 py-3 text-center">GPON</th>
                <th className="px-4 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {recent.map((mtt) => {
                const hasCode = mtt.codigo_mtt && mtt.codigo_mtt !== '' && mtt.codigo_mtt !== 'PENDIENTE';
                return (
                  <tr key={mtt.id} className="hover:bg-blue-50/50 transition">
                    <td className="px-4 py-3 font-mono font-bold text-blue-700">
                      {hasCode ? (
                        mtt.codigo_mtt
                      ) : (
                        <span className="bg-amber-100 text-amber-800 text-[10px] px-2 py-0.5 rounded font-sans font-bold">
                          PENDIENTE GDC
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 font-semibold text-gray-900">{mtt.nombre_mtt}</td>
                    <td className="px-4 py-3 text-gray-600">
                      {mtt.entidad_federal} / {mtt.municipio} / {mtt.parroquia}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          mtt.estatus_mtt === 'ACTIVA'
                            ? 'bg-emerald-100 text-emerald-800'
                            : mtt.estatus_mtt === 'INACTIVA'
                            ? 'bg-gray-100 text-gray-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {mtt.estatus_mtt}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          mtt.mtt_en_huella_gpon === 'SI'
                            ? 'bg-cyan-100 text-cyan-800'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {mtt.mtt_en_huella_gpon}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right space-x-1.5 whitespace-nowrap">
                      <button
                        onClick={() => onOpenPdf(mtt)}
                        className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded border border-blue-200 transition"
                      >
                        <FileText className="h-3 w-3" />
                        <span>PDF</span>
                      </button>
                      {!hasCode && (
                        <button
                          onClick={() => onSwitchView('gdcView')}
                          className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 bg-amber-50 text-amber-700 hover:bg-amber-100 rounded border border-amber-200 transition"
                        >
                          <span>Revisar</span>
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

