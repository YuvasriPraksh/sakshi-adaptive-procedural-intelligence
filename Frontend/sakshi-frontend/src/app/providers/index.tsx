import type { ReactNode } from "react";
import { ThemeProvider }        from "./ThemeProvider";
import { AuthProvider }         from "@/context/AuthContext";
import { NotificationProvider } from "@/context/NotificationContext";
import { UserProvider }         from "@/context/UserContext";

/**
 * Root provider tree.
 * Order: Theme → Auth → User → Notification
 */
export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider defaultTheme="system">
      <AuthProvider>
        <UserProvider>
          <NotificationProvider>
            {children}
          </NotificationProvider>
        </UserProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
