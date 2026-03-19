export interface Domain {
  id: number;
  name: string;
  isEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DomainApiResponse {
  data: Domain[];
  total: number;
  page: number;
  limit: number;
}

export interface CreateDomainInput {
  name: string;
  isEnabled: boolean;
}

export interface UpdateDomainInput {
  name?: string;
  isEnabled?: boolean;
}
