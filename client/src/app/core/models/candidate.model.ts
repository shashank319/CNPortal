export interface Candidate {
  candidateId: number;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  clientName: string;
  status: string;
  skills?: string;
  experience?: number;
  resume?: string;
  notes?: string;
  hourlyRate?: number;
  createdAt: Date;
  updatedAt: Date;
}

export enum CandidateStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  INTERVIEWED = 'interviewed',
  HIRED = 'hired',
  REJECTED = 'rejected'
}

export interface CreateCandidateRequest {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  clientName: string;
  skills?: string;
  experience?: number;
  notes?: string;
  hourlyRate?: number;
}

export interface UpdateCandidateRequest extends Partial<CreateCandidateRequest> {
  id: number;
  status?: string;
}

export interface CreateCandidateResponse {
  candidateId: number;
  message: string;
}

export interface CandidateListResponse {
  items: Candidate[];
  page: number;
  pageSize: number;
  total: number;
}