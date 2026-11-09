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
  },
] as const;

