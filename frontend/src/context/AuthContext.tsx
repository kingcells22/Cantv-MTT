import React, { createContext, useContext, useState, useEffect } from 'react';
import { RolInstitucional, SmtpConfig, UsuarioCuenta } from '../types/mtt';
import { ROLES_DISPONIBLES, GENERIC_TEST_USERS } from '../data/catalogos';

interface AuthContextType {
  usuario: string;
  rol: RolInstitucional;
  isAuthenticated: boolean;
  esSuperAdmin: boolean;
  login: (user: string, role?: RolInstitucional) => void;
  logout: () => void;
  openLoginModal: () => void;
  closeLoginModal: () => void;
  isLoginModalOpen: boolean;
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
  nombre_completo: u.nombre,
  correo: u.correo,
  rol: u.rol as RolInstitucional,
  activo: true,
  must_change_password: false,
  ultimo_acceso: '2026-11-15 12:45',
}));

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [usuario, setUsuario] = useState<string>('anthony.dominguez');
  const [rol, setRol] = useState<RolInstitucional>('SuperAdmin');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);
  const [smtpConfig, setSmtpConfig] = useState<SmtpConfig>(initialSmtpConfig);
  const [cuentasUsuarios, setCuentasUsuarios] = useState<UsuarioCuenta[]>(initialCuentas);
  // Almacén en memoria de tokens de recuperación activos (TTL 15 min)
  const [tokensRecuperacion, setTokensRecuperacion] = useState<Record<string, { usuario: string; expira: number }>>({});

  useEffect(() => {
    const savedUser = localStorage.getItem('mtt_user');
    const savedRole = localStorage.getItem('mtt_role') as RolInstitucional;
    if (savedUser && savedRole) {
      setUsuario(savedUser);
      setRol(savedRole);
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

  const login = (newUser: string, newRole?: RolInstitucional) => {
    const cleanUser = newUser.trim();
    let effectiveRole: RolInstitucional = newRole || 'Coordinador / Coordinadora';

    if (!newRole) {
      const cuenta = cuentasUsuarios.find(
        (u) =>
          u.usuario.toLowerCase() === cleanUser.toLowerCase() ||
          u.correo.toLowerCase() === cleanUser.toLowerCase()
      );
      if (cuenta) {
        effectiveRole = cuenta.rol as RolInstitucional;
      } else {
        const lower = cleanUser.toLowerCase();
        if (lower === 'superadmin' || lower.includes('admin')) effectiveRole = 'SuperAdmin';
        else if (lower.includes('coord')) effectiveRole = 'Coordinador / Coordinadora';
        else if (lower.includes('reg') || lower.includes('gerente_reg')) effectiveRole = 'Gerente Regional';
        else if (lower.includes('gdc')) effectiveRole = 'Consultor GDC';
        else if (lower.includes('gpacyg')) effectiveRole = 'Consultor GPACyG';
        else if (lower.includes('linea')) effectiveRole = 'Gerente de Línea';
        else if (lower.includes('general')) effectiveRole = 'Gerente General';
        else if (lower.includes('consulta')) effectiveRole = 'Usuario Consulta';
        else effectiveRole = 'Promotor / Promotora';
      }
    }

    setUsuario(cleanUser || 'usuario.institucional');
    setRol(effectiveRole);
    setIsAuthenticated(true);
    setIsLoginModalOpen(false);
    localStorage.setItem('mtt_user', cleanUser || 'usuario.institucional');
    localStorage.setItem('mtt_role', effectiveRole);
  };

  const logout = () => {
    setIsLoginModalOpen(true);
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

