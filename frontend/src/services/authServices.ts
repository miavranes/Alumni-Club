import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from "axios";

const API_URL = `${import.meta.env.VITE_API_URL}/api`; // backend base URL

// Type definitions
interface User {
  id: string | number;
  username: string;
  email: string;
  ime?: string;
  prezime?: string;
  role?: string;
  [key: string]: any; // Allow additional properties
}

interface RegisterData {
  username: string;
  email: string;
  password: string;
  ime?: string;
  prezime?: string;
  [key: string]: any;
}

interface LoginResponse {
  token: string;
  user: User;
}

interface ResetCheckResponse {
  message: string;
  userId?: string | number;
}

interface ResetConfirmResponse {
  message: string;
}

interface ErrorResponse {
  error?: string;
  message?: string;
}

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: API_URL,
});

// Add token to requests automatically
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem("token");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

class AuthService {
  // Register new user
  async register(userData: RegisterData): Promise<any> {
    try {
      // Adjust endpoint if your backend uses something different
      const response = await api.post("/auth/register", userData);
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      throw new Error(
        axiosError.response?.data?.error ||
          axiosError.response?.data?.message ||
          "Registracija nije uspjela"
      );
    }
  }

  // Login user
  async login(username: string, password: string): Promise<LoginResponse> {
    try {
      const response = await api.post<LoginResponse>("/auth/login", {
        username,
        password,
      });
      const { token, user } = response.data;

      if (token) {
        localStorage.setItem("token", token);
      }
      if (user) {
        localStorage.setItem("user", JSON.stringify(user));
      }

      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      throw new Error(
        axiosError.response?.data?.error ||
          axiosError.response?.data?.message ||
          "Prijava nije uspjela"
      );
    }
  }

  // Logout user
  logout(): void {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  }

  // Get current user object
  getCurrentUser(): User | null {
    const userStr = localStorage.getItem("user");
    if (!userStr) return null;

    try {
      return JSON.parse(userStr) as User;
    } catch {
      return null;
    }
  }

  // Get raw token
  getToken(): string | null {
    return localStorage.getItem("token");
  }

  // Is user authenticated
  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  // Update user profile
  async updateProfile(userId: string | number, userData: Partial<User>): Promise<any> {
    try {
      const response = await api.put(`/users/${userId}`, userData);
      // Optionally refresh local user if backend returns it
      if (response.data && typeof response.data === "object") {
        const currentUser = this.getCurrentUser();
        if (currentUser && currentUser.id === userId) {
          localStorage.setItem(
            "user",
            JSON.stringify({ ...currentUser, ...response.data })
          );
        }
      }
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      throw new Error(
        axiosError.response?.data?.error ||
          axiosError.response?.data?.message ||
          "Ažuriranje profila nije uspjelo"
      );
    }
  }

  // STEP 1: check username + email for password reset
  async resetCheck(username: string, email: string): Promise<ResetCheckResponse> {
    try {
      const response = await api.post<ResetCheckResponse>("/auth/reset-check", {
        username,
        email,
      });
      return response.data; // { message, userId? }
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      throw new Error(
        axiosError.response?.data?.message ||
          axiosError.response?.data?.error ||
          "Provjera podataka nije uspjela"
      );
    }
  }

  // STEP 2: confirm new password
  async resetConfirm(
    username: string,
    email: string,
    newPassword: string
  ): Promise<ResetConfirmResponse> {
    try {
      const response = await api.post<ResetConfirmResponse>("/auth/reset-confirm", {
        username,
        email,
        newPassword,
      });
      return response.data; // { message }
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      throw new Error(
        axiosError.response?.data?.message ||
          axiosError.response?.data?.error ||
          "Promjena šifre nije uspjela"
      );
    }
  }
}

export default new AuthService();
