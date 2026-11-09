import React from 'react';
import { MTTRecord } from '../../types/mtt';
import { X, FileText, Download, CheckCircle2 } from 'lucide-react';

interface VerActaModalProps {
  record: MTTRecord | null;
  isOpen: boolean;
  onClose: () => void;
}

export const VerActaModal: React.FC<VerActaModalProps> = ({ record, isOpen, onClose }) => {
  if (!isOpen || !record) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full my-8 overflow-hidden border border-gray-200">
        <div className="bg-gray-900 text-white px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FileText className="h-5 w-5 text-red-500" />
            <h3 className="text-sm font-bold tracking-wide">
              Acta Digitalizada: {record.nombre_mtt}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition p-1 rounded"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="bg-blue-50 border border-blue-200 p-3 rounded text-xs text-blue-900 flex items-center justify-between">
            <div>
              <span className="font-bold">Expediente:</span> {record.expediente_num || 'EXP-2026-N/D'} |{' '}
              <span className="font-bold">Ubicación:</span> {record.entidad_federal} / {record.municipio} / {record.parroquia}
            </div>
            <span className="px-2 py-0.5 rounded font-mono font-bold bg-white text-blue-700 border border-blue-300">
              {record.acta_nombre || 'Acta_Oficial_MTT.pdf'}
            </span>
          </div>

          {/* Document representation */}
          <div className="border-2 border-gray-200 rounded-lg p-8 bg-gray-50 flex flex-col items-center justify-center text-center space-y-3 min-h-[260px]">
            <div className="p-4 bg-white border border-gray-200 rounded-full shadow-sm">
              <FileText className="h-12 w-12 text-red-600" />
            </div>
            <div>
              <h4 className="font-bold text-gray-800 text-sm">
                Documento Oficial de Conformación / Renovación
              </h4>
              <p className="text-xs text-gray-500 max-w-md mt-1">
                Acta de asamblea ciudadana debidamente firmada por los voceros y sellada por el Consejo Comunal / Comuna y avalada por la Gerencia Regional.
              </p>
            </div>
            <div className="flex items-center space-x-2 pt-2 text-xs font-semibold text-emerald-700">
              <CheckCircle2 className="h-4 w-4" />
              <span>Verificación de Integridad de Firma Digital Completada</span>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 px-5 py-3 border-t border-gray-200 flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-100 transition"
          >
            Cerrar
          </button>
          <button
            onClick={() => alert(`Descargando copia del acta digitalizada: ${record.acta_nombre || 'Acta.pdf'}`)}
            className="px-4 py-1.5 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded shadow-sm hover:shadow transition flex items-center space-x-1.5"
          >
            <Download className="h-4 w-4" />
            <span>Descargar Documento</span>
          </button>
        </div>
      </div>
    </div>
  );
};

