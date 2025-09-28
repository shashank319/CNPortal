export interface User {
  id: string;
  employeeId: number;
  email: string;
  fullName: string;
  role: 'Emp' | 'Admin' | 'Manager' | 'Client';
  phoneNumber?: string;
  vendor?: string;
  clientManager?: string;
  department?: string;
  startDate?: Date;
  address?: Address;
  profilePicture?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface LoginResponse {
  employeeId: number;
  requirePasswordChange: boolean;
  token?: string;
  role?: string;
  message: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  fullName: string;
  role: 'Emp' | 'Admin' | 'Manager' | 'Client';
  phoneNumber?: string;
}

// Employee details response from API
export interface EmployeeDetails {
  employeeID: number;
  companyName: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  email: string;
  firstTimeFlag: boolean;
  status: string;
  identityID: number;
  vendorID?: number;
  identity: {
    identityID: number;
    role: string;
  };
  vendor?: {
    vendorID: number;
    vendorName: string;
    ratePerHour: number;
  };
}