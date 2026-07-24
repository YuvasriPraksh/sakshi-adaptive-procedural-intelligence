import axios, {
  type AxiosInstance,
  type InternalAxiosRequestConfig,
  type AxiosResponse,
  type AxiosError,
} from "axios";
import { APP_CONFIG } from "@/config/app.config";
import { storage } from "@/utils/storage";
import { STORAGE_KEYS } from "@/constants/app.constants";

// ─── Axios instance ────────────────────────────────────────────────────────────
const apiClient: AxiosInstance = axios.create({
  baseURL: APP_CONFIG.api.baseUrl,
  timeout: APP_CONFIG.api.timeout,
  headers: {
    "Content-Type": "application/json",
    Accept:         "application/json",
    "X-App-Version": APP_CONFIG.version,
  },
});

// ─── Request interceptor ───────────────────────────────────────────────────────
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = storage.get<string>(STORAGE_KEYS.ACCESS_TOKEN, "");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // Add request timestamp for debugging
    (config as InternalAxiosRequestConfig & { _startTime?: number })._startTime = Date.now();
    return config;
  },
  (error: AxiosError) => Promise.reject(error),
);

// ─── Response interceptor ──────────────────────────────────────────────────────
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const config = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && !config._retry) {
      config._retry = true;
      // Token refresh can be wired here
      storage.remove(STORAGE_KEYS.ACCESS_TOKEN);
      storage.remove(STORAGE_KEYS.REFRESH_TOKEN);
      window.location.href = "/login";
      return Promise.reject(error);
    }

    // Structured error for consumers
    const apiErr = {
      message:    (error.response?.data as Record<string, string>)?.message ?? error.message ?? "An unexpected error occurred",
      statusCode: error.response?.status ?? 0,
      code:       (error.response?.data as Record<string, string>)?.code,
      isNetwork:  !error.response,
    };
    return Promise.reject(apiErr);
  },
);

export default apiClient;
