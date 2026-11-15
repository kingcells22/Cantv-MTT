import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { RolInstitucional } from '../../types/mtt';
import { ROLES_DISPONIBLES, GENERIC_TEST_USERS } from '../../data/catalogos';
import { Radio, LogIn, Lock, KeyRound, Eye, EyeOff, Shield } from 'lucide-react';
import { RecuperarPasswordModal } from '../modals/RecuperarPasswordModal';

export const LoginModal: React.FC = () => {
  const { usuario, rol, login, isLoginModalOpen } = useAuth();
  const [userVal, setUserVal] = useState<string>(usuario || 'superadmin');
  const [passwordVal, setPasswordVal] = useState<string>('SuperAdmin.2026#CANTV!');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [roleVal, setRoleVal] = useState<RolInstitucional>(rol || 'SuperAdmin');
  const [isRecoverModalOpen, setIsRecoverModalOpen] = useState<boolean>(false);

  if (!isLoginModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login(userVal, roleVal);
  };

  const handleSelectTestUser = (testUser: (typeof GENERIC_TEST_USERS)[0]) => {
    setUserVal(testUser.usuario);
    setPasswordVal(testUser.passwordDemo);
    setRoleVal(testUser.rol as RolInstitucional);
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
        <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 sm:p-7 animate-fadeIn border border-gray-100 my-8">
          <div className="text-center mb-5">
            <div className="inline-flex p-2.5 bg-blue-100 text-blue-600 rounded-full mb-2">
              <Radio className="h-7 w-7" />
            </div>
            <h2 className="text-xl font-extrabold text-gray-900">Sistema SINCOMTT</h2>
            <p className="text-xs font-semibold text-blue-700 tracking-wide uppercase mt-0.5">
              CANTV · GGFPP · FIIIDT
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Plataforma Integral de Registro y Control de Mesas Técnicas de Telecomunicaciones
            </p>
          </div>

          {/* Quick Test Users Carousel / Pills */}
          <div className="mb-4 bg-gray-50 border border-gray-200 rounded-lg p-3">
            <span className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Shield className="h-3.5 w-3.5 text-blue-600" />
              <span>Cuentas de Prueba Preconfiguradas (Clic para Autocompletar):</span>
            </span>
            <div className="flex flex-wrap gap-1.5">
              {GENERIC_TEST_USERS.map((tu) => (
                <button
                  key={tu.usuario}
                  type="button"
                  onClick={() => handleSelectTestUser(tu)}
                  className={`px-2 py-1 text-[11px] font-semibold rounded transition border ${
                    userVal === tu.usuario
                      ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
                  }`}
                  title={`${tu.nombre} - ${tu.descripcion}`}
                >
                  {tu.usuario}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                Usuario o Cédula
              </label>
              <input
                type="text"
                value={userVal}
                onChange={(e) => setUserVal(e.target.value)}
                required
                className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                placeholder="Ej. superadmin ó V-14258963"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-gray-700 uppercase">
                  Contraseña
                </label>
                <button
                  type="button"
                  onClick={() => setIsRecoverModalOpen(true)}
                  className="text-[11px] text-blue-600 hover:text-blue-800 font-semibold transition"
                >
                  ¿Olvidó su contraseña?
                </button>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={passwordVal}
                  onChange={(e) => setPasswordVal(e.target.value)}
                  required
                  className="w-full pl-3 pr-9 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition font-mono"
                  placeholder="••••••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                Rol Institucional de Acceso (RBAC)
              </label>
              <select
                value={roleVal}
                onChange={(e) => setRoleVal(e.target.value as RolInstitucional)}
                className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition bg-white"
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

      <RecuperarPasswordModal
        isOpen={isRecoverModalOpen}
        onClose={() => setIsRecoverModalOpen(false)}
      />
    </>
  );
};

