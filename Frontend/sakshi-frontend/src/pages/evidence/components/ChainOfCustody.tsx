import { motion } from "framer-motion";
import { CheckCircle2, Clock, ArrowRight, Shield, Lock } from "lucide-react";
import { StatusBadge } from "@/components/ui/feedback/StatusBadge";
import { cn } from "@/lib/utils";
import { AGENCY_LABEL, AGENCY_COLOR, ACTION_LABEL, VERIFICATION_BADGE, truncateHash } from "@/utils/evidence.utils";
import { formatDateTime } from "@/utils/format";
import type { CustodyEvent } from "@/types/evidence.types";

export function ChainOfCustody({ events }: { events: CustodyEvent[] }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-foreground">Chain of Custody Timeline</p>
          <p className="text-xs text-muted-foreground">{events.length} custody events recorded</p>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
          <Shield className="h-3.5 w-3.5" /> Tamper-Evident Chain
        </div>
      </div>

      <div className="relative">
        <div className="absolute left-[22px] top-0 bottom-0 w-0.5 bg-gradient-to-b from-[hsl(var(--primary))] to-border" />
        <div className="space-y-3">
          {events.map((event, i) => {
            const agCol = AGENCY_COLOR[event.agency];
            const isLast = i === events.length - 1;
            return (
              <motion.div key={event.id}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06 }}
                className="relative flex gap-4 pl-2">
                {/* Icon dot */}
                <div className={cn(
                  "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border-2 z-10",
                  event.verificationStatus === "verified"
                    ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40"
                    : "border-amber-400 bg-amber-50 dark:bg-amber-950/40",
                )}>
                  {event.verificationStatus === "verified"
                    ? <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                    : <Clock className="h-5 w-5 text-amber-600" />}
                </div>

                {/* Card */}
                <div className={cn(
                  "flex-1 rounded-xl border bg-card p-4 hover:shadow-sm transition-all mb-1",
                  isLast ? "border-[hsl(var(--primary))]/40" : "border-border",
                )}>
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-semibold text-foreground">
                          {ACTION_LABEL[event.action]}
                        </span>
                        <span className={cn("rounded-full border px-2 py-0.5 text-2xs font-semibold",
                          agCol.bg, agCol.text, agCol.border)}>
                          {AGENCY_LABEL[event.agency]}
                        </span>
                        {event.transferId && (
                          <span className="text-2xs font-mono text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                            {event.transferId}
                          </span>
                        )}
                        <StatusBadge variant={VERIFICATION_BADGE[event.verificationStatus]} size="xs">
                          {event.verificationStatus}
                        </StatusBadge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{event.purpose}</p>
                    </div>
                    <div className="text-right text-2xs text-muted-foreground shrink-0">
                      <p className="font-medium">{formatDateTime(event.timestamp)}</p>
                      <p>{event.location}</p>
                    </div>
                  </div>

                  {/* Transfer arrow */}
                  {event.fromAgency && event.toAgency && (
                    <div className="flex items-center gap-2 mt-2.5 text-xs">
                      <span className={cn("rounded-full border px-2 py-0.5 text-2xs font-medium",
                        AGENCY_COLOR[event.fromAgency].bg, AGENCY_COLOR[event.fromAgency].text, AGENCY_COLOR[event.fromAgency].border)}>
                        {AGENCY_LABEL[event.fromAgency]}
                      </span>
                      <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className={cn("rounded-full border px-2 py-0.5 text-2xs font-medium",
                        AGENCY_COLOR[event.toAgency].bg, AGENCY_COLOR[event.toAgency].text, AGENCY_COLOR[event.toAgency].border)}>
                        {AGENCY_LABEL[event.toAgency]}
                      </span>
                    </div>
                  )}

                  {/* Hash + sig */}
                  <div className="mt-3 pt-3 border-t border-border grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <p className="text-2xs text-muted-foreground mb-1 flex items-center gap-1">
                        <Lock className="h-3 w-3" /> Officer &amp; Signature
                      </p>
                      <p className="text-xs font-medium text-foreground">{event.officer}</p>
                      <p className="text-2xs font-mono text-muted-foreground">{event.digitalSignature}</p>
                    </div>
                    {event.hashAfter && (
                      <div>
                        <p className="text-2xs text-muted-foreground mb-1">Hash After Event</p>
                        <p className="text-2xs font-mono text-muted-foreground bg-muted/50 rounded px-2 py-1">
                          {truncateHash(event.hashAfter, 20)}
                        </p>
                      </div>
                    )}
                  </div>
                  {event.remarks && (
                    <p className="mt-2 text-xs text-muted-foreground italic">"{event.remarks}"</p>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
