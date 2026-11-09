import React, { useState, useMemo } from 'react';
import { MTTRecord } from '../../types/mtt';
import { Table, Search, Download, FileText, Filter, ChevronLeft, ChevronRight } from 'lucide-react';

interface MatrizDatosViewProps {
  records: MTTRecord[];
  onOpenPdf: (record: MTTRecord) => void;
}

export const MatrizDatosView: React.FC<MatrizDatosViewProps> = ({ records, onOpenPdf }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEstado, setFilterEstado] = useState('');
  const [filterEstatus, setFilterEstatus] = useState('');
  const [filterGpon, setFilterGpon] = useState('');
  const [pageSize, setPageSize] = useState(15);
  const [currentPage, setCurrentPage] = useState(1);

  // Unique estados for filter
  const estadosList = useMemo(() => {
    const set = new Set(records.map((r) => r.entidad_federal).filter(Boolean));
    return Array.from(set).sort();
  }, [records]);

  // Filter records
  const filtered = useMemo(() => {
    return records.filter((r) => {
      const q = searchTerm.toLowerCase();
      const matchSearch =
        !searchTerm ||
        r.nombre_mtt.toLowerCase().includes(q) ||
        (r.codigo_mtt && r.codigo_mtt.toLowerCase().includes(q)) ||
        (r.expediente_num && r.expediente_num.toLowerCase().includes(q)) ||
        r.entidad_federal.toLowerCase().includes(q) ||
        r.municipio.toLowerCase().includes(q) ||
        r.parroquia.toLowerCase().includes(q);

      const matchEstado = !filterEstado || r.entidad_federal === filterEstado;
      const matchEstatus = !filterEstatus || r.estatus_mtt === filterEstatus;
      const matchGpon = !filterGpon || r.mtt_en_huella_gpon === filterGpon;

      return matchSearch && matchEstado && matchEstatus && matchGpon;
    });
  }, [records, searchTerm, filterEstado, filterEstatus, filterGpon]);

  // Pagination
  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  const paginated = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, currentPage, pageSize]);

  // Export CSV
  const handleExportCSV = () => {
    const headers = [
      'CODIGO MTT',
      'EXPEDIENTE',
      'NOMBRE MTT',
      'TIPO',
      'ESTATUS',
      'REGION',
      'ESTADO',
      'MUNICIPIO',
      'PARROQUIA',
      'GPON',
      'VERIFICADO',
      'TOTAL VOCEROS',
      'FECHA CREACION',
    ];

    const rows = filtered.map((r) => [
      r.codigo_mtt || 'PENDIENTE',
      r.expediente_num || 'N/D',
      `"${r.nombre_mtt.replace(/"/g, '""')}"`,
      r.tipo_mtt,
      r.estatus_mtt,
      r.region,
      r.entidad_federal,
      r.municipio,
      r.parroquia,
      r.mtt_en_huella_gpon,
      r.verificado,
      r.total_voceros ?? '',
      r.fecha_creacion || '',
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Matriz_MTT_SINCOMTT_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-6 space-y-4">
      {/* Title Bar */}
      <div className="border-b border-gray-200 pb-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center space-x-2">
          <div className="p-2 bg-blue-100 text-blue-700 rounded-lg">
            <Table className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              Matriz de Datos Nacional (51 Columnas de Estructura)
            </h2>
            <p className="text-xs text-gray-500">
              Visualización integral, búsqueda federada y exportación oficial
            </p>
          </div>
        </div>

        <button
          onClick={handleExportCSV}
          className="self-start sm:self-auto px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs shadow-sm hover:shadow transition flex items-center space-x-1.5"
        >
          <Download className="h-4 w-4" />
          <span>Exportar a Excel / CSV</span>
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-12 gap-3 bg-gray-50 p-3.5 rounded-xl border border-gray-200">
        <div className="md:col-span-4 relative">
          <Search className="h-4 w-4 text-gray-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Buscar por nombre, código, parroquia..."
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 outline-none bg-white"
          />
        </div>

        <div className="md:col-span-3">
          <select
            value={filterEstado}
            onChange={(e) => {
              setFilterEstado(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full px-2.5 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 outline-none bg-white"
          >
            <option value="">Todos los Estados ({estadosList.length})</option>
            {estadosList.map((edo) => (
              <option key={edo} value={edo}>
                {edo}
              </option>
            ))}
          </select>
        </div>

        <div className="md:col-span-2">
          <select
            value={filterEstatus}
            onChange={(e) => {
              setFilterEstatus(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full px-2.5 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 outline-none bg-white"
          >
            <option value="">Todos los Estatus</option>
            <option value="ACTIVA">ACTIVA</option>
            <option value="INACTIVA">INACTIVA</option>
            <option value="CERRADA">CERRADA</option>
          </select>
        </div>

        <div className="md:col-span-2">
          <select
            value={filterGpon}
            onChange={(e) => {
              setFilterGpon(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full px-2.5 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 outline-none bg-white"
          >
            <option value="">Huella GPON (Todos)</option>
            <option value="SI">GPON: Sí</option>
            <option value="NO">GPON: No</option>
          </select>
        </div>

        <div className="md:col-span-1">
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 outline-none bg-white font-semibold text-center"
          >
            <option value={15}>15</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto border border-gray-200 rounded-lg">
        <table className="w-full text-left text-xs divide-y divide-gray-200">
          <thead className="bg-gray-100 text-gray-700 uppercase text-[11px] font-bold tracking-wider">
            <tr>
              <th className="px-3.5 py-2.5">Código MTT</th>
              <th className="px-3.5 py-2.5">Nombre</th>
              <th className="px-3.5 py-2.5">Estatus</th>
              <th className="px-3.5 py-2.5">Región</th>
              <th className="px-3.5 py-2.5">Estado</th>
              <th className="px-3.5 py-2.5">Municipio</th>
              <th className="px-3.5 py-2.5">Parroquia</th>
              <th className="px-3.5 py-2.5 text-center">GPON</th>
              <th className="px-3.5 py-2.5 text-center">Verificado</th>
              <th className="px-3.5 py-2.5 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {paginated.length === 0 ? (
              <tr>
                <td colSpan={10} className="px-4 py-8 text-center text-gray-500">
                  No se encontraron registros que coincidan con los filtros aplicados.
                </td>
              </tr>
            ) : (
              paginated.map((mtt) => {
                const hasCode = mtt.codigo_mtt && mtt.codigo_mtt !== '' && mtt.codigo_mtt !== 'PENDIENTE';
                return (
                  <tr key={mtt.id} className="hover:bg-blue-50/40 transition">
                    <td className="px-3.5 py-2.5 font-mono font-bold text-blue-700 whitespace-nowrap">
                      {hasCode ? (
                        mtt.codigo_mtt
                      ) : (
                        <span className="text-[10px] font-sans px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-bold">
                          PENDIENTE
                        </span>
                      )}
                    </td>
                    <td className="px-3.5 py-2.5 font-semibold text-gray-900 max-w-xs truncate">
                      {mtt.nombre_mtt}
                    </td>
                    <td className="px-3.5 py-2.5">
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
                    <td className="px-3.5 py-2.5 text-gray-600">{mtt.region}</td>
                    <td className="px-3.5 py-2.5 text-gray-700 font-medium whitespace-nowrap">
                      {mtt.entidad_federal}
                    </td>
                    <td className="px-3.5 py-2.5 text-gray-600 whitespace-nowrap">
                      {mtt.municipio}
                    </td>
                    <td className="px-3.5 py-2.5 text-gray-600 whitespace-nowrap">
                      {mtt.parroquia}
                    </td>
                    <td className="px-3.5 py-2.5 text-center">
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
                    <td className="px-3.5 py-2.5 text-center">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          mtt.verificado === 'SI'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {mtt.verificado}
                      </span>
                    </td>
                    <td className="px-3.5 py-2.5 text-right whitespace-nowrap">
                      <button
                        onClick={() => onOpenPdf(mtt)}
                        className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 text-blue-700 bg-blue-50 hover:bg-blue-100 rounded border border-blue-200 transition"
                      >
                        <FileText className="h-3 w-3" />
                        <span>Ficha</span>
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination & Count */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-600 pt-2">
        <div>
          Mostrando <strong className="text-gray-900">{paginated.length}</strong> de{' '}
          <strong className="text-gray-900">{filtered.length}</strong> registros filtrados (Total en base:{' '}
          <strong>{records.length}</strong>)
        </div>

        <div className="flex items-center space-x-1.5">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="p-1.5 rounded border border-gray-300 disabled:opacity-40 hover:bg-gray-100 transition"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="px-3 py-1 font-semibold text-gray-800">
            Página {currentPage} de {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="p-1.5 rounded border border-gray-300 disabled:opacity-40 hover:bg-gray-100 transition"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

