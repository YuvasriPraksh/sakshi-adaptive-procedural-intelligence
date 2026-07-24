import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Home, ArrowLeft, Search } from "lucide-react";
import { ErrorLayout } from "@/components/layout/ErrorLayout";
import { ROUTES } from "@/router/routes";

export default function NotFoundPage() {
  const navigate  = useNavigate();
  const location  = useLocation();

  return (
    <ErrorLayout>
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}
        className="flex flex-col items-center text-center gap-6 max-w-md px-4">
        <div className="relative">
          <p className="text-[120px] font-extrabold leading-none text-[hsl(var(--primary))]/10 select-none">404</p>
          <div className="absolute inset-0 flex items-center justify-center">
            <Search className="h-16 w-16 text-[hsl(var(--primary))]/30" strokeWidth={1.5} />
          </div>
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-foreground">Page not found</h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            The page <code className="mx-1 rounded bg-muted px-1.5 py-0.5 text-xs font-mono">{location.pathname}</code>
            doesn't exist or has been moved.
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <button onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-card hover:bg-muted px-5 py-2.5 text-sm font-medium text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" /> Go back
          </button>
          <button onClick={() => navigate(ROUTES.DASHBOARD)}
            className="inline-flex items-center gap-2 rounded-xl bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))]/90 px-5 py-2.5 text-sm font-bold text-white transition-colors shadow-sm">
            <Home className="h-4 w-4" /> Go to Dashboard
          </button>
        </div>
      </motion.div>
    </ErrorLayout>
  );
}
