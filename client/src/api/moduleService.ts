import apiClient from './apiClient';
import type { Module, ModuleDetail, ModuleApiResponse, CreateModuleDto, UpdateModuleDto } from '../types/module';

export const moduleService = {
  getModules: async (params?: { search?: string; page?: number; limit?: number }): Promise<ModuleApiResponse> => {
    const res = await apiClient.get('/modules', { params });
    return res.data;
  },

  getModuleById: async (id: number): Promise<ModuleDetail> => {
    const res = await apiClient.get(`/modules/${id}`);
    return res.data;
  },

  createModule: async (data: CreateModuleDto): Promise<Module> => {
    const res = await apiClient.post('/modules', data);
    return res.data;
  },

  updateModule: async (id: number, data: UpdateModuleDto): Promise<Module> => {
    const res = await apiClient.put(`/modules/${id}`, data);
    return res.data;
  },

  deleteModule: async (id: number): Promise<void> => {
    await apiClient.delete(`/modules/${id}`);
  },
};
