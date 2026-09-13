import { AnimatePresence, motion } from "framer-motion";
import { X, CheckCircle2, AlertTriangle, Info, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNotifications, type Notification } from "@/context/NotificationContext";

const variantConfig = {
  info:    { icon: Info,          bg: "bg-card border-royal-200 dark:border-royal-800",    iconClass: "text-royal-500"   },
  success: { icon: CheckCircle2,  bg: "bg-card border-emerald-200 dark:border-emerald-800", iconClass: "text-emerald-500" },
  warning: { icon: AlertTriangle, bg: "bg-card border-amber-200 dark:border-amber-800",    iconClass: "text-amber-500"   },
  error:   { icon: XCircle,       bg: "bg-card border-danger-200 dark:border-danger-800",  iconClass: "text-danger-500"  },
};

function ToastItem({ toast, onDismiss }: { toast: Notification; onDismiss: (id: string) => void }) {
  const { icon: Icon, bg, iconClass } = variantConfig[toast.variant];
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16, scale: 0.96 }}
      animate={{ opacity: 1, y: 0,  scale: 1    }}
      exit={{    opacity: 0, y: -8, scale: 0.96  }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      role="alert"
      aria-live="polite"
      className={cn(
        "flex items-start gap-3 w-80 rounded-xl border p-4 shadow-lg",
        bg,
      )}
    >
      <Icon className={cn("mt-0.5 h-5 w-5 shrink-0", iconClass)} aria-hidden />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-foreground">{toast.title}</p>
        {toast.message && <p className="mt-0.5 text-xs text-muted-foreground">{toast.message}</p>}
      </div>
      <button
        onClick={() => onDismiss(toast.id)}
        className="shrink-0 text-muted-foreground hover:text-foreground transition-colors"
        aria-label="Dismiss notification"
      >
        <X className="h-4 w-4" />
      </button>
    </motion.div>
  );
}

export function ToastContainer() {
  const { toasts, dismiss } = useNotifications();
  return (
    <div
      className="fixed bottom-6 right-6 z-[200] flex flex-col gap-2 items-end"
      aria-label="Notifications"
    >
      <AnimatePresence mode="popLayout">
        {toasts.map(t => (
          <ToastItem key={t.id} toast={t} onDismiss={dismiss} />
        ))}
      </AnimatePresence>
    </div>
  );
}
