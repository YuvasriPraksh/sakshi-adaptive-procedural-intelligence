import type { ID, Timestamp } from "@/types";

export type UserRole = "admin" | "supervisor" | "police" | "hospital" | "fsl" | "cwc" | "citizen" | "viewer";

export interface User {
  id:         ID;
  email:      string;
  name:       string;
  avatarUrl?: string;
  role:       UserRole;
  createdAt:  Timestamp;
  updatedAt:  Timestamp;
}

export interface AuthState {
  user:            User | null;
  accessToken:     string | null;
  isAuthenticated: boolean;
  isLoading:       boolean;
}

export interface LoginCredentials    { email: string; password: string; }
export interface RegisterCredentials { name: string; email: string; password: string; }
export interface AuthTokens          { accessToken: string; refreshToken: string; }
