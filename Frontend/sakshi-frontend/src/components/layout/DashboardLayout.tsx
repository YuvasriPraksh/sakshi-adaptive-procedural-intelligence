import { useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useUser } from "@/context/UserContext";
import { useNotifications } from "@/context/NotificationContext";
import { Sidebar } from "@/components/navigation/Sidebar";
import { TopNav } from "@/components/navigation/TopNav";
import { Footer } from "@/components/navigation/Footer";
import { ToastContainer } from "@/components/ui/feedback/Toast";

export interface DashboardLayoutProps {
  children:   ReactNode;
  className?: string;
}

// Page enter animation
const pageVariants = {
  initial: { opacity: 0, y: 6 },
  enter:   { opacity: 1, y: 0, transition: { duration: 0.22, ease: "easeOut" } },
  exit:    { opacity: 0, y: -4, transition: { duration: 0.15 } },
};

export function DashboardLayout({ children, className }: DashboardLayoutProps) {
  const { preferences }  = useUser();
  const { unreadCount }  = useNotifications();
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* ── Skip-nav (accessibility) ─────────────────────────────── */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[500] focus:rounded-lg focus:bg-[hsl(var(--primary))] focus:px-4 focus:py-2 focus:text-sm focus:font-bold focus:text-white focus:shadow-lg"
      >
        Skip to main content
      </a>

      {/* ── Desktop sidebar ──────────────────────────────────────── */}
      <div className="hidden lg:flex h-full shrink-0">
        <Sidebar unreadNotifications={unreadCount} />
      </div>

      {/* ── Mobile sidebar overlay ───────────────────────────────── */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setMobileOpen(false)}
              aria-hidden="true"
            />
            <motion.div
              className="fixed left-0 top-0 bottom-0 z-50 lg:hidden"
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
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

      {/* ── Main area ────────────────────────────────────────────── */}
      <div className="flex flex-1 flex-col min-w-0 overflow-hidden">
        <TopNav onMobileMenuToggle={() => setMobileOpen(v => !v)} />

        {/* Page content with transition */}
        <main
          id="main-content"
          tabIndex={-1}
          className={cn(
            "flex-1 overflow-y-auto overflow-x-hidden",
            preferences.compactMode
              ? "px-3 py-3 sm:px-4 sm:py-4"
              : "px-4 py-5 sm:px-6 sm:py-6 lg:px-8",
            className,
          )}
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={location.pathname}
              variants={pageVariants}
              initial="initial"
              animate="enter"
              exit="exit"
              className="h-full"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>

        <Footer />
      </div>

      {/* ── Toasts ───────────────────────────────────────────────── */}
      <ToastContainer />
    </div>
  );
}
