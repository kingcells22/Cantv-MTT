export const REGIONES = [
  'CAPITAL',
  'CENTRAL',
  'LLANOS',
  'GUAYANA',
  'LOS ANDES',
  'OCCIDENTE',
  'ORIENTE',
] as const;

export const TIPOS_MTT = [
  'URBANA',
  'RURAL',
  'MIXTA',
  'INDÍGENA',
] as const;

export const ESTATUS_MTT_LIST = [
  'ACTIVA',
  'INACTIVA',
  'CERRADA',
] as const;

export const MEDIOS_TRANSMISION = [
  'CABLE DE COBRE',
  'FIBRA ÓPTICA',
  'INALÁMBRICO',
  'RED HÍBRIDA',
  'NINGUNO',
] as const;

export const OTRAS_OPERADORAS_LIST = [
  'MOVILNET',
  'OPERADORA PRIVADA',
  'OPERADORA COMUNAL',
  'ZONA DE CONECTIVIDAD PLURAL',
] as const;

export const OPERADORAS_LIST = [
  'CANTV',
  'MOVILNET',
  'OPERADORA PRIVADA',
  'OPERADORA COMUNAL',
  'ZONA DE CONECTIVIDAD PLURAL',
] as const;

import nodosData from './nodos.json';
export const NOMBRES_NODOS: string[] = nodosData;

export const ELEMENTOS_RED = [
  'CENTRAL',
  'URL',
  'ODN',
  'NODO NGN',
  'ADS',
  'ANTENA SATELITAL',
  'NINGUNO',
] as const;

export const REDES_SOCIALES_LIST = [
  'FACEBOOK',
  'INSTAGRAM',
  'WHATSAPP',
  'TELEGRAM',
  'TIKTOK',
  'NINGUNA',
] as const;

export const SAC_CONECTADA_LIST = [
  'CANTV',
  'OTRA OPERADORA',
  'SIN CONEXIÓN',
] as const;

export const CEC_COMUNA_LIST = [
  'COMUNA',
  'CIRCUITO',
] as const;

export const ESTATUS_VOCERIAS_LIST = [
  'VIGENTE',
  'VENCIDA',
] as const;

export const ROLES_DISPONIBLES = [
  {
    id: 'Coordinador / Coordinadora',
    nombre: 'Coordinador / Promotor (Registro y Edición)',
    descripcion: 'Operativo Territorial - Carga de registros, edición territorial y anexar actas',
    nivel: 2,
    puedeRegistrar: true,
    puedeEditar: true,
    puedeAsignarCodigo: false,
    puedeValidarRegional: false,
  },
  {
    id: 'Gerente Regional',
    nombre: 'Gerente Regional (Validación / Devolución)',
    descripcion: 'Validación Estadal - Revisión preliminar de expedientes territoriales',
    nivel: 3,
    puedeRegistrar: false,
    puedeEditar: false,
    puedeAsignarCodigo: false,
    puedeValidarRegional: true,
  },
  {
    id: 'Consultor GDC',
    nombre: 'Consultor GDC (Asignación de Códigos)',
    descripcion: 'Nacional / Normativo - Validación final de acta contra INE y asignación de Código Oficial MTT',
    nivel: 4,
    puedeRegistrar: false,
    puedeEditar: false,
    puedeAsignarCodigo: true,
    puedeValidarRegional: false,
  },
  {
    id: 'Promotor / Promotora',
    nombre: 'Promotor / Promotora (Solo Lectura de Territorio)',
    descripcion: 'Operativo de Campo - Acompañamiento, consulta y visualización de fichas',
    nivel: 1,
    puedeRegistrar: false,
    puedeEditar: false,
    puedeAsignarCodigo: false,
    puedeValidarRegional: false,
  },
  {
    id: 'Consultor GPACyG',
    nombre: 'Consultor GPACyG (Auditoría y Planificación)',
    descripcion: 'Nacional / Normativo - Auditoría y control de gestión',
    nivel: 4,
    puedeRegistrar: false,
    puedeEditar: false,
    puedeAsignarCodigo: false,
    puedeValidarRegional: false,
  },
  {
    id: 'Gerente de Línea',
    nombre: 'Gerente de Línea (Analítico-Decisional)',
    descripcion: 'Visualización total, estadísticas ejecutivas y formulación de políticas',
    nivel: 5,
    puedeRegistrar: false,
    puedeEditar: false,
    puedeAsignarCodigo: false,
    puedeValidarRegional: false,
  },
  {
    id: 'Gerente General',
    nombre: 'Gerente General (Estratégico-Directivo)',
    descripcion: 'Direccionamiento estratégico, analítica decisional y supervisión general',
    nivel: 5,
    puedeRegistrar: false,
    puedeEditar: false,
    puedeAsignarCodigo: false,
    puedeValidarRegional: false,
  },
  {
    id: 'Usuario Consulta',
    nombre: 'Usuario de Consulta (Solo Lectura)',
    descripcion: 'Transparencia institucional, consulta pública y fichas informativas',
    nivel: 5,
    puedeRegistrar: false,
    puedeEditar: false,
    puedeAsignarCodigo: false,
    puedeValidarRegional: false,
    esSuperAdmin: false,
  },
  {
    id: 'SuperAdmin',
    nombre: 'Super Administrador (TI / Infraestructura)',
    descripcion: 'Control maestro de plataforma, configuración de pasarela SMTP y gestión de credenciales',
    nivel: 6,
    puedeRegistrar: true,
    puedeEditar: true,
    puedeAsignarCodigo: true,
    puedeValidarRegional: true,
    esSuperAdmin: true,
  },
] as const;

export interface TestUserAccount {
  usuario: string;
  nombre: string;
  correo: string;
  rol: (typeof ROLES_DISPONIBLES)[number]['id'];
  passwordDemo: string;
  descripcion: string;
}

export const GENERIC_TEST_USERS: TestUserAccount[] = [
  {
    usuario: 'superadmin',
    nombre: 'Anthony Domínguez (SuperAdmin)',
    correo: 'anthony.dominguez@cantv.com.ve',
    rol: 'SuperAdmin',
    passwordDemo: 'SuperAdmin.2026#CANTV!',
    descripcion: 'Control maestro de infraestructura, configuración de pasarela SMTP y reseteo de claves',
  },
  {
    usuario: 'test_promotor',
    nombre: 'Promotor Comunal de Campo',
    correo: 'promotor.campo@cantv.com.ve',
    rol: 'Promotor / Promotora',
    passwordDemo: 'Promotor.2026#C1!',
    descripcion: 'Nivel 1 - Solo lectura y acompañamiento territorial',
  },
  {
    usuario: 'test_coordinador',
    nombre: 'Coordinador Territorial GGFPP',
    correo: 'coordinador.ggfpp@cantv.com.ve',
    rol: 'Coordinador / Coordinadora',
    passwordDemo: 'Coord.2026#C2!',
    descripcion: 'Nivel 2 - Registro de nuevas MTT, actualización de vocerías y carga de actas',
  },
  {
    usuario: 'test_regional',
    nombre: 'Gerente Regional Estadal',
    correo: 'gerente.regional@cantv.com.ve',
    rol: 'Gerente Regional',
    passwordDemo: 'Regional.2026#C3!',
    descripcion: 'Nivel 3 - Bandeja de validación estadal y certificación de expedientes',
  },
  {
    usuario: 'test_gdc',
    nombre: 'Consultor GDC Nacional',
    correo: 'consultor.gdc@cantv.com.ve',
    rol: 'Consultor GDC',
    passwordDemo: 'Gdc.2026#C4!',
    descripcion: 'Nivel 4 - Asignación definitiva de código censal oficial MTT y QR institucional',
  },
  {
    usuario: 'test_gpacyg',
    nombre: 'Auditor Nacional GPACyG',
    correo: 'auditor.gpacyg@cantv.com.ve',
    rol: 'Consultor GPACyG',
    passwordDemo: 'Gpacyg.2026#C5!',
    descripcion: 'Nivel 4 - Auditoría nacional, control metodológico y trazabilidad',
  },
  {
    usuario: 'test_linea',
    nombre: 'Gerente de Línea Operativa',
    correo: 'gerente.linea@cantv.com.ve',
    rol: 'Gerente de Línea',
    passwordDemo: 'Linea.2026#C6!',
    descripcion: 'Nivel 5 - Analítica decisional y formulación de políticas comunitarias',
  },
  {
    usuario: 'test_general',
    nombre: 'Gerente General GGFPP',
    correo: 'gerente.general@cantv.com.ve',
    rol: 'Gerente General',
    passwordDemo: 'General.2026#C7!',
    descripcion: 'Nivel 5 - Tableros estratégicos y supervisión global de telecomunicaciones',
  },
  {
    usuario: 'test_consulta',
    nombre: 'Usuario de Consulta Pública',
    correo: 'consulta.publica@cantv.com.ve',
    rol: 'Usuario Consulta',
    passwordDemo: 'Consulta.2026#C8!',
    descripcion: 'Nivel 5 - Consulta de matriz, verificación de fichas PDF y escaneo de QR',
  },
];

