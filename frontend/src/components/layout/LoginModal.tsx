import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { RolInstitucional } from '../../types/mtt';
import { ROLES_DISPONIBLES } from '../../data/catalogos';
import { Radio, LogIn } from 'lucide-react';

export const LoginModal: React.FC = () => {
  const { usuario, rol, login, isLoginModalOpen } = useAuth();
  const [userVal, setUserVal] = useState<string>(usuario || 'miguel.salazar');
  const [roleVal, setRoleVal] = useState<RolInstitucional>(rol || 'Consultor GDC');

  if (!isLoginModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login(userVal, roleVal);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 sm:p-8 animate-fadeIn border border-gray-100">
        <div className="text-center mb-6">
          <div className="inline-flex p-3 bg-blue-100 text-blue-600 rounded-full mb-3">
            <Radio className="h-8 w-8" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Sistema MTT</h2>
          <p className="text-xs font-semibold text-blue-700 tracking-wide uppercase mt-0.5">
            CANTV · GGFPP · FIIIDT
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Seleccione su rol institucional para acceder al sistema
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
              Usuario o Cédula
            </label>
            <input
              type="text"
              value={userVal}
              onChange={(e) => setUserVal(e.target.value)}
              required
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              placeholder="Ej. miguel.salazar ó V-14258963"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
              Perfil de Acceso
            </label>
            <select
              value={roleVal}
              onChange={(e) => setRoleVal(e.target.value as RolInstitucional)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition bg-white"
            >
              {ROLES_DISPONIBLES.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.nombre}
                </option>
              ))}
            </select>
            <p className="text-[11px] text-gray-500 mt-1 italic">
              {ROLES_DISPONIBLES.find((r) => r.id === roleVal)?.descripcion}
            </p>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-4 rounded-lg shadow-md hover:shadow-lg transition flex items-center justify-center space-x-2 text-sm"
            >
              <LogIn className="h-4 w-4" />
              <span>Ingresar al Sistema</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

