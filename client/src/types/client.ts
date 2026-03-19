export type ClientStatus = 'active' | 'inactive';
export type ProductType = 'ecom' | 'deliverySystem';

export interface Client {
  id: string;
  name: string;
  regNumber?: string;
  phoneNumber: string;
  phoneNumber2?: string;
  email?: string;
  invoice: number;
  paymentDate: string;
  status: ClientStatus;
  domainId: number | null;
  domain?: { id: number; name: string } | null;
  notes?: string;
  productType?: ProductType;
  createdAt: string;
}

export interface ClientApiResponse {
  data: Client[];
  total: number;
  page: number;
  limit: number;
}

export interface CreateClientInput {
  name: string;
  regNumber?: string;
  phoneNumber: string;
  phoneNumber2?: string;
  email?: string;
  invoice: number;
  paymentDate: string;
  status: ClientStatus;
  domainId?: number | null;
  notes?: string;
  productType?: ProductType;
}
