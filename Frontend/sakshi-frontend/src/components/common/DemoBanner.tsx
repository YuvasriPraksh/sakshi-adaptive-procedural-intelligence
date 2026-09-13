import { motion } from "framer-motion";
import { Sparkles, X } from "lucide-react";
import { useState } from "react";
import { DEMO_BANNER } from "@/config/demo.config";

export function DemoBanner() {
  const [visible, setVisible] = useState(true);
  if (!DEMO_BANNER || !visible) return null;

  return (
    <motion.div
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: -40, opacity: 0 }}
      className="relative z-50 bg-gradient-to-r from-amber-500 to-amber-400 text-white"
    >
      <div className="mx-auto flex h-9 max-w-7xl items-center justify-center gap-2 px-4 text-xs font-semibold">
        <Sparkles className="h-3.5 w-3.5 shrink-0" />
        <span>Demo Mode — All data is simulated. No real API calls are being made.</span>
        <span className="hidden sm:inline text-amber-100">Set VITE_DEMO_MODE=false to connect to a backend.</span>
        <button onClick={() => setVisible(false)} aria-label="Dismiss demo banner"
          className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-amber-600/30 transition-colors">
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </motion.div>
  );
}
