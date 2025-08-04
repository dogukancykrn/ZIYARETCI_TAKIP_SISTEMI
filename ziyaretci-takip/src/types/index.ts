// User Types
export interface Admin {
  id: string;
  fullName: string;
  phoneNumber: string;
  email: string;
  role: 'Admin';
}

export interface Visitor {
  id: string;
  fullName: string;
  tcNumber: string;
  visitReason: string;
  enteredAt: Date;
  exitedAt?: Date;
}

// Form Types
export interface LoginFormData {
  email: string;
  password: string;
}

export interface VisitorFormData {
  fullName: string;
  tcNumber: string;
  visitReason: string;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface AuthResponse {
  token: string;
  admin: Admin;
}

// Filter Types
export interface VisitorFilter {
  fullName?: string;
  tcNumber?: string;
  startDate?: Date;
  endDate?: Date;
  visitReason?: string;
}

// Table Column Types for Antd
export interface VisitorTableData extends Visitor {
  key: string;
}
