/**
 * authService — All auth-related API calls.
 * Phase 2B: DEMO_MODE removed. Routes directly to FastAPI /auth/* endpoints.
 */
import apiClient from "./api/client";
import type { ApiResponse } from "@/types/common.types";
import type { User, AuthTokens, LoginCredentials, RegisterCredentials } from "@/features/auth/types";

export const authService = {
  async login(credentials: LoginCredentials): Promise<ApiResponse<{ user: User; tokens: AuthTokens }>> {
    const res = await apiClient.post<ApiResponse<{ user: User; tokens: AuthTokens }>>("/auth/login", credentials);
    return res.data;
  },

  async logout(): Promise<void> {
    await apiClient.post("/auth/logout");
  },

  async me(): Promise<ApiResponse<User>> {
    const res = await apiClient.get<ApiResponse<User>>("/auth/me");
    return res.data;
  },

  async register(data: RegisterCredentials): Promise<ApiResponse<{ user: User; tokens: AuthTokens }>> {
    const res = await apiClient.post<ApiResponse<{ user: User; tokens: AuthTokens }>>("/auth/register", data);
    return res.data;
  },

  async forgotPassword(email: string): Promise<ApiResponse<void>> {
    const res = await apiClient.post<ApiResponse<void>>("/auth/forgot-password", { email });
    return res.data;
  },

  async refreshToken(refreshToken: string): Promise<ApiResponse<AuthTokens>> {
    const res = await apiClient.post<ApiResponse<AuthTokens>>("/auth/refresh", { refreshToken });
    return res.data;
  },
};
