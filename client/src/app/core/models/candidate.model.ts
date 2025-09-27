export interface Candidate {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  clientName: string;
  employerId: string;
  status: CandidateStatus;
  skills?: string[];
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
  skills?: string[];
  experience?: number;
  notes?: string;
}

export interface UpdateCandidateRequest extends Partial<CreateCandidateRequest> {
  id: string;
  status?: CandidateStatus;
}