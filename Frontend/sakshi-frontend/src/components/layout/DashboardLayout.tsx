import { useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useUser } from "@/context/UserContext";
import { useNotifications } from "@/context/NotificationContext";
import { Sidebar } from "@/components/navigation/Sidebar";
import { TopNav } from "@/components/navigation/TopNav";
import { Footer } from "@/components/navigation/Footer";
import { ToastContainer } from "@/components/ui/feedback/Toast";

export interface DashboardLayoutProps {
  children:    ReactNode;
  className?:  string;
}

export function DashboardLayout({ children, className }: DashboardLayoutProps) {
  const { preferences } = useUser();
  const { unreadCount } = useNotifications();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* ── Desktop sidebar ─────────────────────────────────────── */}
      <div className="hidden lg:flex h-full">
        <Sidebar unreadNotifications={unreadCount} />
      </div>

      {/* ── Mobile sidebar overlay ──────────────────────────────── */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              className="fixed inset-0 z-40 bg-black/50 lg:hidden"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              className="fixed left-0 top-0 bottom-0 z-50 lg:hidden"
              initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
            >
              <Sidebar unreadNotifications={unreadCount} />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Main content ────────────────────────────────────────── */}
      <div className="flex flex-1 flex-col min-w-0 overflow-hidden">
        <TopNav onMobileMenuToggle={() => setMobileOpen(v => !v)} />

        <main
          className={cn(
            "flex-1 overflow-y-auto page-padding",
            preferences.compactMode && "px-4 py-4",
            className,
          )}
          id="main-content"
        >
          {children}
        </main>

        <Footer />
      </div>

      {/* ── Toast portal ────────────────────────────────────────── */}
      <ToastContainer />
    </div>
  );
}
