/**
 * authService — All auth-related API calls.
 * In Demo Mode (VITE_DEMO_MODE=true) these return mock data without network calls.
 */
import apiClient from "./api/client";
import type { ApiResponse } from "@/types/common.types";
import type { User, AuthTokens, LoginCredentials, RegisterCredentials } from "@/features/auth/types";
import { DEMO_MODE, DEMO_DELAY } from "@/config/demo.config";
import { OFFICERS } from "@/data/officers.data";

const DEMO_USER: User = {
  id: "demo-1", email: "admin@sakshi.gov.in", name: "Admin User",
  role: "admin", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
};
const DEMO_TOKENS: AuthTokens = { accessToken: "demo-token-001", refreshToken: "demo-refresh-001" };

export const authService = {
  async login(credentials: LoginCredentials): Promise<ApiResponse<{ user: User; tokens: AuthTokens }>> {
    if (DEMO_MODE) {
      await DEMO_DELAY();
      const officer = OFFICERS.find(o => credentials.email.includes(o.department));
      const user: User = { ...DEMO_USER, email: credentials.email, name: officer?.name ?? "Admin User" };
      return { success: true, message: "Login successful", data: { user, tokens: DEMO_TOKENS } };
    }
    const res = await apiClient.post<ApiResponse<{ user: User; tokens: AuthTokens }>>("/auth/login", credentials);
    return res.data;
  },

  async logout(): Promise<void> {
    if (DEMO_MODE) { await DEMO_DELAY(300); return; }
    await apiClient.post("/auth/logout");
  },

  async me(): Promise<ApiResponse<User>> {
    if (DEMO_MODE) { await DEMO_DELAY(); return { success: true, message: "OK", data: DEMO_USER }; }
    const res = await apiClient.get<ApiResponse<User>>("/auth/me");
    return res.data;
  },

  async register(data: RegisterCredentials): Promise<ApiResponse<{ user: User; tokens: AuthTokens }>> {
    if (DEMO_MODE) { await DEMO_DELAY(); return { success: true, message: "Registered", data: { user: DEMO_USER, tokens: DEMO_TOKENS } }; }
    const res = await apiClient.post<ApiResponse<{ user: User; tokens: AuthTokens }>>("/auth/register", data);
    return res.data;
  },

  async forgotPassword(email: string): Promise<ApiResponse<void>> {
    if (DEMO_MODE) { await DEMO_DELAY(); return { success: true, message: "Reset email sent", data: undefined }; }
    const res = await apiClient.post<ApiResponse<void>>("/auth/forgot-password", { email });
    return res.data;
  },

  async refreshToken(refreshToken: string): Promise<ApiResponse<AuthTokens>> {
    const res = await apiClient.post<ApiResponse<AuthTokens>>("/auth/refresh", { refreshToken });
    return res.data;
  },
};
