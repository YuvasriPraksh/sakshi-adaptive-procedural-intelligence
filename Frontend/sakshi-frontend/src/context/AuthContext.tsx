import { createContext, useCallback, useContext, useEffect, useReducer, type ReactNode } from "react";
import type { User, UserRole } from "@/features/auth/types";
import { storage } from "@/utils/storage";
import { STORAGE_KEYS } from "@/constants/app.constants";
import { authService } from "@/services/authService";

// ─── State ────────────────────────────────────────────────────────────────────
interface AuthState {
  user:            User | null;
  accessToken:     string | null;
  isAuthenticated: boolean;
  isLoading:       boolean;
  error:           string | null;
}

const initialState: AuthState = {
  user:            null,
  accessToken:     storage.get<string>(STORAGE_KEYS.ACCESS_TOKEN, ""),
  isAuthenticated: Boolean(storage.get<string>(STORAGE_KEYS.ACCESS_TOKEN, "")),
  isLoading:       Boolean(storage.get<string>(STORAGE_KEYS.ACCESS_TOKEN, "")),
  error:           null,
};

// ─── Actions ──────────────────────────────────────────────────────────────────
type AuthAction =
  | { type: "AUTH_LOADING" }
  | { type: "AUTH_SUCCESS";  payload: { user: User; accessToken: string } }
  | { type: "AUTH_FAILURE";  payload: string }
  | { type: "AUTH_LOGOUT" }
  | { type: "USER_UPDATED";  payload: User };

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case "AUTH_LOADING":
      return { ...state, isLoading: true, error: null };
    case "AUTH_SUCCESS":
      return {
        ...state,
        isLoading:       false,
        isAuthenticated: true,
        user:            action.payload.user,
        accessToken:     action.payload.accessToken,
        error:           null,
      };
    case "AUTH_FAILURE":
      return { ...state, isLoading: false, error: action.payload };
    case "AUTH_LOGOUT":
      return { ...initialState, accessToken: null, isAuthenticated: false, isLoading: false };
    case "USER_UPDATED":
      return { ...state, user: action.payload };
    default:
      return state;
  }
}

// ─── Context ──────────────────────────────────────────────────────────────────
interface AuthContextValue extends AuthState {
  login:       (user: User, token: string) => void;
  logout:      () => void;
  updateUser:  (user: User) => void;
  setLoading:  (v: boolean) => void;
  setError:    (msg: string | null) => void;
  hasRole:     (role: UserRole | UserRole[]) => boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────
export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  const login = useCallback((user: User, token: string) => {
    storage.set(STORAGE_KEYS.ACCESS_TOKEN, token);
    dispatch({ type: "AUTH_SUCCESS", payload: { user, accessToken: token } });
  }, []);

  const logout = useCallback(() => {
    storage.remove(STORAGE_KEYS.ACCESS_TOKEN);
    storage.remove(STORAGE_KEYS.REFRESH_TOKEN);
    dispatch({ type: "AUTH_LOGOUT" });
  }, []);

  const updateUser  = useCallback((user: User) => dispatch({ type: "USER_UPDATED",  payload: user }), []);
  const setLoading  = useCallback((v: boolean) => v ? dispatch({ type: "AUTH_LOADING" }) : void 0, []);
  const setError    = useCallback((msg: string | null) => msg ? dispatch({ type: "AUTH_FAILURE", payload: msg }) : void 0, []);

  // Hydrate user session on mount if access token exists
  useEffect(() => {
    const token = storage.get<string>(STORAGE_KEYS.ACCESS_TOKEN, "");
    if (!token) return;

    let isMounted = true;
    authService.me()
      .then((res) => {
        if (isMounted && res.success && res.data) {
          dispatch({ type: "AUTH_SUCCESS", payload: { user: res.data, accessToken: token } });
        } else if (isMounted) {
          logout();
        }
      })
      .catch(() => {
        if (isMounted) {
          logout();
        }
      });

    return () => {
      isMounted = false;
    };
  }, [logout]);

  const hasRole = useCallback(
    (role: UserRole | UserRole[]) => {
      if (!state.user) return false;
      const roles = Array.isArray(role) ? role : [role];
      return roles.includes(state.user.role);
    },
    [state.user],
  );

  return (
    <AuthContext.Provider value={{ ...state, login, logout, updateUser, setLoading, setError, hasRole }}>
      {children}
    </AuthContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

