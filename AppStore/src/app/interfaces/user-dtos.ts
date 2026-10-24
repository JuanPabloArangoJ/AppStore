export interface CreateUserRequest {
  fullName: string;
  email: string;
  type: string;
  password?: string;
}

export interface UpdateUserRequest {
  userId: number;
  fullName: string;
  email: string;
  type: string;
  resetPassword: boolean;
}

export interface ChangePasswordRequest {
  userId: number;
  newPassword: string;
}

export interface LoginUserRequest {
  email: string;
  password: string;
}

export interface RegisterUserRequest {
  fullName: string;
  email: string;
  password: string;
}

export interface GetUserResponse {
  userId: number;
  fullName: string;
  email: string;
  type: string;
  resetPassword: boolean;
}

export interface MessageResponse {
  message: string;
}