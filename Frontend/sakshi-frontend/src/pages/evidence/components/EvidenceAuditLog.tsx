import { motion } from "framer-motion";
import { CheckCircle2, XCircle, Activity } from "lucide-react";
import { StatusBadge } from "@/components/ui/feedback/StatusBadge";
import { Avatar } from "@/components/ui/feedback/Avatar";
import { AGENCY_LABEL, AGENCY_COLOR } from "@/utils/evidence.utils";
import { cn } from "@/lib/utils";
import { formatDateTime } from "@/utils/format";
import type { EvidenceAuditLog as AuditLogType } from "@/types/evidence.types";

export function EvidenceAuditLog({ logs }: { logs: AuditLogType[] }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-1">
        <Activity className="h-4 w-4 text-muted-foreground" />
        <p className="text-sm font-semibold text-foreground">Audit Log</p>
        <span className="text-xs text-muted-foreground">({logs.length} entries)</span>
      </div>
      {logs.length === 0 ? (
        <div className="rounded-xl border border-border bg-card py-10 text-center">
          <p className="text-sm text-muted-foreground">No audit entries.</p>
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                {["User","Action","Details","IP Address","Time","Status"].map(h => (
                  <th key={h} className="px-4 py-2.5 text-left text-2xs font-semibold uppercase tracking-wider text-muted-foreground whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {logs.map((log, i) => {
                const agCol = AGENCY_COLOR[log.agency];
                return (
                  <motion.tr key={log.id} initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:i*0.04 }}
                    className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Avatar name={log.user} size="xs" />
                        <div>
                          <p className="text-xs font-medium text-foreground whitespace-nowrap">{log.user}</p>
                          <span className={cn("rounded-full border px-1.5 py-0 text-2xs font-medium", agCol.bg, agCol.text, agCol.border)}>
                            {AGENCY_LABEL[log.agency]}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs font-semibold text-foreground whitespace-nowrap">{log.action}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground max-w-[200px] truncate">{log.details}</td>
                    <td className="px-4 py-3 text-2xs font-mono text-muted-foreground whitespace-nowrap">{log.ipAddress}</td>
                    <td className="px-4 py-3 text-2xs text-muted-foreground whitespace-nowrap">{formatDateTime(log.timestamp)}</td>
                    <td className="px-4 py-3">
                      {log.success
                        ? <StatusBadge variant="success" size="xs"><CheckCircle2 className="h-3 w-3 inline mr-0.5" />OK</StatusBadge>
                        : <StatusBadge variant="danger"  size="xs"><XCircle     className="h-3 w-3 inline mr-0.5" />Failed</StatusBadge>}
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
