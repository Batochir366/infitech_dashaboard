import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { moduleService } from '../api/moduleService';
import { useToast } from '../context/ToastContext';
import type { CreateModuleDto, UpdateModuleDto } from '../types/module';
export type { ModuleDetail } from '../types/module';

export const useModules = (params?: { search?: string; page?: number; limit?: number }) => {
  return useQuery({
    queryKey: ['modules', params],
    queryFn: () => moduleService.getModules(params),
  });
};

export const useModule = (id: number) => {
  return useQuery({
    queryKey: ['modules', id],
    queryFn: () => moduleService.getModuleById(id),
    enabled: !!id,
  });
};

export const useCreateModule = () => {
  const queryClient = useQueryClient();
  const toast = useToast();
  return useMutation({
    mutationFn: (data: CreateModuleDto) => moduleService.createModule(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['modules'] });
      toast.success('Модуль амжилттай нэмэгдлээ');
    },
    onError: () => {
      toast.error('Модуль нэмэхэд алдаа гарлаа');
    },
  });
};

export const useUpdateModule = () => {
  const queryClient = useQueryClient();
  const toast = useToast();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateModuleDto }) =>
      moduleService.updateModule(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['modules'] });
      queryClient.invalidateQueries({ queryKey: ['modules', variables.id] });
      toast.success('Өөрчлөлт амжилттай хадгалагдлаа');
    },
    onError: () => {
      toast.error('Өөрчлөлт хадгалахад алдаа гарлаа');
    },
  });
};

export const useDeleteModule = () => {
  const queryClient = useQueryClient();
  const toast = useToast();
  return useMutation({
    mutationFn: (id: number) => moduleService.deleteModule(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['modules'] });
      toast.success('Модуль амжилттай устгагдлаа');
    },
    onError: () => {
      toast.error('Устгахад алдаа гарлаа');
    },
  });
};
