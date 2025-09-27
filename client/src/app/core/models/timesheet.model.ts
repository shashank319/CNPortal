export interface Timesheet {
  id: string;
  candidateId: string;
  candidateName: string;
  candidateEmail: string;
  employerId: string;
  month: string;
  year: number;
  hoursLogged: number;
  status: TimesheetStatus;
  submittedDate?: Date;
  approvedDate?: Date;
  rejectedDate?: Date;
  rejectionReason?: string;
  fileUrl?: string;
  fileName?: string;
  createdAt: Date;
  updatedAt: Date;
}

export enum TimesheetStatus {
  DRAFT = 'draft',
  SUBMITTED = 'submitted',
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected'
}

export interface TimesheetSummary {
  totalSubmitted: number;
  totalPending: number;
  totalApproved: number;
  totalRejected: number;
  totalHours: number;
  activeCandidates: number;
  totalCandidates: number;
  activeProjects: number;
  thisMonthHours: number;
  pendingReviews: number;
}

export interface UploadTimesheetRequest {
  candidateId: string;
  month: string;
  year: number;
  file: File;
}

export interface TimesheetFilter {
  month?: string;
  year?: number;
  status?: TimesheetStatus;
  candidateId?: string;
  page?: number;
  limit?: number;
}