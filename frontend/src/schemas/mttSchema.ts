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
  region: z.string().min(1, 'La región es requerida'),
  entidad_federal: z.string().min(1, 'El estado es requerido'),
  municipio: z.string().min(1, 'El municipio es requerido'),
  parroquia: z.string().min(1, 'La parroquia es requerida'),
  parroquia_id: selectOpcionalNull,
  codigo_circuito_comunal: selectOpcionalNull,
  nombre_circuito_comunal: textoLibreND,
  nombre_mtt: z.string().min(2, 'El nombre de la MTT es requerido').trim(),
  tipo_mtt: z.enum(['URBANA', 'RURAL', 'MIXTA', 'INDÍGENA'], {
    required_error: 'Seleccione el tipo de MTT',
  }),
  fecha_creacion: selectOpcionalNull,
  ano_creacion: numeroOpcionalNull,
  estatus_mtt: z.enum(['ACTIVA', 'INACTIVA', 'CERRADA']).default('ACTIVA'),
  fecha_cambio_estatus: selectOpcionalNull,
  georreferenciacion: z.enum(['SI', 'NO']).default('NO'),
  coordenadas_decimales: selectOpcionalNull,
  correo_mtt: textoLibreND,
  uso_redes_sociales: z.enum(['SI', 'NO']).default('NO'),
  red_social_mas_utilizada: selectOpcionalNull,

  // BLOQUE 2: ORGANIZACIÓN COMUNAL Y DEMOGRAFÍA (Cols S-AA)
  codigo_situr_cc: selectOpcionalNull,
  nombre_cc_referencia: textoLibreND,
  sac_vinculada: z.enum(['SI', 'NO']).default('NO'),
  sac_conectada: selectOpcionalNull,
  cec_comuna: selectOpcionalNull,
  num_cc: numeroOpcionalNull,
  num_comites_mtt: numeroOpcionalNull,
  num_familias: numeroOpcionalNull,
  num_habitantes: numeroOpcionalNull,

  // BLOQUE 3: INFORMACIÓN TÉCNICA (Cols AB-AF)
  zona_servida: z.enum(['SI', 'NO']).default('SI'),
  medio_transmision: selectOpcionalNull,
  otras_operadoras: selectOpcionalNull,
  elemento_red: selectOpcionalNull,
  mtt_en_huella_gpon: z.enum(['SI', 'NO']).default('NO'),

  // BLOQUE 4: VOCEROS Y VOCERAS (Cols AG-AT)
  estatus_vocerias: selectOpcionalNull,
  voceros_mujeres: numeroOpcionalNull,
  voceros_hombres: numeroOpcionalNull,
  total_voceros: numeroOpcionalNull,
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

