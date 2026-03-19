import apiClient from './apiClient';
import type { Domain, DomainApiResponse, CreateDomainInput, UpdateDomainInput } from '../types/domain';

export const domainService = {
  getDomains: async (params?: { search?: string; page?: number; limit?: number }): Promise<DomainApiResponse> => {
    const res = await apiClient.get('/domains', { params });
    return res.data;
  },

  getDomainById: async (id: number): Promise<Domain> => {
    const res = await apiClient.get(`/domains/${id}`);
    return res.data;
  },

  createDomain: async (data: CreateDomainInput): Promise<Domain> => {
    const res = await apiClient.post('/domains', data);
    return res.data;
  },

  updateDomain: async (id: number, data: UpdateDomainInput): Promise<Domain> => {
    const res = await apiClient.put(`/domains/${id}`, data);
    return res.data;
  },

  deleteDomain: async (id: number): Promise<void> => {
    await apiClient.delete(`/domains/${id}`);
  },
};
