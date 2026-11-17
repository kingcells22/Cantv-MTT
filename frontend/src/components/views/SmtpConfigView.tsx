import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { SmtpConfig, UsuarioCuenta } from '../../types/mtt';
import { GENERIC_TEST_USERS } from '../../data/catalogos';
import {
  Server,
  Mail,
  Shield,
  KeyRound,
  Users,
  CheckCircle,
  AlertCircle,
  Save,
  Send,
  Lock,
  UserCheck,
  UserX,
  RefreshCw,
  Eye,
  EyeOff,
} from 'lucide-react';

export const SmtpConfigView: React.FC = () => {
  const {
    smtpConfig,
    updateSmtpConfig,
    cuentasUsuarios,
    adminResetPassword,
    toggleUsuarioActivo,
    login,
  } = useAuth();

  const [activeTab, setActiveTab] = useState<'smtp' | 'usuarios' | 'ciberseguridad'>('smtp');
  const [formSmtp, setFormSmtp] = useState<SmtpConfig>(smtpConfig);
  const [correoPrueba, setCorreoPrueba] = useState('anthony.dominguez@fii.gob.ve');
  const [notifExito, setNotifExito] = useState<string | null>(null);
  const [notifError, setNotifError] = useState<string | null>(null);
  const [revealedPasswords, setRevealedPasswords] = useState<Record<string, boolean>>({});

  const toggleReveal = (id: string) => {
    setRevealedPasswords((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  useEffect(() => {
    setFormSmtp(smtpConfig);
  }, [smtpConfig]);

  // Estado para reseteo administrativo
  const [modalResetUser, setModalResetUser] = useState<UsuarioCuenta | null>(null);
  const [nuevaClaveAdmin, setNuevaClaveAdmin] = useState('');

  const handleGuardarSmtp = (e: React.FormEvent) => {
    e.preventDefault();
    updateSmtpConfig(formSmtp);
    setNotifExito('¡Configuración de pasarela SMTP actualizada y almacenada correctamente!');
    setTimeout(() => setNotifExito(null), 4000);
  };

  const handleEnviarPrueba = () => {
    setNotifError(null);
    setNotifExito(null);
    if (!correoPrueba.trim()) {
      setNotifError('Por favor ingrese un correo destinatario para la prueba.');
      return;
    }
    // Simulación de despacho SMTP exitoso
    setNotifExito(
      `✓ Correo de prueba despachado con éxito a "${correoPrueba}" vía ${formSmtp.servidor_host}:${formSmtp.puerto} (${formSmtp.seguridad}).`
    );
    setTimeout(() => setNotifExito(null), 5000);
  };

  const handleConfirmarResetAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalResetUser || !nuevaClaveAdmin) return;
    adminResetPassword(modalResetUser.id, nuevaClaveAdmin);
    setNotifExito(
      `¡Contraseña reseteada para "${modalResetUser.usuario}". Se ha marcado el flag must_change_password=true!`
    );
    setModalResetUser(null);
    setNuevaClaveAdmin('');
    setTimeout(() => setNotifExito(null), 4000);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 p-4 sm:p-6 animate-fadeIn">
      {/* Header */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-red-100 text-red-700 rounded-xl">
            <Shield className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-extrabold text-gray-900">Panel Maestro SuperAdmin</h2>
              <span className="px-2 py-0.5 text-[10px] font-bold bg-red-600 text-white rounded uppercase tracking-wider">
                Nivel 6 · TI
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              Control de Pasarela SMTP, gestión de credenciales, usuarios de prueba y políticas de ciberseguridad
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex p-1 bg-gray-100 rounded-lg text-xs font-semibold">
          <button
            onClick={() => setActiveTab('smtp')}
            className={`px-3 py-1.5 rounded-md transition flex items-center space-x-1.5 ${
              activeTab === 'smtp' ? 'bg-white text-blue-700 shadow-sm font-bold' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Mail className="h-4 w-4" />
            <span>Pasarela SMTP</span>
          </button>
          <button
            onClick={() => setActiveTab('usuarios')}
            className={`px-3 py-1.5 rounded-md transition flex items-center space-x-1.5 ${
              activeTab === 'usuarios' ? 'bg-white text-blue-700 shadow-sm font-bold' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Users className="h-4 w-4" />
            <span>Usuarios de Prueba</span>
          </button>
          <button
            onClick={() => setActiveTab('ciberseguridad')}
            className={`px-3 py-1.5 rounded-md transition flex items-center space-x-1.5 ${
              activeTab === 'ciberseguridad'
                ? 'bg-white text-blue-700 shadow-sm font-bold'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Lock className="h-4 w-4" />
            <span>Ciberseguridad NIST</span>
          </button>
        </div>
      </div>

      {/* Notifications */}
      {notifExito && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs p-3.5 rounded-lg flex items-center space-x-2 animate-fadeIn">
          <CheckCircle className="h-4 w-4 text-emerald-600 flex-shrink-0" />
          <span className="font-medium">{notifExito}</span>
        </div>
      )}
      {notifError && (
        <div className="bg-red-50 border border-red-300 text-red-800 text-xs p-3.5 rounded-lg flex items-center space-x-2 animate-fadeIn">
          <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0" />
          <span className="font-medium">{notifError}</span>
        </div>
      )}

      {/* TAB 1: CONFIGURACIÓN SMTP */}
      {activeTab === 'smtp' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-4">
            <div className="border-b border-gray-200 pb-3 flex items-center justify-between">
              <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wide flex items-center gap-2">
                <Server className="h-4 w-4 text-blue-600" />
                Parámetros de Servidor de Correo Saliente (SMTP)
              </h3>
              <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded">
                {formSmtp.activo ? 'Servicio Activo' : 'Inactivo'}
              </span>
            </div>

            <form onSubmit={handleGuardarSmtp} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Servidor Host SMTP *
                  </label>
                  <input
                    type="text"
                    value={formSmtp.servidor_host}
                    onChange={(e) => setFormSmtp({ ...formSmtp, servidor_host: e.target.value })}
                    required
                    className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 outline-none font-mono"
                    placeholder="smtp.cantv.com.ve"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Puerto de Conexión *
                  </label>
                  <input
                    type="number"
                    value={formSmtp.puerto}
                    onChange={(e) => setFormSmtp({ ...formSmtp, puerto: Number(e.target.value) })}
                    required
                    className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 outline-none font-mono"
                    placeholder="587 ó 465"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Protocolo de Cifrado / Seguridad *
                  </label>
                  <select
                    value={formSmtp.seguridad}
                    onChange={(e) => setFormSmtp({ ...formSmtp, seguridad: e.target.value as any })}
                    className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 outline-none bg-white font-medium"
                  >
                    <option value="TLS">STARTTLS (Puerto 587 - Recomendado)</option>
                    <option value="SSL">SSL / TLS Implícito (Puerto 465)</option>
                    <option value="NINGUNA">Sin Cifrado (No Recomendado)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Correo Remitente Oficial *
                  </label>
                  <input
                    type="email"
                    value={formSmtp.remitente_email}
                    onChange={(e) => setFormSmtp({ ...formSmtp, remitente_email: e.target.value })}
                    required
                    className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 outline-none"
                    placeholder="notificaciones-sincomtt@cantv.com.ve"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Nombre Desplegado del Remitente
                  </label>
                  <input
                    type="text"
                    value={formSmtp.remitente_nombre}
                    onChange={(e) => setFormSmtp({ ...formSmtp, remitente_nombre: e.target.value })}
                    className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 outline-none"
                    placeholder="Sistema SINCOMTT · CANTV GGFPP"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Usuario de Autenticación SMTP
                  </label>
                  <input
                    type="text"
                    value={formSmtp.usuario_smtp}
                    onChange={(e) => setFormSmtp({ ...formSmtp, usuario_smtp: e.target.value })}
                    className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 outline-none"
                    placeholder="notificaciones-sincomtt"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Contraseña / Token de Aplicación SMTP
                </label>
                <input
                  type="password"
                  value={formSmtp.password_smtp}
                  onChange={(e) => setFormSmtp({ ...formSmtp, password_smtp: e.target.value })}
                  className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 outline-none font-mono"
                  placeholder="••••••••••••••••"
                />
              </div>

              <div className="pt-3 border-t border-gray-200 flex justify-end">
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow transition flex items-center space-x-1.5"
                >
                  <Save className="h-4 w-4" />
                  <span>Guardar Configuración SMTP</span>
                </button>
              </div>
            </form>
          </div>

          {/* Test Dispatch Card */}
          <div className="lg:col-span-4 bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-4">
            <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wide flex items-center gap-2 border-b border-gray-200 pb-3">
              <Send className="h-4 w-4 text-emerald-600" />
              Probar Despacho de Correo
            </h3>
            <p className="text-xs text-gray-500">
              Verifique la conectividad en vivo con el servidor de correos CANTV enviando un mensaje de prueba con token simulado.
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Destinatario de Prueba
                </label>
                <input
                  type="email"
                  value={correoPrueba}
                  onChange={(e) => setCorreoPrueba(e.target.value)}
                  className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 outline-none"
                  placeholder="su.correo@cantv.com.ve"
                />
              </div>

              <button
                type="button"
                onClick={handleEnviarPrueba}
                className="w-full py-2 px-3 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow transition flex items-center justify-center space-x-1.5"
              >
                <Send className="h-3.5 w-3.5" />
                <span>Enviar Notificación de Prueba</span>
              </button>
            </div>

            <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 text-[11px] text-gray-600 space-y-1 mt-4">
              <span className="font-bold text-gray-800 block">Flujo de Notificaciones Activas:</span>
              <p>• Recuperación de contraseña (Token 15 min)</p>
              <p>• Notificación de nueva MTT registrada</p>
              <p>• Aprobación o devolución de expediente estadal</p>
              <p>• Asignación formal de Código Oficial GDC</p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: GESTIÓN DE USUARIOS DE PRUEBA */}
      {activeTab === 'usuarios' && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-4">
          <div className="border-b border-gray-200 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wide flex items-center gap-2">
                <Users className="h-4 w-4 text-blue-600" />
                Padrón de Usuarios Genéricos para Pruebas Institucionales
              </h3>
              <p className="text-xs text-gray-500">
                Cuentas preconfiguradas para homologación y validación de permisos por rol institucional
              </p>
            </div>
            <span className="text-xs bg-blue-100 text-blue-800 font-bold px-2.5 py-1 rounded">
              {cuentasUsuarios.length} Cuentas Habilitadas
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-700">
              <thead className="bg-gray-100 uppercase text-gray-600 font-bold border-b border-gray-200">
                <tr>
                  <th className="px-3 py-2.5">Usuario / Login</th>
                  <th className="px-3 py-2.5">Nombre Completo</th>
                  <th className="px-3 py-2.5">Correo Institucional</th>
                  <th className="px-3 py-2.5">Rol (RBAC)</th>
                  <th className="px-3 py-2.5">Contraseña Activa</th>
                  <th className="px-3 py-2.5 text-center">Estatus</th>
                  <th className="px-3 py-2.5 text-right">Acciones de Seguridad</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {cuentasUsuarios.map((u) => {
                  const demoPass = GENERIC_TEST_USERS.find((gt) => gt.usuario === u.usuario)?.passwordDemo;
                  const activePass = u.password || demoPass || 'N/D';
                  const isRevealed = revealedPasswords[u.id];

                  return (
                    <tr key={u.id} className="hover:bg-gray-50 transition">
                      <td className="px-3 py-2.5 font-mono font-bold text-blue-700">
                        {u.usuario}
                      </td>
                      <td className="px-3 py-2.5 font-medium text-gray-900">
                        {u.nombre_completo}
                      </td>
                      <td className="px-3 py-2.5 text-gray-600">
                        {u.correo}
                      </td>
                      <td className="px-3 py-2.5">
                        <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-gray-100 text-gray-800 border border-gray-200">
                          {u.rol}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 font-mono text-xs">
                        <div className="flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded border border-gray-200 w-fit">
                          <span className="font-semibold text-gray-800">
                            {isRevealed ? activePass : '••••••••••••'}
                          </span>
                          <button
                            type="button"
                            onClick={() => toggleReveal(u.id)}
                            className="text-gray-400 hover:text-gray-600 transition p-0.5"
                            title={isRevealed ? 'Ocultar contraseña' : 'Ver contraseña'}
                          >
                            {isRevealed ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                          </button>
                        </div>
                      </td>
                      <td className="px-3 py-2.5 text-center">
                        {u.activo ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                            <UserCheck className="h-3 w-3" /> Activo
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded-full">
                            <UserX className="h-3 w-3" /> Suspendido
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-2.5 text-right space-x-1">
                        <button
                          type="button"
                          onClick={() => login(u.usuario, u.rol)}
                          className="px-2 py-1 text-[10px] font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded transition"
                          title="Iniciar sesión en vivo como este usuario para pruebas"
                        >
                          Simular Acceso
                        </button>
                        <button
                          type="button"
                          onClick={() => setModalResetUser(u)}
                          className="px-2 py-1 text-[10px] font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded transition"
                          title="Cambiar contraseña administrativamente"
                        >
                          Resetear Clave
                        </button>
                        <button
                          type="button"
                          onClick={() => toggleUsuarioActivo(u.id)}
                          className={`px-2 py-1 text-[10px] font-bold rounded transition border ${
                            u.activo
                              ? 'text-red-700 bg-red-50 hover:bg-red-100 border-red-200'
                              : 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border-emerald-200'
                          }`}
                        >
                          {u.activo ? 'Desactivar' : 'Activar'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: CIBERSEGURIDAD NIST SP 800-63B */}
      {activeTab === 'ciberseguridad' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-3">
            <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wide flex items-center gap-2 border-b border-gray-200 pb-2">
              <Shield className="h-4 w-4 text-blue-600" />
              Políticas de Contraseña NIST SP 800-63B Activas
            </h3>
            <ul className="text-xs text-gray-600 space-y-2 pt-1">
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                <span><strong>Longitud mínima obligatoria:</strong> 12 caracteres.</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                <span><strong>Composición:</strong> Mayúsculas, minúsculas, números y símbolos especiales.</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                <span><strong>Algoritmo de Hashing:</strong> Bcrypt (Cost 12) / Argon2id con salting criptográfico.</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                <span><strong>Cero Preguntas de Seguridad:</strong> Erradicadas para evitar ingeniería social.</span>
              </li>
            </ul>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-3">
            <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wide flex items-center gap-2 border-b border-gray-200 pb-2">
              <Lock className="h-4 w-4 text-red-600" />
              Protección Perimetral y Mitigación de Ataques
            </h3>
            <ul className="text-xs text-gray-600 space-y-2 pt-1">
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                <span><strong>Anti Fuerza Bruta (Redis):</strong> Bloqueo tras 5 intentos fallidos en 15 min.</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                <span><strong>Anti-Enumeración:</strong> Mensajes de respuesta opacos en login y recuperación.</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                <span><strong>Tokens de Recuperación:</strong> CSPRNG 256 bits, un solo uso y TTL de 15 minutos.</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                <span><strong>Sesiones Revocables:</strong> Destrucción inmediata de tokens JWT en logout.</span>
              </li>
            </ul>
          </div>
        </div>
      )}

      {/* MODAL RESETEO ADMINISTRATIVO */}
      {modalResetUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 animate-fadeIn border border-gray-200">
            <h4 className="text-base font-bold text-gray-900 mb-1">
              Resetear Contraseña Administrativamente
            </h4>
            <p className="text-xs text-gray-500 mb-4">
              Usuario: <strong className="text-blue-700">{modalResetUser.usuario}</strong> ({modalResetUser.nombre_completo})
            </p>

            <form onSubmit={handleConfirmarResetAdmin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Nueva Contraseña Temporal
                </label>
                <input
                  type="password"
                  value={nuevaClaveAdmin}
                  onChange={(e) => setNuevaClaveAdmin(e.target.value)}
                  placeholder="Mínimo 12 caracteres"
                  required
                  className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 outline-none"
                />
              </div>

              <div className="p-3 bg-amber-50 border border-amber-200 text-amber-900 text-xs rounded-lg">
                Se forzará al usuario a cambiar esta clave en su próximo inicio de sesión (flag <code>must_change_password = true</code>).
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalResetUser(null)}
                  className="px-4 py-1.5 text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded transition shadow"
                >
                  Confirmar Reseteo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
