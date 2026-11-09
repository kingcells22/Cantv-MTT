import React from 'react';
import { MTTRecord } from '../../types/mtt';
import { X, Printer, QrCode, ShieldCheck } from 'lucide-react';

interface FichaPdfModalProps {
  record: MTTRecord | null;
  isOpen: boolean;
  onClose: () => void;
}

export const FichaPdfModal: React.FC<FichaPdfModalProps> = ({ record, isOpen, onClose }) => {
  if (!isOpen || !record) return null;

  const handlePrint = () => {
    window.print();
  };

  const currentDate = new Date().toLocaleDateString('es-VE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto no-print-backdrop">
      <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full my-8 overflow-hidden border border-gray-200">
        {/* Header Modal */}
        <div className="bg-[#212529] text-white px-5 py-3.5 flex items-center justify-between no-print">
          <div className="flex items-center space-x-2">
            <span className="p-1 bg-red-600 rounded text-xs font-bold uppercase">PDF</span>
            <h3 className="text-sm font-bold tracking-wide">Ficha Resumen Oficial por Módulos</h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition p-1 rounded"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Printable Body */}
        <div id="printableFicha" className="p-6 text-gray-800 text-xs sm:text-sm bg-white">
          {/* Header Institucional */}
          <div className="text-center border-b-2 border-gray-800 pb-3 mb-4">
            <h4 className="text-sm sm:text-base font-extrabold tracking-wide uppercase text-gray-900">
              República Bolivariana de Venezuela
            </h4>
            <p className="text-xs font-semibold text-gray-600">
              Compañía Anónima Nacional Teléfonos de Venezuela (CANTV) · GGFPP
            </p>
            <p className="text-xs font-bold text-blue-700 tracking-wider uppercase mt-1">
              Sistema Integral de Registro y Control de Mesas Técnicas de Telecomunicaciones (SINCOMTT)
            </p>
            <div className="mt-2">
              <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-0.5 rounded-full border border-emerald-300">
                <ShieldCheck className="h-3.5 w-3.5" /> Ficha Integral de Validación Oficial
              </span>
            </div>
          </div>

          {/* Meta Info */}
          <div className="flex justify-between items-center bg-gray-50 p-2.5 rounded border border-gray-200 mb-3 text-xs">
            <div>
              <span className="text-gray-500 font-semibold">Código Oficial MTT: </span>
              <span className="font-mono font-extrabold text-blue-700 text-sm">
                {record.codigo_mtt || 'PENDIENTE POR GDC'}
              </span>
            </div>
            <div>
              <span className="text-gray-500 font-semibold">Expediente: </span>
              <span className="font-mono font-bold text-gray-800">{record.expediente_num || 'EXP-2026-N/D'}</span>
            </div>
            <div>
              <span className="text-gray-500 font-semibold">Fecha de Emisión: </span>
              <span className="font-semibold text-gray-800">{currentDate}</span>
            </div>
          </div>

          {/* Módulo 1 */}
          <div className="p-3 bg-gray-50/70 border border-gray-200 rounded mb-2.5">
            <h5 className="font-bold text-blue-800 text-xs uppercase mb-1.5 border-b border-gray-200 pb-0.5">
              1. Identificación y Estatus de la MTT
            </h5>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <div>
                <span className="text-gray-500 font-medium">Nombre:</span>{' '}
                <strong className="text-gray-900">{record.nombre_mtt}</strong>
              </div>
              <div>
                <span className="text-gray-500 font-medium">Tipo:</span>{' '}
                <strong>{record.tipo_mtt}</strong>
              </div>
              <div>
                <span className="text-gray-500 font-medium">Estatus:</span>{' '}
                <span className="font-bold text-emerald-700">{record.estatus_mtt}</span>
              </div>
              <div>
                <span className="text-gray-500 font-medium">Fecha Creación:</span>{' '}
                <span>{record.fecha_creacion || 'N/D'}</span>
              </div>
              <div>
                <span className="text-gray-500 font-medium">Año:</span>{' '}
                <span>{record.ano_creacion || 'N/D'}</span>
              </div>
              <div>
                <span className="text-gray-500 font-medium">Coordenadas:</span>{' '}
                <span className="font-mono text-xs">{record.coordenadas_decimales || 'N/D'}</span>
              </div>
            </div>
          </div>

          {/* Módulo 2 */}
          <div className="p-3 bg-gray-50/70 border border-gray-200 rounded mb-2.5">
            <h5 className="font-bold text-blue-800 text-xs uppercase mb-1.5 border-b border-gray-200 pb-0.5">
              2. Organización Comunal y Demografía (Maestro INE)
            </h5>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-1.5">
              <div>
                <span className="text-gray-500 font-medium">Región:</span>{' '}
                <span>{record.region}</span>
              </div>
              <div>
                <span className="text-gray-500 font-medium">Estado:</span>{' '}
                <strong>{record.entidad_federal}</strong>
              </div>
              <div>
                <span className="text-gray-500 font-medium">Municipio:</span>{' '}
                <strong>{record.municipio}</strong>
              </div>
              <div>
                <span className="text-gray-500 font-medium">Parroquia:</span>{' '}
                <strong>{record.parroquia}</strong>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
              <div>
                <span className="text-gray-500 font-medium">Comuna:</span>{' '}
                <span>{record.nombre_circuito_comunal || 'N/D'}</span>
              </div>
              <div>
                <span className="text-gray-500 font-medium">Consejo Comunal:</span>{' '}
                <span>{record.nombre_cc_referencia || 'N/D'}</span>
              </div>
              <div>
                <span className="text-gray-500 font-medium">Código SITUR:</span>{' '}
                <span className="font-mono">{record.codigo_situr_cc || 'N/D'}</span>
              </div>
              <div>
                <span className="text-gray-500 font-medium">SAC Vinculada:</span>{' '}
                <span>{record.sac_vinculada} ({record.sac_conectada || 'SIN CONEXIÓN'})</span>
              </div>
              <div>
                <span className="text-gray-500 font-medium">N° Familias:</span>{' '}
                <strong>{record.num_familias !== null ? record.num_familias.toLocaleString() : 'N/D'}</strong>
              </div>
              <div>
                <span className="text-gray-500 font-medium">N° Habitantes:</span>{' '}
                <strong>{record.num_habitantes !== null ? record.num_habitantes.toLocaleString() : 'N/D'}</strong>
              </div>
            </div>
          </div>

          {/* Módulo 3 */}
          <div className="p-3 bg-gray-50/70 border border-gray-200 rounded mb-2.5">
            <h5 className="font-bold text-blue-800 text-xs uppercase mb-1.5 border-b border-gray-200 pb-0.5">
              3. Información Técnica de Telecomunicaciones
            </h5>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div>
                <span className="text-gray-500 font-medium">Zona Servida:</span>{' '}
                <strong>{record.zona_servida}</strong>
              </div>
              <div>
                <span className="text-gray-500 font-medium">Elemento Red:</span>{' '}
                <span>{record.elemento_red || 'N/D'}</span>
              </div>
              <div>
                <span className="text-gray-500 font-medium">Medio Transmisión:</span>{' '}
                <span>{record.medio_transmision || 'N/D'}</span>
              </div>
              <div>
                <span className="text-gray-500 font-medium">Huella GPON:</span>{' '}
                <strong className={record.mtt_en_huella_gpon === 'SI' ? 'text-blue-700' : 'text-gray-700'}>
                  {record.mtt_en_huella_gpon}
                </strong>
              </div>
            </div>
          </div>

          {/* Módulo 4 */}
          <div className="p-3 bg-gray-50/70 border border-gray-200 rounded mb-2.5">
            <h5 className="font-bold text-blue-800 text-xs uppercase mb-1.5 border-b border-gray-200 pb-0.5">
              4. Voceros y Voceras (Total: {record.total_voceros ?? 'N/D'})
            </h5>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="bg-white p-2 rounded border border-gray-200 text-xs">
                <span className="font-bold text-gray-800">Vocero/a 1:</span>{' '}
                {record.v1_nombre_apellido || 'N/D'}
                <br />
                <span className="text-gray-500">C.I:</span> {record.v1_cedula ? `V-${record.v1_cedula}` : 'N/D'}{' '}
                | <span className="text-gray-500">Sexo:</span> {record.v1_sexo || 'N/D'}{' '}
                | <span className="text-gray-500">Telf:</span> {record.v1_telefono || 'N/D'}
              </div>
              <div className="bg-white p-2 rounded border border-gray-200 text-xs">
                <span className="font-bold text-gray-800">Vocero/a 2:</span>{' '}
                {record.v2_nombre_apellido || 'N/D'}
                <br />
                <span className="text-gray-500">C.I:</span> {record.v2_cedula ? `V-${record.v2_cedula}` : 'N/D'}{' '}
                | <span className="text-gray-500">Sexo:</span> {record.v2_sexo || 'N/D'}{' '}
                | <span className="text-gray-500">Telf:</span> {record.v2_telefono || 'N/D'}
              </div>
            </div>
          </div>

          {/* Módulo 5 */}
          <div className="p-3 bg-gray-50/70 border border-gray-200 rounded mb-3">
            <h5 className="font-bold text-blue-800 text-xs uppercase mb-1.5 border-b border-gray-200 pb-0.5">
              5. Control, Seguimiento y Verificación
            </h5>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div>
                <span className="text-gray-500 font-medium">Verificado Gerencia Regional:</span>{' '}
                <strong>{record.verificado}</strong>
              </div>
              <div>
                <span className="text-gray-500 font-medium">Activador MTT:</span>{' '}
                <span>{record.activador_mtt || 'N/D'}</span>
              </div>
              <div>
                <span className="text-gray-500 font-medium">Observación:</span>{' '}
                <span className="italic">{record.observacion || 'SIN OBSERVACIÓN'}</span>
              </div>
            </div>
          </div>

          {/* QR de Validación Oficial */}
          <div className="text-center pt-2 border-t border-gray-200 flex flex-col items-center justify-center">
            <div className="p-2 border border-gray-300 rounded bg-white shadow-sm inline-block">
              {/* SVG QR Code Simulation */}
              <svg
                className="w-20 h-20 mx-auto"
                viewBox="0 0 100 100"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <rect width="100" height="100" fill="white" />
                {/* Outer corners */}
                <rect x="10" y="10" width="25" height="25" fill="#212529" />
                <rect x="15" y="15" width="15" height="15" fill="white" />
                <rect x="18" y="18" width="9" height="9" fill="#212529" />

                <rect x="65" y="10" width="25" height="25" fill="#212529" />
                <rect x="70" y="15" width="15" height="15" fill="white" />
                <rect x="73" y="18" width="9" height="9" fill="#212529" />

                <rect x="10" y="65" width="25" height="25" fill="#212529" />
                <rect x="15" y="70" width="15" height="15" fill="white" />
                <rect x="18" y="73" width="9" height="9" fill="#212529" />

                {/* Pattern dots */}
                <rect x="42" y="15" width="6" height="6" fill="#212529" />
                <rect x="52" y="15" width="6" height="6" fill="#212529" />
                <rect x="42" y="25" width="6" height="6" fill="#212529" />
                <rect x="42" y="35" width="16" height="6" fill="#212529" />
                <rect x="15" y="45" width="20" height="6" fill="#212529" />
                <rect x="45" y="50" width="10" height="10" fill="#212529" />
                <rect x="65" y="45" width="8" height="8" fill="#212529" />
                <rect x="80" y="45" width="8" height="8" fill="#212529" />
                <rect x="65" y="65" width="10" height="10" fill="#212529" />
                <rect x="80" y="70" width="10" height="10" fill="#212529" />
                <rect x="45" y="75" width="15" height="8" fill="#212529" />
              </svg>
              <p className="text-[10px] text-gray-500 font-medium mt-1">
                QR de Verificación Oficial en Red
              </p>
              <p className="text-[9px] font-mono text-gray-400">
                /verificar/{record.codigo_mtt || record.expediente_num || '000'}
              </p>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="bg-gray-50 px-5 py-3 border-t border-gray-200 flex justify-end space-x-3 no-print">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-100 transition"
          >
            Cerrar
          </button>
          <button
            onClick={handlePrint}
            className="px-4 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded shadow-sm hover:shadow transition flex items-center space-x-1.5"
          >
            <Printer className="h-4 w-4" />
            <span>Descargar / Imprimir Ficha PDF</span>
          </button>
        </div>
      </div>
    </div>
  );
};

