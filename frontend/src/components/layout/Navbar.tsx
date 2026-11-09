import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Menu, ShieldCheck, ChevronDown, LogOut, Radio } from 'lucide-react';

interface NavbarProps {
  title: string;
  onToggleSidebar: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ title, onToggleSidebar }) => {
  const { usuario, rol, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = React.useState(false);

  return (
    <header className="bg-white border-b border-gray-200 px-4 py-3 sm:px-6 sticky top-0 z-30 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <button
            onClick={onToggleSidebar}
            className="lg:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none"
            aria-label="Toggle navigation"
          >
            <Menu className="h-6 w-6" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <span className="hidden sm:inline text-xs font-semibold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                CANTV · GGFPP
              </span>
              <span>{title}</span>
            </h1>
          </div>
        </div>

        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center space-x-2 text-sm font-medium text-gray-700 bg-gray-50 border border-gray-300 rounded-lg px-3 py-1.5 hover:bg-gray-100 transition shadow-sm"
          >
            <ShieldCheck className="h-4 w-4 text-blue-600" />
            <span className="font-semibold">{rol}</span>
            <ChevronDown className="h-4 w-4 text-gray-500" />
          </button>

          {dropdownOpen && (
            <div
              className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50 animate-fadeIn"
              onMouseLeave={() => setDropdownOpen(false)}
            >
              <div className="px-4 py-2 border-b border-gray-100 bg-gray-50">
                <p className="text-xs text-gray-500 font-medium">Sesión activa</p>
                <p className="text-sm font-bold text-gray-800 truncate">{usuario}</p>
                <p className="text-xs text-blue-600 font-medium">{rol}</p>
              </div>
              <button
                onClick={() => {
                  setDropdownOpen(false);
                  logout();
                }}
                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2 transition font-medium"
              >
                <LogOut className="h-4 w-4 text-red-500" />
                <span>Cambiar de Rol / Salir</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

