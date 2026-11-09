import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { ViewType } from '../../types/mtt';
import {
  Radio,
  Home,
  FilePlus,
  FileEdit,
  ShieldAlert,
  ClipboardCheck,
  Table,
  X,
  Building2,
} from 'lucide-react';

interface SidebarProps {
  currentView: ViewType;
  onSelectView: (view: ViewType) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  counts: {
    total: number;
    pendientesGdc: number;
    pendientesRegional: number;
  };
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onSelectView,
  isOpenMobile,
  onCloseMobile,
  counts,
}) => {
  const { rol, puedeRegistrar, puedeEditar, puedeAsignarCodigo, puedeValidarRegional } = useAuth();

  const isGerente = rol.includes('Gerente');

  return (
    <>
      {/* Mobile backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden transition-opacity"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={`fixed top-0 left-0 h-screen w-64 bg-[#212529] text-white flex flex-col z-50 transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="p-4 bg-[#111418] border-b border-gray-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 bg-blue-600 rounded text-white">
              <Radio className="h-5 w-5" />
            </div>
            <div>
              <span className="font-bold text-lg tracking-wide">Sistema MTT</span>
              <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">
                CANTV · GGFPP · FIIIDT
              </p>
            </div>
          </div>
          <button
            onClick={onCloseMobile}
            className="lg:hidden text-gray-400 hover:text-white p-1 rounded"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
          <button
            onClick={() => {
              onSelectView('dashboardView');
              onCloseMobile();
            }}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-md text-sm font-medium transition ${
              currentView === 'dashboardView'
                ? 'bg-blue-600 text-white shadow-sm border-l-4 border-white'
                : 'text-gray-300 hover:bg-[#343a40] hover:text-white'
            }`}
          >
            <div className="flex items-center space-x-3">
              <Home className="h-4 w-4" />
              <span>Página Principal</span>
            </div>
          </button>

          {puedeRegistrar && (
            <button
              onClick={() => {
                onSelectView('registryView');
                onCloseMobile();
              }}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-md text-sm font-medium transition ${
                currentView === 'registryView'
                  ? 'bg-blue-600 text-white shadow-sm border-l-4 border-white'
                  : 'text-gray-300 hover:bg-[#343a40] hover:text-white'
              }`}
            >
              <div className="flex items-center space-x-3">
                <FilePlus className="h-4 w-4" />
                <span>Registrar Nueva MTT</span>
              </div>
            </button>
          )}

          {puedeEditar && (
            <button
              onClick={() => {
                onSelectView('updateView');
                onCloseMobile();
              }}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-md text-sm font-medium transition ${
                currentView === 'updateView'
                  ? 'bg-blue-600 text-white shadow-sm border-l-4 border-white'
                  : 'text-gray-300 hover:bg-[#343a40] hover:text-white'
              }`}
            >
              <div className="flex items-center space-x-3">
                <FileEdit className="h-4 w-4" />
                <span>Actualizar / Vocerías</span>
              </div>
            </button>
          )}

          {(puedeValidarRegional || isGerente) && (
            <button
              onClick={() => {
                onSelectView('regionalView');
                onCloseMobile();
              }}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-md text-sm font-medium transition ${
                currentView === 'regionalView'
                  ? 'bg-blue-600 text-white shadow-sm border-l-4 border-white'
                  : 'text-gray-300 hover:bg-[#343a40] hover:text-white'
              }`}
            >
              <div className="flex items-center space-x-3">
                <ClipboardCheck className="h-4 w-4 text-emerald-400" />
                <span>Bandeja Regional</span>
              </div>
              {counts.pendientesRegional > 0 && (
                <span className="bg-emerald-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">
                  {counts.pendientesRegional}
                </span>
              )}
            </button>
          )}

          {(puedeAsignarCodigo || isGerente) && (
            <button
              onClick={() => {
                onSelectView('gdcView');
                onCloseMobile();
              }}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-md text-sm font-medium transition ${
                currentView === 'gdcView'
                  ? 'bg-blue-600 text-white shadow-sm border-l-4 border-white'
                  : 'text-gray-300 hover:bg-[#343a40] hover:text-white'
              }`}
            >
              <div className="flex items-center space-x-3">
                <ShieldAlert className="h-4 w-4 text-amber-400" />
                <span>Bandeja GDC (Códigos)</span>
              </div>
              {counts.pendientesGdc > 0 && (
                <span className="bg-amber-500 text-black text-xs px-2 py-0.5 rounded-full font-bold">
                  {counts.pendientesGdc}
                </span>
              )}
            </button>
          )}

          <button
            onClick={() => {
              onSelectView('databaseView');
              onCloseMobile();
            }}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-md text-sm font-medium transition ${
              currentView === 'databaseView'
                ? 'bg-blue-600 text-white shadow-sm border-l-4 border-white'
                : 'text-gray-300 hover:bg-[#343a40] hover:text-white'
            }`}
          >
            <div className="flex items-center space-x-3">
              <Table className="h-4 w-4" />
              <span>Matriz de Datos (51 Cols)</span>
            </div>
            <span className="bg-gray-700 text-gray-200 text-xs px-2 py-0.5 rounded-full">
              {counts.total}
            </span>
          </button>
        </nav>

        {/* Footer info */}
        <div className="p-3 bg-[#111418] border-t border-gray-800 text-[11px] text-gray-400 flex flex-col space-y-1">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-gray-300">Entorno Docker</span>
            <span className="text-emerald-400 font-mono">Debian Bookworm</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Conexión</span>
            <span className="text-blue-400">Same-Origin (/api)</span>
          </div>
        </div>
      </aside>
    </>
  );
};

