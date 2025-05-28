/* eslint-disable no-useless-catch */
import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  ReactNode,
} from "react";
import authService from "@/services/authService";
import {
  UserResponse,
  LoginData,
  RegisterData,
  AuthContextType,
} from "@/types";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { API_URL } from "@/lib/constants";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<UserResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already logged in
    const checkAuthStatus = async () => {
      try {
        const currentUser = authService.getCurrentUser();
        if (currentUser) {
          setUser(currentUser);
        }
      } catch (err) {
        console.error("Auth check failed:", err);
        authService.logout();
      } finally {
        setLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  const login = async (data: LoginData) => {
    try {
      setLoading(true);
      setError(null);
      const response = await authService.login(data);
      setUser(response.user);
      navigate("/");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.response?.data?.message || "Login failed");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (data: RegisterData) => {
    try {
      setLoading(true);
      setError(null);
      await authService.register(data);
      // Automatically login after registration
      await login({ email: data.email, password: data.password });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.response?.data?.message || "Registration failed");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    navigate("/login");
  };

  const forgotPassword = async (email: string): Promise<void> => {
    try {
      await axios.post(`${API_URL}/api/auth/forgot-password`, { email });
    } catch (error) {
      throw error;
    }
  };

  const resetPassword = async (
    token: string,
    password: string
  ): Promise<void> => {
    try {
      await axios.post(`${API_URL}/api/auth/reset-password`, {
        token,
        password,
      });
    } catch (error) {
      throw error;
    }
  };

  const updateProfile = async (
    userData: Partial<UserResponse>
  ): Promise<void> => {
    try {
      const response = await axios.put(
        `${API_URL}/api/auth/profile`,
        userData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      const updatedUser = response.data;

      // Update localStorage
      localStorage.setItem("user", JSON.stringify(updatedUser));

      // Update state
      setUser(updatedUser);
    } catch (error) {
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        error,
        setError,
        forgotPassword,
        resetPassword,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
