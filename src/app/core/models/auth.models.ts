export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  userName: string;
  email: string;
  password: string;
  role: string;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: string;
}

export interface AuthResponse {
  data: AuthPayload;
}

export interface AuthPayload {
  accessToken: string;
  refreshToken: string;
  user: UserProfile;
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface ResetPasswordPayload {
  token: string;
  newPassword: string;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}
