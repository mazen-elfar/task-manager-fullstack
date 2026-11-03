export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  user: User;
  token?: string;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Array<{ field: string; message: string }>;
}
