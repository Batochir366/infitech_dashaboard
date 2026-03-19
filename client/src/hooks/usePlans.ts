import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { planService } from '../api/planService';
import { useToast } from '../context/ToastContext';
import type { CreatePlanDto, UpdatePlanDto } from '../types/plan';

export const usePlans = (params?: { search?: string; moduleId?: number; page?: number; limit?: number }) => {
  return useQuery({
    queryKey: ['plans', params],
    queryFn: () => planService.getPlans(params),
  });
};

export const usePlan = (id: number) => {
  return useQuery({
    queryKey: ['plans', id],
    queryFn: () => planService.getPlanById(id),
    enabled: !!id,
  });
};

export const useCreatePlan = () => {
  const queryClient = useQueryClient();
  const toast = useToast();
  return useMutation({
    mutationFn: (data: CreatePlanDto) => planService.createPlan(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plans'] });
      toast.success('Тариф амжилттай нэмэгдлээ');
    },
    onError: () => {
      toast.error('Тариф нэмэхэд алдаа гарлаа');
    },
  });
};

export const useUpdatePlan = () => {
  const queryClient = useQueryClient();
  const toast = useToast();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdatePlanDto }) =>
      planService.updatePlan(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['plans'] });
      queryClient.invalidateQueries({ queryKey: ['plans', variables.id] });
      toast.success('Өөрчлөлт амжилттай хадгалагдлаа');
    },
    onError: () => {
      toast.error('Өөрчлөлт хадгалахад алдаа гарлаа');
    },
  });
};

export const useDeletePlan = () => {
  const queryClient = useQueryClient();
  const toast = useToast();
  return useMutation({
    mutationFn: (id: number) => planService.deletePlan(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plans'] });
      toast.success('Тариф амжилттай устгагдлаа');
    },
    onError: () => {
      toast.error('Устгахад алдаа гарлаа');
    },
  });
};
