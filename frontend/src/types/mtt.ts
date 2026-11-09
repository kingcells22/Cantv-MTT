export type RolInstitucional =
  | 'Promotor / Promotora'
  | 'Coordinador / Coordinadora'
  | 'Gerente Regional'
  | 'Consultor GDC'
  | 'Consultor GPACyG'
  | 'Gerente de Línea'
  | 'Gerente General'
  | 'Usuario Consulta';

export type EstatusMTT = 'ACTIVA' | 'INACTIVA' | 'CERRADA';
export type TipoMTT = 'URBANA' | 'RURAL' | 'MIXTA' | 'INDÍGENA';
export type SiNo = 'SI' | 'NO';
export type EstatusVocerias = 'VIGENTE' | 'VENCIDA';
export type Sexo = 'MUJER' | 'HOMBRE';

export interface MTTRecord {
  id?: string;
  // BLOQUE 1: UBICACIÓN E IDENTIFICACIÓN (Cols A-R)
  codigo_mtt: string | null; // Col A
  region: string; // Col B
  entidad_federal: string; // Col C
  municipio: string; // Col D
  parroquia: string; // Col E
  parroquia_id?: string | null;
  codigo_circuito_comunal: string | null; // Col F
  nombre_circuito_comunal: string; // Col G (Regla 3: N/D)
  nombre_mtt: string; // Col H
  tipo_mtt: TipoMTT; // Col I
  fecha_creacion: string | null; // Col J
  ano_creacion: number | null; // Col K (Regla 4: fórmula)
  estatus_mtt: EstatusMTT; // Col L
  fecha_cambio_estatus: string | null; // Col M
  georreferenciacion: SiNo; // Col N
  coordenadas_decimales: string | null; // Col O
  correo_mtt: string; // Col P (Regla 3: N/D)
  uso_redes_sociales: SiNo; // Col Q
  red_social_mas_utilizada: string | null; // Col R

  // BLOQUE 2: ORGANIZACIÓN COMUNAL Y DEMOGRAFÍA (Cols S-AA)
  codigo_situr_cc: string | null; // Col S
  nombre_cc_referencia: string; // Col T (Regla 3: N/D)
  sac_vinculada: SiNo; // Col U
  sac_conectada: 'CANTV' | 'OTRA OPERADORA' | 'SIN CONEXIÓN' | null; // Col V
  cec_comuna: 'COMUNA' | 'CIRCUITO' | null; // Col W
  num_cc: number | null; // Col X
  num_comites_mtt: number | null; // Col Y
  num_familias: number | null; // Col Z
  num_habitantes: number | null; // Col AA

  // BLOQUE 3: INFORMACIÓN TÉCNICA (Cols AB-AF)
  zona_servida: SiNo; // Col AB
  medio_transmision: string | null; // Col AC
  otras_operadoras: string | null; // Col AD
  elemento_red: string | null; // Col AE
  mtt_en_huella_gpon: SiNo; // Col AF

  // BLOQUE 4: VOCEROS Y VOCERAS (Cols AG-AT)
  estatus_vocerias: EstatusVocerias | null; // Col AG
  voceros_mujeres: number | null; // Col AH
  voceros_hombres: number | null; // Col AI
  total_voceros: number | null; // Col AJ (Regla 4: fórmula)
  v1_nombre_apellido: string; // Col AK (Regla 3: N/D)
  v1_cedula: number | null; // Col AL
  v1_fecha_nacimiento: string | null; // Col AM
  v1_sexo: Sexo | null; // Col AN
  v1_telefono: string; // Col AO (Regla 3: N/D)
  v2_nombre_apellido: string; // Col AP (Regla 3: N/D)
  v2_cedula: number | null; // Col AQ
  v2_fecha_nacimiento: string | null; // Col AR
  v2_sexo: Sexo | null; // Col AS
  v2_telefono: string; // Col AT (Regla 3: N/D)

  // BLOQUE 5: CONTROL Y SEGUIMIENTO (Cols AU-AY)
  activador_mtt: string; // Col AU (Regla 3: N/D)
  fecha_ultima_visita: string | null; // Col AV
  observacion: string; // Col AW (Regla 4: SIN OBSERVACIÓN)
  verificado: SiNo; // Col AX
  fecha_verificacion: string | null; // Col AY

  // METADATOS OPERACIONALES DE CONTROL
  expediente_num?: string;
  acta_url?: string;
  acta_nombre?: string;
  estatus_validacion?: 'BORRADOR' | 'ENVIADO_REGIONAL' | 'VALIDADO_REGIONAL' | 'DEVUELTO' | 'APROBADO_GDC';
  motivo_devolucion?: string;
}

export type ViewType =
  | 'dashboardView'
  | 'registryView'
  | 'updateView'
  | 'gdcView'
  | 'regionalView'
  | 'databaseView';

