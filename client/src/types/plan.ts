export interface PlanItem {
  id: number;
  planId: number;
  title: string;
}

export interface Plan {
  id: number;
  moduleId: number;
  module?: { id: number; title: string; code: string };
  title: string;
  description?: string;
  credit: number;
  price: number;
  discount: number;
  isEnabled: boolean;
  allowedDomains?: string;
  createdAt: string;
  updatedAt: string;
  items: PlanItem[];
}

export interface PlanApiResponse {
  data: Plan[];
  total: number;
  page: number;
  limit: number;
}

export interface CreatePlanDto {
  moduleId: number;
  title: string;
  description?: string;
  credit: number;
  price: number;
  discount: number;
  isEnabled?: boolean;
  allowedDomains?: string;
  items?: string[];
}

export type UpdatePlanDto = Partial<CreatePlanDto>;
