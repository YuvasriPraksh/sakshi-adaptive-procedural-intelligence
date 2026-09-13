import { motion } from "framer-motion";
import { WifiOff, RefreshCw } from "lucide-react";

interface Props {
  onRetry?: () => void;
  message?: string;
}

export function NetworkError({ onRetry, message = "Unable to connect. Please check your network connection." }: Props) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-16 gap-5 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-50 dark:bg-amber-950/40">
        <WifiOff className="h-8 w-8 text-amber-500" />
      </div>
      <div className="space-y-1 max-w-sm">
        <p className="text-base font-semibold text-foreground">Connection Error</p>
        <p className="text-sm text-muted-foreground">{message}</p>
      </div>
      {onRetry && (
        <button onClick={onRetry}
          className="inline-flex items-center gap-2 rounded-xl bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))]/90 px-5 py-2.5 text-sm font-bold text-white transition-colors">
          <RefreshCw className="h-4 w-4" /> Retry
        </button>
      )}
    </motion.div>
  );
}
