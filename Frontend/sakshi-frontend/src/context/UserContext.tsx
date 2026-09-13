import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import type { User } from "@/features/auth/types";

interface UserPreferences {
  language:         string;
  timezone:         string;
  dateFormat:       string;
  compactMode:      boolean;
  emailNotifications: boolean;
  sidebarCollapsed: boolean;
}

const defaultPreferences: UserPreferences = {
  language:           "en",
  timezone:           "Asia/Kolkata",
  dateFormat:         "DD/MM/YYYY",
  compactMode:        false,
  emailNotifications: true,
  sidebarCollapsed:   false,
};

interface UserContextValue {
  currentUser:        User | null;
  preferences:        UserPreferences;
  setCurrentUser:     (user: User | null) => void;
  updatePreferences:  (p: Partial<UserPreferences>) => void;
  toggleSidebar:      () => void;
}

const UserContext = createContext<UserContextValue | null>(null);

export function UserProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [preferences, setPreferences] = useState<UserPreferences>(() => {
    try {
      const saved = localStorage.getItem("sakshi_preferences");
      return saved ? { ...defaultPreferences, ...JSON.parse(saved) } : defaultPreferences;
    } catch {
      return defaultPreferences;
    }
  });

  const updatePreferences = useCallback((partial: Partial<UserPreferences>) => {
    setPreferences(prev => {
      const next = { ...prev, ...partial };
      localStorage.setItem("sakshi_preferences", JSON.stringify(next));
      return next;
    });
  }, []);

  const toggleSidebar = useCallback(() => {
    updatePreferences({ sidebarCollapsed: !preferences.sidebarCollapsed });
  }, [preferences.sidebarCollapsed, updatePreferences]);

  return (
    <UserContext.Provider value={{ currentUser, preferences, setCurrentUser, updatePreferences, toggleSidebar }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUser must be used within UserProvider");
  return ctx;
}
