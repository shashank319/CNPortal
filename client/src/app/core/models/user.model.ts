export interface User {
  id: string;
  email: string;
  fullName: string;
  role: 'employer' | 'employee';
  phoneNumber?: string;
  employeeId?: string;
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
  user: User;
  token: string;
  refreshToken: string;
  expiresIn: number;
}

export interface RegisterRequest {
  email: string;
  password: string;
  fullName: string;
  role: 'employer' | 'employee';
  phoneNumber?: string;
}