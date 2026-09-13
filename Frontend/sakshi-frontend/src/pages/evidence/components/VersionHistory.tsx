import { motion } from "framer-motion";
import { History, RotateCcw } from "lucide-react";
import { StatusBadge } from "@/components/ui/feedback/StatusBadge";
import { formatDateTime } from "@/utils/format";
import type { EvidenceVersion } from "@/types/evidence.types";
import { useNotifications } from "@/context/NotificationContext";

export function VersionHistory({ versions }: { versions: EvidenceVersion[] }) {
  const { toast } = useNotifications();
  const handleRollback = (v: EvidenceVersion) => {
    toast({ title:`Rollback to v${v.version} requested`, message:"This action requires supervisor approval.", variant:"warning" });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <History className="h-4 w-4 text-muted-foreground" />
        <p className="text-sm font-semibold text-foreground">Version History</p>
        <span className="text-xs text-muted-foreground">({versions.length} versions)</span>
      </div>
      {versions.length === 0 ? (
        <div className="rounded-xl border border-border bg-card py-10 text-center">
          <p className="text-sm text-muted-foreground">No version history available.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {[...versions].reverse().map((v, i) => (
            <motion.div key={v.id} initial={{ opacity:0, y:6 }} animate={{ opacity:1, y:0 }} transition={{ delay:i*0.07 }}
              className="rounded-xl border border-border bg-card p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[hsl(var(--primary))]/10 text-[hsl(var(--primary))] font-bold text-xs">
                    v{v.version}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-semibold text-foreground">{v.changes}</p>
                      {v.version === 1 && <StatusBadge variant="primary" size="xs">Initial</StatusBadge>}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      By <span className="font-medium text-foreground">{v.modifiedBy}</span> · {formatDateTime(v.modifiedAt)}
                    </p>
                    {v.reason && <p className="text-xs text-muted-foreground mt-1 italic">Reason: {v.reason}</p>}
                    <p className="text-2xs font-mono text-muted-foreground mt-1">{v.snapshot}</p>
                  </div>
                </div>
                {v.canRollback && (
                  <button onClick={() => handleRollback(v)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-amber-200 bg-amber-50 dark:bg-amber-950/20 px-3 py-1.5 text-2xs font-semibold text-amber-700 dark:text-amber-400 hover:bg-amber-100 transition-colors shrink-0">
                    <RotateCcw className="h-3 w-3" /> Rollback
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
