import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { X, Mail, KeyRound, ShieldCheck, AlertCircle, CheckCircle, ArrowRight, Lock } from 'lucide-react';

interface RecuperarPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RecuperarPasswordModal: React.FC<RecuperarPasswordModalProps> = ({ isOpen, onClose }) => {
  const { solicitarRecuperacionClave, ejecutarResetPassword } = useAuth();
  const [paso, setPaso] = useState<1 | 2>(1);
  const [identificador, setIdentificador] = useState('');
  const [tokenInput, setTokenInput] = useState('');
  const [tokenDemoGenerado, setTokenDemoGenerado] = useState<string | null>(null);
  const [nuevaPassword, setNuevaPassword] = useState('');
  const [confirmarPassword, setConfirmarPassword] = useState('');
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);
  const [mensajeError, setMensajeError] = useState<string | null>(null);

  if (!isOpen) return null;

  // Evaluación de complejidad NIST SP 800-63B
  const hasMinLength = nuevaPassword.length >= 12;
  const hasUpper = /[A-Z]/.test(nuevaPassword);
  const hasLower = /[a-z]/.test(nuevaPassword);
  const hasNumber = /[0-9]/.test(nuevaPassword);
  const hasSpecial = /[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(nuevaPassword);
  const passwordsMatch = nuevaPassword !== '' && nuevaPassword === confirmarPassword;

  const validScore = [hasMinLength, hasUpper, hasLower, hasNumber, hasSpecial].filter(Boolean).length;
  const isPasswordSecure = validScore === 5 && passwordsMatch;

  const handleSolicitarToken = (e: React.FormEvent) => {
    e.preventDefault();
    setMensajeError(null);
    setMensajeExito(null);

    if (!identificador.trim()) {
      setMensajeError('Por favor ingrese su usuario o correo institucional.');
      return;
    }

    const res = solicitarRecuperacionClave(identificador);
    if (res.tokenDemo) {
      setTokenDemoGenerado(res.tokenDemo);
      setTokenInput(res.tokenDemo); // Autocompletar para agilizar pruebas
    }
    setMensajeExito(res.mensaje);
    setPaso(2);
  };

  const handleEjecutarReset = (e: React.FormEvent) => {
    e.preventDefault();
    setMensajeError(null);
    setMensajeExito(null);

    if (!tokenInput.trim()) {
      setMensajeError('Debe ingresar el token de recuperación recibido en su correo.');
      return;
    }

    if (!isPasswordSecure) {
      setMensajeError('La nueva contraseña no cumple con todos los requisitos de ciberseguridad NIST.');
      return;
    }

    const res = ejecutarResetPassword(tokenInput.trim(), nuevaPassword);
    if (res.success) {
      setMensajeExito(res.mensaje);
      setTimeout(() => {
        onClose();
        setPaso(1);
        setIdentificador('');
        setNuevaPassword('');
        setConfirmarPassword('');
        setTokenInput('');
        setTokenDemoGenerado(null);
        setMensajeExito(null);
      }, 3000);
    } else {
      setMensajeError(res.mensaje);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 animate-fadeIn border border-gray-200">
        <div className="flex items-center justify-between border-b border-gray-200 pb-3 mb-4">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-blue-100 text-blue-700 rounded-lg">
              <KeyRound className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900">Recuperación Segura de Contraseña</h3>
              <p className="text-xs text-gray-500">Pasarela Oficial SMTP · Red CANTV</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 p-1 rounded transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {mensajeError && (
          <div className="mb-4 bg-red-50 border border-red-300 text-red-800 text-xs p-3 rounded-lg flex items-start space-x-2">
            <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0 mt-0.5" />
            <span>{mensajeError}</span>
          </div>
        )}

        {mensajeExito && (
          <div className="mb-4 bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs p-3 rounded-lg flex items-start space-x-2">
            <CheckCircle className="h-4 w-4 text-emerald-600 flex-shrink-0 mt-0.5" />
            <span>{mensajeExito}</span>
          </div>
        )}

        {paso === 1 ? (
          <form onSubmit={handleSolicitarToken} className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 text-blue-900 text-xs p-3 rounded-lg flex items-start space-x-2">
              <ShieldCheck className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
              <span>
                Ingrese su correo institucional (@cantv.com.ve o @fii.gob.ve) o su nombre de usuario. Se despachará un token de recuperación cifrado con vigencia estricta de 15 minutos.
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                Usuario o Correo Institucional
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={identificador}
                  onChange={(e) => setIdentificador(e.target.value)}
                  placeholder="ej. anthony.dominguez@cantv.com.ve o superadmin"
                  required
                  className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
                <Mail className="h-4 w-4 text-gray-400 absolute left-3 top-2.5" />
              </div>
            </div>

            <div className="pt-2 flex justify-end space-x-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition flex items-center space-x-1.5 shadow"
              >
                <span>Enviar Token de Recuperación</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleEjecutarReset} className="space-y-4">
            {tokenDemoGenerado && (
              <div className="bg-amber-50 border border-amber-300 text-amber-900 text-xs p-3 rounded-lg flex items-start justify-between">
                <div>
                  <span className="font-bold">Token Generado para Pruebas:</span>
                  <p className="font-mono text-xs text-blue-800 break-all mt-0.5">{tokenDemoGenerado}</p>
                  <p className="text-[10px] text-gray-500 mt-1">
                    (En producción se envía directamente a la casilla de correo del usuario).
                  </p>
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                Token de Validación (CSPRNG 15 min)
              </label>
              <input
                type="text"
                value={tokenInput}
                onChange={(e) => setTokenInput(e.target.value)}
                placeholder="Pegue aquí el token recibido"
                required
                className="w-full px-3 py-2 text-sm font-mono border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  Nueva Contraseña
                </label>
                <div className="relative">
                  <input
                    type="password"
                    value={nuevaPassword}
                    onChange={(e) => setNuevaPassword(e.target.value)}
                    placeholder="Mínimo 12 caracteres"
                    required
                    className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                  <Lock className="h-3.5 w-3.5 text-gray-400 absolute left-2.5 top-2.5" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  Confirmar Contraseña
                </label>
                <div className="relative">
                  <input
                    type="password"
                    value={confirmarPassword}
                    onChange={(e) => setConfirmarPassword(e.target.value)}
                    placeholder="Repita la contraseña"
                    required
                    className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                  <Lock className="h-3.5 w-3.5 text-gray-400 absolute left-2.5 top-2.5" />
                </div>
              </div>
            </div>

            {/* Medidor de Complejidad NIST SP 800-63B */}
            <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 text-[11px] space-y-1">
              <span className="font-bold text-gray-700 block mb-1">Requisitos de Complejidad Obligatorios:</span>
              <div className="grid grid-cols-2 gap-1 text-[11px]">
                <span className={hasMinLength ? 'text-emerald-600 font-bold' : 'text-gray-400'}>
                  {hasMinLength ? '✓' : '○'} Mínimo 12 caracteres ({nuevaPassword.length}/12)
                </span>
                <span className={hasUpper ? 'text-emerald-600 font-bold' : 'text-gray-400'}>
                  {hasUpper ? '✓' : '○'} Al menos una Mayúscula (A-Z)
                </span>
                <span className={hasLower ? 'text-emerald-600 font-bold' : 'text-gray-400'}>
                  {hasLower ? '✓' : '○'} Al menos una Minúscula (a-z)
                </span>
                <span className={hasNumber ? 'text-emerald-600 font-bold' : 'text-gray-400'}>
                  {hasNumber ? '✓' : '○'} Al menos un Número (0-9)
                </span>
                <span className={hasSpecial ? 'text-emerald-600 font-bold' : 'text-gray-400'}>
                  {hasSpecial ? '✓' : '○'} Carácter especial (!@#$...)
                </span>
                <span className={passwordsMatch ? 'text-emerald-600 font-bold' : 'text-gray-400'}>
                  {passwordsMatch ? '✓' : '○'} Ambas contraseñas coinciden
                </span>
              </div>
            </div>

            <div className="pt-2 flex justify-between items-center">
              <button
                type="button"
                onClick={() => setPaso(1)}
                className="text-xs text-gray-500 hover:text-gray-700 underline"
              >
                Volver a solicitar token
              </button>
              <div className="space-x-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
                >
                  Cerrar
                </button>
                <button
                  type="submit"
                  disabled={!isPasswordSecure}
                  className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 disabled:cursor-not-allowed rounded-lg transition shadow"
                >
                  Confirmar Nueva Contraseña
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
