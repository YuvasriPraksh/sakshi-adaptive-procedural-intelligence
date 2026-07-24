import { useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cn }                      from "@/lib/utils";
import { useUser }                 from "@/context/UserContext";
import { useNotifications }        from "@/context/NotificationContext";
import { Sidebar }                 from "@/components/navigation/Sidebar";
import { TopNav }                  from "@/components/navigation/TopNav";
import { Footer }                  from "@/components/navigation/Footer";
import { ToastContainer }          from "@/components/ui/feedback/Toast";

export interface DashboardLayoutProps {
  children:   ReactNode;
  className?: string;
}

export function DashboardLayout({ children, className }: DashboardLayoutProps) {
  const { preferences }  = useUser();
  const { unreadCount }  = useNotifications();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* ── Skip nav link (accessibility) ── */}
      <a href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[500] focus:rounded-lg focus:bg-[hsl(var(--primary))] focus:px-4 focus:py-2 focus:text-sm focus:font-bold focus:text-white">
        Skip to main content
      </a>

      {/* ── Desktop sidebar ── */}
      <div className="hidden lg:flex h-full shrink-0" aria-label="Main navigation">
        <Sidebar unreadNotifications={unreadCount} />
      </div>

      {/* ── Mobile sidebar overlay ── */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              aria-hidden="true"
            />
            <motion.div
              className="fixed left-0 top-0 bottom-0 z-50 lg:hidden"
              initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              role="dialog"
              aria-modal="true"
              aria-label="Navigation menu"
            >
              <Sidebar unreadNotifications={unreadCount} />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Main content area ── */}
      <div className="flex flex-1 flex-col min-w-0 overflow-hidden">
        <TopNav onMobileMenuToggle={() => setMobileOpen(v => !v)} />

        <main
          id="main-content"
          tabIndex={-1}
          className={cn(
            "flex-1 overflow-y-auto",
            preferences.compactMode ? "px-3 py-3 sm:px-4" : "px-4 py-5 sm:px-5 sm:py-6 lg:px-8 lg:py-6",
            className,
          )}
        >
          {children}
        </main>

        <Footer />
      </div>

      {/* ── Toast notifications ── */}
      <ToastContainer />
    </div>
  );
}
