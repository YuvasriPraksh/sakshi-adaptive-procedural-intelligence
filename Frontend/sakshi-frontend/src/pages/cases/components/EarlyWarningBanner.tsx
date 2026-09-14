import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, TrendingUp, ShieldAlert, ArrowRight, X, Clock, AlertOctagon } from "lucide-react";
import { notificationService } from "@/services/notificationService";
import type { AppNotification } from "@/types/ai.types";

interface EarlyWarningBannerProps {
  caseId: string;
  onNavigateTab?: (tab: string) => void;
}

export function EarlyWarningBanner({ caseId, onNavigateTab }: EarlyWarningBannerProps) {
  const [warnings, setWarnings] = useState<AppNotification[]>([]);
  const [dismissed, setDismissed] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchEarlyWarnings = useCallback(async () => {
    try {
      setLoading(true);
      const res = await notificationService.getCaseEarlyWarnings(caseId);
      if (res.success && res.data) {
        setWarnings(res.data);
      }
    } catch (err) {
      console.warn("Failed to fetch early warnings for case:", err);
    } finally {
      setLoading(false);
    }
  }, [caseId]);

  useEffect(() => {
    fetchEarlyWarnings();
  }, [fetchEarlyWarnings]);

  if (loading || warnings.length === 0 || dismissed) {
    return null;
  }

  const primaryWarning = warnings[0];
  const isCritical = primaryWarning.priority === "critical" || primaryWarning.priority === "high";
  const eventCode = primaryWarning.eventCode || "";
  const details = primaryWarning.detailsJson || {};

  const getEventIcon = () => {
    if (eventCode.includes("DOWNSTREAM") || eventCode.includes("CASCADE")) {
      return <AlertOctagon className="w-5 h-5 text-red-400 shrink-0 animate-pulse" />;
    }
    if (eventCode.includes("SCORE_JUMP") || eventCode.includes("ELEVATED")) {
      return <TrendingUp className="w-5 h-5 text-amber-400 shrink-0" />;
    }
    if (eventCode.includes("HIGH_RISK") || isCritical) {
      return <ShieldAlert className="w-5 h-5 text-red-400 shrink-0 animate-pulse" />;
    }
    if (eventCode.includes("DEADLINE")) {
      return <Clock className="w-5 h-5 text-amber-400 shrink-0" />;
    }
    return <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />;
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className={`mb-6 rounded-xl border p-4 shadow-lg transition-all ${
          isCritical
            ? "border-red-500/40 bg-gradient-to-r from-red-950/40 via-red-900/20 to-background/60 backdrop-blur-md"
            : "border-amber-500/40 bg-gradient-to-r from-amber-950/40 via-amber-900/20 to-background/60 backdrop-blur-md"
        }`}
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-background/50 border border-white/10 mt-0.5 sm:mt-0">
              {getEventIcon()}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-semibold uppercase tracking-wider text-amber-400/90 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                  Procedural Early Warning
                </span>
                {details.scoreDelta && (
                  <span className="text-xs font-bold text-red-400 bg-red-500/10 px-2 py-0.5 rounded border border-red-500/20">
                    +{details.scoreDelta} pts jump
                  </span>
                )}
                {warnings.length > 1 && (
                  <span className="text-xs font-medium text-muted-foreground bg-white/5 px-2 py-0.5 rounded border border-white/10">
                    +{warnings.length - 1} more alert{warnings.length > 2 ? "s" : ""}
                  </span>
                )}
              </div>
              <h4 className="text-sm font-semibold text-foreground mt-1">
                {primaryWarning.title}
              </h4>
              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                {primaryWarning.message}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
            {onNavigateTab && (
              <button
                onClick={() => onNavigateTab("risk")}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 transition-all hover:scale-[1.02]"
              >
                Inspect Risk
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              onClick={() => setDismissed(true)}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors"
              title="Dismiss warning banner"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
