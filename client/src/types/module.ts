import type { Plan } from './plan';

export interface Module {
  id: number;
  title: string;
  code: string;
  isEnabled: boolean;
  createdAt: string;
  updatedAt: string;
  plans?: { id: number }[];
}

export interface ModuleDetail extends Omit<Module, 'plans'> {
  plans: Plan[];
}

export interface ModuleApiResponse {
  data: Module[];
  total: number;
  page: number;
  limit: number;
}

export interface CreateModuleDto {
  title: string;
  code: string;
  isEnabled?: boolean;
}

export type UpdateModuleDto = Partial<CreateModuleDto>;
