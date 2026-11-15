import { z } from 'zod';

// Helper Regla 3: Texto Libre obligatorio N/D si viene vacío
export const textoLibreND = z
  .string()
  .nullish()
  .transform((val) => {
    if (!val || val.trim() === '') return 'N/D';
    return val.trim();
  })
  .default('N/D');

// Helper Regla 2: Numérico estricto NULL si no hay dato o viene vacío
export const numeroOpcionalNull = z
  .union([z.number(), z.string().trim()])
  .nullish()
  .transform((val) => {
    if (val === '' || val === null || val === undefined) return null;
    const num = Number(val);
    return isNaN(num) ? null : num;
  })
  .default(null);

// Helper Regla 1: Select / Enum opcional NULL si no se selecciona
export const selectOpcionalNull = z
  .string()
  .nullish()
  .transform((val) => {
    if (!val || val.trim() === '' || val === 'null') return null;
    return val.trim();
  })
  .default(null);

export const mttSchema = z.object({
  // BLOQUE 1: UBICACIÓN E IDENTIFICACIÓN (Cols A-R)
  codigo_mtt: selectOpcionalNull,
  codigo_ubigeo_base: selectOpcionalNull,
  correlativo_adicional: selectOpcionalNull,
  region: z.string({ required_error: 'La región es obligatoria' }).min(1, 'La región es obligatoria'),
  entidad_federal: z.string({ required_error: 'El estado es obligatorio' }).min(1, 'El estado o entidad federal es obligatorio'),
  municipio: z.string({ required_error: 'El municipio es obligatorio' }).min(1, 'El municipio es obligatorio'),
  parroquia: z.string({ required_error: 'La parroquia es obligatoria' }).min(1, 'La parroquia es obligatoria'),
  parroquia_id: selectOpcionalNull,
  codigo_circuito_comunal: selectOpcionalNull,
  nombre_circuito_comunal: textoLibreND,
  nombre_mtt: z.string({ required_error: 'El nombre de la MTT es obligatorio' }).trim().min(2, 'El nombre de la MTT es obligatorio'),
  tipo_mtt: z.enum(['URBANA', 'RURAL', 'MIXTA', 'INDÍGENA'], {
    required_error: 'El tipo de MTT es obligatorio',
  }),
  fecha_creacion: z.string({ required_error: 'La fecha de creación es obligatoria' }).min(1, 'La fecha de creación es obligatoria'),
  ano_creacion: numeroOpcionalNull,
  estatus_mtt: z.enum(['ACTIVA', 'INACTIVA', 'CERRADA']).default('ACTIVA'),
  fecha_cambio_estatus: selectOpcionalNull,
  georreferenciacion: z.enum(['SI', 'NO']).default('NO'),
  coordenadas_decimales: selectOpcionalNull,
  latitud: numeroOpcionalNull,
  longitud: numeroOpcionalNull,
  correo_mtt: textoLibreND,
  uso_redes_sociales: z.enum(['SI', 'NO']).default('NO'),
  red_social_mas_utilizada: selectOpcionalNull,
  red_x: selectOpcionalNull,
  red_instagram: selectOpcionalNull,
  red_facebook: selectOpcionalNull,
  red_tiktok: selectOpcionalNull,
  eje_territorial: selectOpcionalNull,

  // BLOQUE 2: ORGANIZACIÓN COMUNAL Y DEMOGRAFÍA (Cols S-AA)
  codigo_situr_cc: selectOpcionalNull,
  nombre_cc_referencia: textoLibreND,
  comuna_nombre: textoLibreND,
  codigo_situr_comuna: selectOpcionalNull,
  sac_vinculada: z.enum(['SI', 'NO']).default('NO'),
  sac_conectada: selectOpcionalNull,
  cec_comuna: selectOpcionalNull,
  num_cc: numeroOpcionalNull,
  num_comites_mtt: numeroOpcionalNull,
  comite_tecnologia: z.boolean().default(false),
  comite_medios: z.boolean().default(false),
  num_familias: numeroOpcionalNull,
  num_habitantes: numeroOpcionalNull,

  // BLOQUE 3: INFORMACIÓN TÉCNICA (Cols AB-AF)
  zona_servida: z.enum(['SI', 'NO']).default('SI'),
  medio_transmision: selectOpcionalNull,
  otras_operadoras: selectOpcionalNull,
  operadoras: selectOpcionalNull,
  elemento_red: selectOpcionalNull,
  mtt_en_huella_gpon: z.enum(['SI', 'NO']).default('NO'),
  central_cantv_cercana: selectOpcionalNull,
  nombre_nodo: selectOpcionalNull,

  // BLOQUE 4: VOCEROS Y VOCERAS (Cols AG-AT)
  estatus_vocerias: selectOpcionalNull,
  voceros_mujeres: numeroOpcionalNull,
  voceros_hombres: numeroOpcionalNull,
  total_voceros: numeroOpcionalNull,
  otras_mujeres: numeroOpcionalNull,
  otros_hombres: numeroOpcionalNull,
  v1_nombre_apellido: textoLibreND,
  v1_cedula: numeroOpcionalNull,
  v1_fecha_nacimiento: selectOpcionalNull,
  v1_sexo: selectOpcionalNull,
  v1_telefono: textoLibreND,
  v2_nombre_apellido: textoLibreND,
  v2_cedula: numeroOpcionalNull,
  v2_fecha_nacimiento: selectOpcionalNull,
  v2_sexo: selectOpcionalNull,
  v2_telefono: textoLibreND,

  // BLOQUE 5: CONTROL Y SEGUIMIENTO (Cols AU-AY)
  activador_mtt: textoLibreND,
  fecha_ultima_visita: selectOpcionalNull,
  observacion: z
    .string()
    .nullish()
    .transform((val) => {
      if (!val || val.trim() === '') return 'SIN OBSERVACIÓN';
      return val.trim();
    })
    .default('SIN OBSERVACIÓN'),
  verificado: z.enum(['SI', 'NO']).default('NO'),
  fecha_verificacion: selectOpcionalNull,

  // METADATOS
  acta_nombre: z.string().optional(),
});

export type MTTFormData = z.infer<typeof mttSchema>;

