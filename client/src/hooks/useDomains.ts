import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { domainService } from '../api/domainService';
import { useToast } from '../context/ToastContext';
import type { CreateDomainInput, UpdateDomainInput } from '../types/domain';

export const useDomains = (params?: { search?: string; page?: number; limit?: number }) => {
  return useQuery({
    queryKey: ['domains', params],
    queryFn: () => domainService.getDomains(params),
  });
};

export const useDomain = (id: number) => {
  return useQuery({
    queryKey: ['domains', id],
    queryFn: () => domainService.getDomainById(id),
    enabled: !!id,
  });
};

export const useCreateDomain = () => {
  const queryClient = useQueryClient();
  const toast = useToast();
  return useMutation({
    mutationFn: (data: CreateDomainInput) => domainService.createDomain(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['domains'] });
      toast.success('Домэйн амжилттай нэмэгдлээ');
    },
    onError: () => {
      toast.error('Домэйн нэмэхэд алдаа гарлаа');
    },
  });
};

export const useUpdateDomain = () => {
  const queryClient = useQueryClient();
  const toast = useToast();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateDomainInput }) =>
      domainService.updateDomain(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['domains'] });
      queryClient.invalidateQueries({ queryKey: ['domains', variables.id] });
      toast.success('Өөрчлөлт амжилттай хадгалагдлаа');
    },
    onError: () => {
      toast.error('Өөрчлөлт хадгалахад алдаа гарлаа');
    },
  });
};

export const useDeleteDomain = () => {
  const queryClient = useQueryClient();
  const toast = useToast();
  return useMutation({
    mutationFn: (id: number) => domainService.deleteDomain(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['domains'] });
      toast.success('Домэйн амжилттай устгагдлаа');
    },
    onError: () => {
      toast.error('Устгахад алдаа гарлаа');
    },
  });
};
