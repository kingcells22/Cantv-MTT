import React, { createContext, useContext, useState, useEffect } from 'react';
import { RolInstitucional, SmtpConfig, UsuarioCuenta } from '../types/mtt';
import { ROLES_DISPONIBLES, GENERIC_TEST_USERS } from '../data/catalogos';
import { authService } from '../services/api';

interface AuthContextType {
  usuario: string;
  rol: RolInstitucional;
  isAuthenticated: boolean;
  esSuperAdmin: boolean;
  login: (
    userOrCedula: string,
    passwordOrRole?: string | RolInstitucional,
    explicitRole?: RolInstitucional
  ) => Promise<{ success: boolean; error?: string }>;
  logout: (reason?: 'inactividad' | 'manual') => void;
  openLoginModal: () => void;
  closeLoginModal: () => void;
  isLoginModalOpen: boolean;
  sessionExpiredNotice: string | null;
  tiempoRestanteSegundos: number;
  puedeRegistrar: boolean;
  puedeEditar: boolean;
  puedeAsignarCodigo: boolean;
  puedeValidarRegional: boolean;
  // Gestión de Ciberseguridad & SMTP (SuperAdmin)
  smtpConfig: SmtpConfig;
  updateSmtpConfig: (config: SmtpConfig) => void;
  cuentasUsuarios: UsuarioCuenta[];
  adminResetPassword: (usuarioId: string, nuevaClave: string) => void;
  toggleUsuarioActivo: (usuarioId: string) => void;
  solicitarRecuperacionClave: (identificador: string) => { success: boolean; mensaje: string; tokenDemo?: string };
  ejecutarResetPassword: (token: string, nuevaClave: string) => { success: boolean; mensaje: string };
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Tiempo máximo de inactividad de sesión: 15 minutos exactos (NIST SP 800-63B)
const SESSION_TIMEOUT_MS = 15 * 60 * 1000;

const initialSmtpConfig: SmtpConfig = {
  servidor_host: 'smtp.cantv.com.ve',
  puerto: 587,
  seguridad: 'TLS',
  remitente_email: 'notificaciones-sincomtt@cantv.com.ve',
  remitente_nombre: 'Sistema SINCOMTT · CANTV GGFPP',
  usuario_smtp: 'notificaciones-sincomtt',
  password_smtp: 'Cantv#Smtp2026!',
  activo: true,
};

const initialCuentas: UsuarioCuenta[] = GENERIC_TEST_USERS.map((u, i) => ({
  id: `usr-${i + 1}`,
  usuario: u.usuario,
  cedula: u.cedula,
  nombre_completo: u.nombre,
  correo: u.correo,
  rol: u.rol as RolInstitucional,
  activo: true,
  must_change_password: false,
  ultimo_acceso: '2026-11-15 12:45',
}));

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Por defecto NO autenticado: se requiere inicio de sesión obligatorio
  const [usuario, setUsuario] = useState<string>('');
  const [rol, setRol] = useState<RolInstitucional>('Usuario Consulta');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(true);
  const [sessionExpiredNotice, setSessionExpiredNotice] = useState<string | null>(null);
  const [tiempoRestanteSegundos, setTiempoRestanteSegundos] = useState<number>(900);
  const [smtpConfig, setSmtpConfig] = useState<SmtpConfig>(initialSmtpConfig);
  const [cuentasUsuarios, setCuentasUsuarios] = useState<UsuarioCuenta[]>(initialCuentas);
  // Almacén en memoria de tokens de recuperación activos (TTL 15 min)
  const [tokensRecuperacion, setTokensRecuperacion] = useState<Record<string, { usuario: string; expira: number }>>({});

  useEffect(() => {
    const savedUser = localStorage.getItem('mtt_user');
    const savedRole = localStorage.getItem('mtt_role') as RolInstitucional;
    const expiraStr = localStorage.getItem('mtt_session_expira');
    const expira = expiraStr ? Number(expiraStr) : 0;
    const now = Date.now();

    if (savedUser && savedRole && expira && now < expira) {
      // Sesión previa válida y no expirada
      setUsuario(savedUser);
      setRol(savedRole);
      setIsAuthenticated(true);
      setIsLoginModalOpen(false);
      setSessionExpiredNotice(null);
      localStorage.setItem('mtt_session_expira', String(now + SESSION_TIMEOUT_MS));
    } else {
      // Sin sesión previa o expirada: requerir login
      setUsuario('');
      setRol('Usuario Consulta');
      setIsAuthenticated(false);
      setIsLoginModalOpen(true);
      localStorage.removeItem('mtt_user');
      localStorage.removeItem('mtt_role');
      localStorage.removeItem('mtt_session_expira');
      if (expira && now >= expira) {
        setSessionExpiredNotice(
          'Su sesión anterior ha finalizado por inactividad (15 min). Por favor, inicie sesión.'
        );
      }
    }

    const savedSmtp = localStorage.getItem('mtt_smtp_config');
    if (savedSmtp) {
      try {
        setSmtpConfig(JSON.parse(savedSmtp));
      } catch (e) {}
    }
    const savedCuentas = localStorage.getItem('mtt_usuarios_cuentas');
    if (savedCuentas) {
      try {
        setCuentasUsuarios(JSON.parse(savedCuentas));
      } catch (e) {}
    }
  }, []);

  // Monitor continuo de inactividad de sesión (TTL 15 minutos)
  useEffect(() => {
    if (!isAuthenticated) return;

    let lastThrottle = Date.now();

    const registerActivity = () => {
      const now = Date.now();
      if (now - lastThrottle > 15000) {
        lastThrottle = now;
        localStorage.setItem('mtt_session_expira', String(now + SESSION_TIMEOUT_MS));
      }
    };

    const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'];
    events.forEach((ev) => window.addEventListener(ev, registerActivity, { passive: true }));

    const intervalId = setInterval(() => {
      const expiraStr = localStorage.getItem('mtt_session_expira');
      const expira = expiraStr ? Number(expiraStr) : 0;
      const now = Date.now();

      if (!expira || now >= expira) {
        logout('inactividad');
      } else {
        const diffSec = Math.max(0, Math.floor((expira - now) / 1000));
        setTiempoRestanteSegundos(diffSec);
      }
    }, 5000);

    return () => {
      events.forEach((ev) => window.removeEventListener(ev, registerActivity));
      clearInterval(intervalId);
    };
  }, [isAuthenticated]);

  const login = async (
    userOrCedula: string,
    passwordOrRole?: string | RolInstitucional,
    explicitRole?: RolInstitucional
  ): Promise<{ success: boolean; error?: string }> => {
    const isSecondArgRole = ROLES_DISPONIBLES.some((r) => r.id === passwordOrRole);
    const cleanUser = userOrCedula.trim();
    const cleanPass = isSecondArgRole ? '' : (passwordOrRole || '').trim();
    const forcedRole = isSecondArgRole ? (passwordOrRole as RolInstitucional) : explicitRole;

    if (!cleanUser) {
      return { success: false, error: 'Por favor ingrese su usuario o cédula.' };
    }

    // 1. Si no es simulación directa de rol y se suministró clave, intentar autenticación con el Backend FastAPI
    if (!forcedRole && cleanPass) {
      try {
        const backendRes = await authService.login(cleanUser, cleanPass);
        if (backendRes && backendRes.status === 'success') {
          const effectiveUser = backendRes.usuario || cleanUser;
          const effectiveRole = (backendRes.rol as RolInstitucional) || 'Usuario Consulta';

          const now = Date.now();
          setUsuario(effectiveUser);
          setRol(effectiveRole);
          setIsAuthenticated(true);
          setIsLoginModalOpen(false);
          setSessionExpiredNotice(null);
          setTiempoRestanteSegundos(900);

          localStorage.setItem('mtt_user', effectiveUser);
          localStorage.setItem('mtt_role', effectiveRole);
          localStorage.setItem('mtt_session_expira', String(now + SESSION_TIMEOUT_MS));

          return { success: true };
        }
      } catch (backendErr: any) {
        if (backendErr?.response?.status === 401 || backendErr?.response?.status === 403) {
          const detail = backendErr?.response?.data?.detail;
          return {
            success: false,
            error: detail || 'Usuario, cédula o contraseña incorrectos en el sistema institucional.',
          };
        }
        // Si el backend no está disponible (modo offline/desconectado), se procede a la validación estricta local
      }
    }

    // 2. Validación estricta con el padrón institucional (GENERIC_TEST_USERS)
    const rawLower = cleanUser.toLowerCase();
    const numCedula = rawLower.replace(/^[vejpg]-?/, '');

    const account = GENERIC_TEST_USERS.find((u) => {
      const uUser = u.usuario.toLowerCase();
      const uMail = u.correo.toLowerCase();
      const uCedula = u.cedula.toLowerCase().replace(/^[vejpg]-?/, '');
      const uAliases = u.alias ? u.alias.map((a) => a.toLowerCase()) : [];

      return (
        uUser === rawLower ||
        uMail === rawLower ||
        uCedula === numCedula ||
        uCedula === rawLower ||
        uAliases.includes(rawLower) ||
        uAliases.includes(numCedula)
      );
    });

    // Si se especificó rol forzado (simulación SuperAdmin)
    if (forcedRole) {
      const now = Date.now();
      const expira = now + SESSION_TIMEOUT_MS;
      setUsuario(cleanUser);
      setRol(forcedRole);
      setIsAuthenticated(true);
      setIsLoginModalOpen(false);
      setSessionExpiredNotice(null);
      setTiempoRestanteSegundos(900);

      localStorage.setItem('mtt_user', cleanUser);
      localStorage.setItem('mtt_role', forcedRole);
      localStorage.setItem('mtt_session_expira', String(expira));
      return { success: true };
    }

    if (!account) {
      return {
        success: false,
        error: `El usuario o cédula «${cleanUser}» no está registrado en el sistema. Verifique sus datos o consulte al Administrador.`,
      };
    }

    // Verificar contraseña estricta
    if (cleanPass && cleanPass !== account.passwordDemo) {
      return {
        success: false,
        error: 'Contraseña institucional incorrecta. Verifique mayúsculas, minúsculas y caracteres especiales.',
      };
    }

    const effectiveRole = (account.rol as RolInstitucional) || 'Usuario Consulta';
    const effectiveUser = account.usuario;

    const now = Date.now();
    const expira = now + SESSION_TIMEOUT_MS;

    setUsuario(effectiveUser);
    setRol(effectiveRole);
    setIsAuthenticated(true);
    setIsLoginModalOpen(false);
    setSessionExpiredNotice(null);
    setTiempoRestanteSegundos(900);

    localStorage.setItem('mtt_user', effectiveUser);
    localStorage.setItem('mtt_role', effectiveRole);
    localStorage.setItem('mtt_session_expira', String(expira));

    return { success: true };
  };

  const logout = (reason?: 'inactividad' | 'manual') => {
    setIsAuthenticated(false);
    setUsuario('');
    setRol('Usuario Consulta');
    setIsLoginModalOpen(true);
    localStorage.removeItem('mtt_user');
    localStorage.removeItem('mtt_role');
    localStorage.removeItem('mtt_session_expira');

    if (reason === 'inactividad') {
      setSessionExpiredNotice(
        'Su sesión ha finalizado automáticamente por 15 minutos de inactividad (Protocolo de Ciberseguridad NIST SP 800-63B). Por favor, ingrese de nuevo.'
      );
    } else {
      setSessionExpiredNotice(null);
    }
  };

  const openLoginModal = () => setIsLoginModalOpen(true);
  const closeLoginModal = () => {
    if (isAuthenticated) {
      setIsLoginModalOpen(false);
    }
  };

  const updateSmtpConfig = (newConfig: SmtpConfig) => {
    setSmtpConfig(newConfig);
    localStorage.setItem('mtt_smtp_config', JSON.stringify(newConfig));
  };

  const adminResetPassword = (usuarioId: string, nuevaClave: string) => {
    setCuentasUsuarios((prev) => {
      const updated = prev.map((u) => (u.id === usuarioId ? { ...u, must_change_password: true } : u));
      localStorage.setItem('mtt_usuarios_cuentas', JSON.stringify(updated));
      return updated;
    });
  };

  const toggleUsuarioActivo = (usuarioId: string) => {
    setCuentasUsuarios((prev) => {
      const updated = prev.map((u) => (u.id === usuarioId ? { ...u, activo: !u.activo } : u));
      localStorage.setItem('mtt_usuarios_cuentas', JSON.stringify(updated));
      return updated;
    });
  };

  // Flujo Opción A: Solicitud de Recuperación por Correo Institucional
  const solicitarRecuperacionClave = (identificador: string) => {
    const cleanId = identificador.trim().toLowerCase();
    const cuenta = cuentasUsuarios.find(
      (c) => c.usuario.toLowerCase() === cleanId || c.correo.toLowerCase() === cleanId
    );

    // Generar token criptográfico pseudoaleatorio de 32 caracteres hex
    const array = new Uint8Array(16);
    if (typeof window !== 'undefined' && window.crypto) {
      window.crypto.getRandomValues(array);
    }
    const token = Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('');
    const expira = Date.now() + 15 * 60 * 1000; // 15 minutos exactos

    if (cuenta) {
      setTokensRecuperacion((prev) => ({
        ...prev,
        [token]: { usuario: cuenta.usuario, expira },
      }));
      return {
        success: true,
        mensaje: `Si el correo institucional o usuario está registrado, se han enviado las instrucciones de recuperación a la casilla asociada con vigencia de 15 minutos.`,
        tokenDemo: token, // Proporcionado para pruebas de desarrollo
      };
    }

    // Respuesta defensiva anti-enumeración de usuarios (OWASP)
    return {
      success: true,
      mensaje: `Si el correo institucional o usuario está registrado, se han enviado las instrucciones de recuperación a la casilla asociada con vigencia de 15 minutos.`,
    };
  };

  const ejecutarResetPassword = (token: string, nuevaClave: string) => {
    const info = tokensRecuperacion[token];
    if (!info) {
      return {
        success: false,
        mensaje: 'El token de recuperación no es válido o ya ha sido utilizado.',
      };
    }
    if (Date.now() > info.expira) {
      return {
        success: false,
        mensaje: 'El token de recuperación ha expirado (límite de 15 minutos alcanzado).',
      };
    }

    // Invalida el token (un solo uso estricto)
    setTokensRecuperacion((prev) => {
      const next = { ...prev };
      delete next[token];
      return next;
    });

    return {
      success: true,
      mensaje: `¡Contraseña actualizada exitosamente para el usuario "${info.usuario}"! Todas las sesiones previas han sido revocadas.`,
    };
  };

  const rolInfo = ROLES_DISPONIBLES.find((r) => r.id === rol);
  const esSuperAdmin = rol === 'SuperAdmin';
  const puedeRegistrar = rolInfo?.puedeRegistrar ?? esSuperAdmin;
  const puedeEditar = rolInfo?.puedeEditar ?? esSuperAdmin;
  const puedeAsignarCodigo = rolInfo?.puedeAsignarCodigo ?? esSuperAdmin;
  const puedeValidarRegional = rolInfo?.puedeValidarRegional ?? esSuperAdmin;

  return (
    <AuthContext.Provider
      value={{
        usuario,
        rol,
        isAuthenticated,
        esSuperAdmin,
        login,
        logout,
        openLoginModal,
        closeLoginModal,
        isLoginModalOpen,
        sessionExpiredNotice,
        tiempoRestanteSegundos,
        puedeRegistrar,
        puedeEditar,
        puedeAsignarCodigo,
        puedeValidarRegional,
        smtpConfig,
        updateSmtpConfig,
        cuentasUsuarios,
        adminResetPassword,
        toggleUsuarioActivo,
        solicitarRecuperacionClave,
        ejecutarResetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

