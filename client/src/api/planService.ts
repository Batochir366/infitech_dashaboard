import apiClient from './apiClient';
import type { Plan, PlanApiResponse, CreatePlanDto, UpdatePlanDto } from '../types/plan';

export const planService = {
  getPlans: async (params?: { search?: string; moduleId?: number; page?: number; limit?: number }): Promise<PlanApiResponse> => {
    const res = await apiClient.get('/plans', { params });
    return res.data;
  },

  getPlanById: async (id: number): Promise<Plan> => {
    const res = await apiClient.get(`/plans/${id}`);
    return res.data;
  },

  createPlan: async (data: CreatePlanDto): Promise<Plan> => {
    const res = await apiClient.post('/plans', data);
    return res.data;
  },

  updatePlan: async (id: number, data: UpdatePlanDto): Promise<Plan> => {
    const res = await apiClient.put(`/plans/${id}`, data);
    return res.data;
  },

  deletePlan: async (id: number): Promise<void> => {
    await apiClient.delete(`/plans/${id}`);
  },
};
