import { motion } from "framer-motion";
import {
  BrainCircuit, CheckCircle2, AlertTriangle, FileX,
  Clock, Lightbulb, Activity, ChevronRight,
} from "lucide-react";
import { StatusBadge } from "@/components/ui/feedback/StatusBadge";
import { cn } from "@/lib/utils";
import { CASE_AI_SUMMARIES } from "@/data/ai.data";
import { CASES } from "@/data/cases.data";
import { CRIME_LABEL } from "@/utils/case.utils";
import { formatRelativeTime } from "@/utils/format";

const STATUS_STYLES = {
  on_track:  { label: "On Track",  badge: "success" as const, color: "text-emerald-600" },
  delayed:   { label: "Delayed",   badge: "warning" as const, color: "text-amber-600"   },
  critical:  { label: "Critical",  badge: "danger"  as const, color: "text-red-600"     },
  completed: { label: "Completed", badge: "muted"   as const, color: "text-slate-500"   },
};

interface Props { caseId: string }

export function CaseAISummary({ caseId }: Props) {
  const caseData = CASES.find(c => c.id === caseId);
  const summary  = CASE_AI_SUMMARIES.find(s => s.caseId === caseId) ?? CASE_AI_SUMMARIES[0];
  const status   = STATUS_STYLES[summary.investigationStatus];

  if (!caseData) return null;

  const sections = [
    {
      icon: AlertTriangle, label: "Pending Tasks",
      color: "text-amber-600", bg: "bg-amber-50 dark:bg-amber-950/30",
      items: summary.pendingTasks, empty: "No pending tasks",
    },
    {
      icon: FileX, label: "Missing Documents",
      color: "text-red-600", bg: "bg-red-50 dark:bg-red-950/30",
      items: summary.missingDocuments, empty: "All documents present",
    },
    {
      icon: Clock, label: "Delay Reasons",
      color: "text-slate-600", bg: "bg-slate-50 dark:bg-slate-800",
      items: summary.delayReasons, empty: "No delays identified",
    },
  ];

  return (
    <div className="space-y-4">
      {/* Summary card */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border border-border bg-card p-5">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-600/10 text-emerald-600">
            <BrainCircuit className="h-6 w-6" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <p className="text-sm font-semibold text-foreground font-mono">{summary.caseNumber ?? caseData.caseNumber}</p>
              <StatusBadge variant={status.badge} size="xs" dot>{status.label}</StatusBadge>
              <span className="text-2xs text-muted-foreground">AI generated {formatRelativeTime(summary.generatedAt)}</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">{CRIME_LABEL[caseData.crimeType]} · {caseData.district}, {caseData.state}</p>
            <p className="text-sm text-foreground mt-3 leading-relaxed">{summary.summary}</p>
          </div>
        </div>
      </motion.div>

      {/* Current stage + suggested next step */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <motion.div initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}
          className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-2 mb-3">
            <Activity className="h-4 w-4 text-royal-600" />
            <p className="text-sm font-semibold text-foreground">Current Stage</p>
          </div>
          <div className="space-y-2">
            <p className="text-base font-bold text-[hsl(var(--primary))]">{summary.currentStage}</p>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>Stage {caseData.currentStageOrder} of {caseData.totalStages}</span>
              <span className="h-1 w-1 rounded-full bg-muted-foreground" />
              <span className={cn("font-medium", status.color)}>{status.label}</span>
            </div>
            <div className="w-full h-2 rounded-full bg-muted overflow-hidden mt-2">
              <div className="h-full rounded-full bg-[hsl(var(--primary))] transition-all duration-700"
                style={{ width: `${(caseData.currentStageOrder / caseData.totalStages) * 100}%` }} />
            </div>
            <p className="text-2xs text-right text-muted-foreground">
              {Math.round((caseData.currentStageOrder / caseData.totalStages) * 100)}% complete
            </p>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }}
          className="rounded-xl border border-[hsl(var(--primary))]/20 bg-[hsl(var(--primary))]/5 p-4">
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb className="h-4 w-4 text-[hsl(var(--primary))]" />
            <p className="text-sm font-semibold text-foreground">Suggested Next Step</p>
          </div>
          <p className="text-sm text-foreground leading-relaxed">{summary.suggestedNextStep}</p>
          <div className="mt-3 flex items-center gap-1 text-xs font-semibold text-[hsl(var(--primary))]">
            AI Recommendation <ChevronRight className="h-3.5 w-3.5" />
          </div>
        </motion.div>
      </div>

      {/* Pending / Missing / Delays */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {sections.map((sec, si) => (
          <motion.div key={sec.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + si * 0.08 }}
            className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className={cn("flex h-7 w-7 items-center justify-center rounded-lg", sec.bg)}>
                <sec.icon className={cn("h-3.5 w-3.5", sec.color)} />
              </div>
              <p className="text-sm font-semibold text-foreground">{sec.label}</p>
              {sec.items.length > 0 && (
                <span className="ml-auto text-xs font-bold text-foreground">{sec.items.length}</span>
              )}
            </div>
            {sec.items.length === 0 ? (
              <div className="flex items-center gap-2 text-xs text-emerald-600">
                <CheckCircle2 className="h-3.5 w-3.5" />{sec.empty}
              </div>
            ) : (
              <ul className="space-y-1.5">
                {sec.items.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-muted-foreground/50" />
                    {item}
                  </li>
                ))}
              </ul>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
