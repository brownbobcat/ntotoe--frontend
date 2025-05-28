export interface RegisterData {
  name: string;
  email: string;
  password: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface ResetPasswordData {
  token: string;
  newPassword: string;
}

export interface UserResponse {
  _id: string;
  name: string;
  email: string;
  role: string;
  organizations: string[];
}

export interface AuthResponse {
  user: UserResponse;
  token: string;
}

export interface AuthContextType {
  user: UserResponse | null;
  loading: boolean;
  login: (data: LoginData) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  error: string | null;
  setError: (error: string | null) => void;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, password: string) => Promise<void>;
  updateProfile: (userData: Partial<UserResponse>) => Promise<void>;
}
