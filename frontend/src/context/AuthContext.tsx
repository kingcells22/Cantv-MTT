import React, { createContext, useContext, useState, useEffect } from 'react';
import { RolInstitucional } from '../types/mtt';
import { ROLES_DISPONIBLES } from '../data/catalogos';

interface AuthContextType {
  usuario: string;
  rol: RolInstitucional;
  isAuthenticated: boolean;
  login: (user: string, role: RolInstitucional) => void;
  logout: () => void;
  openLoginModal: () => void;
  closeLoginModal: () => void;
  isLoginModalOpen: boolean;
  puedeRegistrar: boolean;
  puedeEditar: boolean;
  puedeAsignarCodigo: boolean;
  puedeValidarRegional: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [usuario, setUsuario] = useState<string>('miguel.salazar');
  const [rol, setRol] = useState<RolInstitucional>('Consultor GDC');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);

  useEffect(() => {
    const savedUser = localStorage.getItem('mtt_user');
    const savedRole = localStorage.getItem('mtt_role') as RolInstitucional;
    if (savedUser && savedRole) {
      setUsuario(savedUser);
      setRol(savedRole);
    }
  }, []);

  const login = (newUser: string, newRole: RolInstitucional) => {
    setUsuario(newUser || 'usuario.institucional');
    setRol(newRole);
    setIsAuthenticated(true);
    setIsLoginModalOpen(false);
    localStorage.setItem('mtt_user', newUser || 'usuario.institucional');
    localStorage.setItem('mtt_role', newRole);
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

  const rolInfo = ROLES_DISPONIBLES.find((r) => r.id === rol);
  const puedeRegistrar = rolInfo?.puedeRegistrar ?? false;
  const puedeEditar = rolInfo?.puedeEditar ?? false;
  const puedeAsignarCodigo = rolInfo?.puedeAsignarCodigo ?? false;
  const puedeValidarRegional = rolInfo?.puedeValidarRegional ?? false;

  return (
    <AuthContext.Provider
      value={{
        usuario,
        rol,
        isAuthenticated,
        login,
        logout,
        openLoginModal,
        closeLoginModal,
        isLoginModalOpen,
        puedeRegistrar,
        puedeEditar,
        puedeAsignarCodigo,
        puedeValidarRegional,
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

