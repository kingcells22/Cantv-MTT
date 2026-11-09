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

export const mttService = {
  getAll: async (): Promise<MTTRecord[]> => {
    try {
      const response = await api.get('/mtt');
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

  create: async (data: Partial<MTTRecord>): Promise<MTTRecord> => {
    const response = await api.post('/mtt', data);
    return response.data;
  },

  update: async (id: string, data: Partial<MTTRecord>): Promise<MTTRecord> => {
    const response = await api.put(`/mtt/${id}`, data);
    return response.data;
  },

  assignCode: async (id: string, codigo_mtt: string): Promise<MTTRecord> => {
    const response = await api.patch(`/mtt/${id}/codigo`, { codigo_mtt });
    return response.data;
  },
};

