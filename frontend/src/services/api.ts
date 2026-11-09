import axios from 'axios';
import { MTTRecord } from '../types/mtt';

// Same-Origin API Client: proxied by Nginx to FastAPI in production
export const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

export interface BackendMTTCreate {
  parroquia_id: number;
  nombre: string;
  tipo?: string | null;
  fecha_creacion?: string | null;
  estatus?: string;
  tiene_georreferenciacion?: boolean;
  latitud?: number | null;
  longitud?: number | null;
  sector: string;
  comuna_nombre: string;
  comuna_codigo?: string | null;
  consejo_nombre: string;
  consejo_situr?: string | null;
  sac_vinculada?: boolean;
  sac_conectada?: string | null;
  num_comunas?: number | null;
  num_cc?: number | null;
  num_comites?: number | null;
  num_familias?: number | null;
  num_habitantes?: number | null;
  zona_cantv?: boolean;
  medio_transmision?: string | null;
  otras_operadoras?: string | null;
  elemento_red?: string | null;
  huella_gpon?: boolean;
  estatus_voceria?: string | null;
  total_mujeres: number;
  total_hombres: number;
  v1_nombre: string;
  v1_cedula?: string | null;
  v1_nacimiento?: string | null;
  v1_sexo?: string | null;
  v1_telefono: string;
  v2_nombre: string;
  v2_cedula?: string | null;
  v2_nacimiento?: string | null;
  v2_sexo?: string | null;
  v2_telefono: string;
  activador: string;
  fecha_visita?: string | null;
  observacion: string;
}

export const authService = {
  login: async (usuario: string, password: string) => {
    try {
      const response = await api.post('/login', { usuario, password });
      return response.data;
    } catch (error) {
      console.warn('Backend login endpoint unavailable or invalid credentials, fallback to client session');
      throw error;
    }
  },
};

export const catalogoService = {
  getEstados: async () => {
    const res = await api.get('/catalogos/estados');
    return res.data;
  },
  getMunicipios: async (estadoId: number) => {
    const res = await api.get(`/catalogos/municipios/${estadoId}`);
    return res.data;
  },
  getParroquias: async (municipioId: number) => {
    const res = await api.get(`/catalogos/parroquias/${municipioId}`);
    return res.data;
  },
};

export const mttService = {
  getAll: async (): Promise<MTTRecord[]> => {
    try {
      const response = await api.get('/mtt');
      // Normalize backend response to frontend MTTRecord schema
      if (Array.isArray(response.data)) {
        return response.data.map((item: any) => ({
          ...item,
          codigo_mtt: item.codigo_mtt || item.codigo || null,
          nombre_mtt: item.nombre_mtt || item.nombre || 'N/D',
          estatus_mtt: item.estatus_mtt || item.estatus || 'ACTIVA',
        }));
      }
      return response.data;
    } catch (error) {
      console.warn('API backend not available, running in offline/local storage mode');
      throw error;
    }
  },

  getById: async (id: string): Promise<MTTRecord> => {
    const response = await api.get(`/mtt/${id}`);
    return response.data;
  },

  create: async (data: Partial<MTTRecord>): Promise<any> => {
    // Map frontend MTTRecord to FastAPI MTTCreate contract
    let lat: number | null = null;
    let lng: number | null = null;
    if (data.coordenadas_decimales && data.coordenadas_decimales.includes(',')) {
      const parts = data.coordenadas_decimales.split(',');
      lat = parseFloat(parts[0].trim()) || null;
      lng = parseFloat(parts[1].trim()) || null;
    }

    const payload: BackendMTTCreate = {
      parroquia_id: Number(data.parroquia_id) || 1,
      nombre: data.nombre_mtt || 'N/D',
      tipo: data.tipo_mtt || null,
      fecha_creacion: data.fecha_creacion || null,
      estatus: data.estatus_mtt || 'Pendiente GDC',
      tiene_georreferenciacion: data.georreferenciacion === 'SI',
      latitud: lat,
      longitud: lng,
      sector: 'N/D',
      comuna_nombre: data.nombre_circuito_comunal || 'N/D',
      comuna_codigo: data.codigo_circuito_comunal || null,
      consejo_nombre: data.nombre_cc_referencia || 'N/D',
      consejo_situr: data.codigo_situr_cc || null,
      sac_vinculada: data.sac_vinculada === 'SI',
      sac_conectada: data.sac_conectada || null,
      num_comunas: 1,
      num_cc: data.num_cc || null,
      num_comites: data.num_comites_mtt || null,
      num_familias: data.num_familias || null,
      num_habitantes: data.num_habitantes || null,
      zona_cantv: data.zona_servida === 'SI',
      medio_transmision: data.medio_transmision || null,
      otras_operadoras: data.otras_operadoras || null,
      elemento_red: data.elemento_red || null,
      huella_gpon: data.mtt_en_huella_gpon === 'SI',
      estatus_voceria: data.estatus_vocerias || null,
      total_mujeres: data.voceros_mujeres || 0,
      total_hombres: data.voceros_hombres || 0,
      v1_nombre: data.v1_nombre_apellido || 'N/D',
      v1_cedula: data.v1_cedula ? String(data.v1_cedula) : null,
      v1_nacimiento: data.v1_fecha_nacimiento || null,
      v1_sexo: data.v1_sexo || null,
      v1_telefono: data.v1_telefono || 'N/D',
      v2_nombre: data.v2_nombre_apellido || 'N/D',
      v2_cedula: data.v2_cedula ? String(data.v2_cedula) : null,
      v2_nacimiento: data.v2_fecha_nacimiento || null,
      v2_sexo: data.v2_sexo || null,
      v2_telefono: data.v2_telefono || 'N/D',
      activador: data.activador_mtt || 'N/D',
      fecha_visita: data.fecha_ultima_visita || null,
      observacion: data.observacion || 'SIN OBSERVACIÓN',
    };

    const response = await api.post('/mtt', payload);
    return response.data;
  },

  update: async (id: string, data: Partial<MTTRecord>): Promise<MTTRecord> => {
    const response = await api.put(`/mtt/${id}`, data);
    return response.data;
  },

  assignCode: async (id: string, codigo_mtt: string): Promise<MTTRecord> => {
    const response = await api.patch(`/mtt/${id}/codigo`, {
      codigo: codigo_mtt,
      codigo_mtt: codigo_mtt,
      estatus: 'Activa',
    });
    return response.data;
  },
};
