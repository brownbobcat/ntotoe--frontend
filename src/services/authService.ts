import {
  RegisterData,
  UserResponse,
  LoginData,
  AuthResponse,
  ResetPasswordData,
} from "@/types";
import axios from "axios";

const API_URL =
  import.meta.env.VITE_API_URL + "/api/auth" || "http://localhost:3000";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const authService = {
  register: async (data: RegisterData): Promise<UserResponse> => {
    const response = await api.post("/register", data);
    return response.data;
  },

  login: async (data: LoginData): Promise<AuthResponse> => {
    const response = await api.post("/login", data);
    localStorage.setItem("token", response.data.token);
    localStorage.setItem("user", JSON.stringify(response.data.user));
    return response.data;
  },

  logout: (): void => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  },

  forgotPassword: async (email: string): Promise<{ message: string }> => {
    const response = await api.post("/forgot-password", { email });
    return response.data;
  },

  validateResetToken: async (
    token: string
  ): Promise<{ valid: boolean; message: string }> => {
    const response = await api.get(`/validate-reset-token/${token}`);
    return response.data;
  },

  resetPassword: async (data: ResetPasswordData): Promise<AuthResponse> => {
    const response = await api.post("/reset-password", data);
    localStorage.setItem("token", response.data.token);
    localStorage.setItem("user", JSON.stringify(response.data.user));
    return response.data;
  },

  getCurrentUser: (): UserResponse | null => {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  },

  isAuthenticated: (): boolean => {
    return !!localStorage.getItem("token");
  },
};

export default authService;
