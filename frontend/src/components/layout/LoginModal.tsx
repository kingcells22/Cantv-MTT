import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Radio, LogIn, Eye, EyeOff, ShieldCheck, AlertTriangle } from 'lucide-react';
import { RecuperarPasswordModal } from '../modals/RecuperarPasswordModal';

export const LoginModal: React.FC = () => {
  const { login, isLoginModalOpen, sessionExpiredNotice } = useAuth();
  const [userVal, setUserVal] = useState<string>('');
  const [passwordVal, setPasswordVal] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isRecoverModalOpen, setIsRecoverModalOpen] = useState<boolean>(false);

  if (!isLoginModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUser = userVal.trim();
    if (!cleanUser) return;

    // El rol institucional está estrictamente vinculado a la cuenta del usuario en BD
    login(cleanUser);
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
        <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 sm:p-7 animate-fadeIn border border-gray-100 my-8">
          <div className="text-center mb-5">
            <div className="inline-flex p-3 bg-blue-100 text-blue-600 rounded-full mb-2.5">
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

          {sessionExpiredNotice && (
            <div className="mb-4 p-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-lg text-xs flex items-start gap-2.5 animate-fadeIn">
              <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
              <span className="font-medium">{sessionExpiredNotice}</span>
            </div>
          )}

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
                autoFocus
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                placeholder="Ej. V-14258963 ó usuario institucional"
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
                  className="w-full pl-3 pr-10 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition font-mono"
                  placeholder="••••••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-2.5 text-gray-400 hover:text-gray-600 transition"
                  title={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
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

            <div className="pt-2 border-t border-gray-100 flex items-center justify-center gap-1.5 text-gray-400 text-[11px]">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
              <span>Acceso seguro bajo políticas RBAC y auditoría institucional</span>
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

