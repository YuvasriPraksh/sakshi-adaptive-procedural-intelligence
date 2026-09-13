import { apiClient } from "@/services/api";
import type { ApiResponse } from "@/types";
import type { AuthTokens, LoginCredentials, RegisterCredentials, User } from "../types";

export const authService = {
  login: (credentials: LoginCredentials) =>
    apiClient.post<ApiResponse<AuthTokens>>("/auth/login", credentials),

  register: (credentials: RegisterCredentials) =>
    apiClient.post<ApiResponse<AuthTokens>>("/auth/register", credentials),

  logout: () => apiClient.post<ApiResponse<void>>("/auth/logout"),

  refreshToken: (refreshToken: string) =>
    apiClient.post<ApiResponse<AuthTokens>>("/auth/refresh", { refreshToken }),

  me: () => apiClient.get<ApiResponse<User>>("/auth/me"),

  forgotPassword: (email: string) =>
    apiClient.post<ApiResponse<void>>("/auth/forgot-password", { email }),

  resetPassword: (token: string, password: string) =>
    apiClient.post<ApiResponse<void>>("/auth/reset-password", { token, password }),
};
