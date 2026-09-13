import { motion } from "framer-motion";
import { Target, CheckCircle2, XCircle, Lightbulb, FileText, Clipboard, ShieldCheck, Beaker } from "lucide-react";
import { CircularProgress, ProgressBar } from "@/components/ui/feedback/ProgressBar";
import { StatusBadge } from "@/components/ui/feedback/StatusBadge";
import { cn } from "@/lib/utils";
import { READINESS_REPORTS } from "@/data/ai.data";
import { CASES } from "@/data/cases.data";

const CATEGORY_CONFIG = {
  document:  { icon: FileText,    color: "text-royal-600",   bg: "bg-royal-50   dark:bg-royal-950/30"   },
  procedure: { icon: Clipboard,   color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-950/30" },
  approval:  { icon: ShieldCheck, color: "text-amber-600",   bg: "bg-amber-50   dark:bg-amber-950/30"   },
  evidence:  { icon: Beaker,      color: "text-purple-600",  bg: "bg-purple-50  dark:bg-purple-950/30"  },
};

const PRIORITY_BADGE = {
  required:    "danger"  as const,
  recommended: "warning" as const,
  optional:    "muted"   as const,
};

interface Props { caseId: string }

export function ReadinessDashboard({ caseId }: Props) {
  const report   = READINESS_REPORTS.find(r => r.caseId === caseId) ?? READINESS_REPORTS[0];
  const caseData = CASES.find(c => c.id === caseId);

  const pct      = report.overallPercent;
  const readyColor = pct >= 80 ? "success" : pct >= 50 ? "warning" : "danger";
  const readyLabel = pct >= 80 ? "Ready" : pct >= 50 ? "Partial" : "Not Ready";

  const grouped = {
    procedure: report.items.filter(i => i.category === "procedure"),
    document:  report.items.filter(i => i.category === "document"),
    evidence:  report.items.filter(i => i.category === "evidence"),
    approval:  report.items.filter(i => i.category === "approval"),
  };

  return (
    <div className="space-y-4">
      {/* Top summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Big meter */}
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
          className="rounded-xl border border-border bg-card p-6 flex flex-col items-center gap-4">
          <CircularProgress value={pct} size={120} strokeWidth={10} color={readyColor} showValue label="Court Readiness" />
          <div className="text-center w-full space-y-2">
            <StatusBadge variant={readyColor} size="sm" dot>{readyLabel} for Court</StatusBadge>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="rounded-lg bg-emerald-50 dark:bg-emerald-950/30 p-2 text-center">
                <p className="text-lg font-bold text-emerald-600">{report.completedCount}</p>
                <p className="text-muted-foreground">Completed</p>
              </div>
              <div className="rounded-lg bg-red-50 dark:bg-red-950/30 p-2 text-center">
                <p className="text-lg font-bold text-red-600">{report.totalCount - report.completedCount}</p>
                <p className="text-muted-foreground">Pending</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Category breakdowns */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="md:col-span-2 rounded-xl border border-border bg-card p-5 space-y-3">
          <p className="text-sm font-semibold text-foreground">Readiness by Category</p>
          {(Object.entries(grouped) as [keyof typeof grouped, typeof grouped["procedure"]][]).map(([cat, items]) => {
            const done = items.filter(i => i.done).length;
            const pctCat = items.length > 0 ? Math.round((done / items.length) * 100) : 0;
            const cfg = CATEGORY_CONFIG[cat];
            return (
              <div key={cat} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className={cn("flex h-5 w-5 items-center justify-center rounded", cfg.bg)}>
                      <cfg.icon className={cn("h-3 w-3", cfg.color)} />
                    </div>
                    <span className="font-medium text-foreground capitalize">{cat}</span>
                  </div>
                  <span className="text-muted-foreground">{done}/{items.length} · {pctCat}%</span>
                </div>
                <ProgressBar value={pctCat} size="sm" color={pctCat >= 80 ? "success" : pctCat >= 50 ? "warning" : "danger"} />
              </div>
            );
          })}
          <p className="text-xs text-muted-foreground pt-1">{caseData?.caseNumber} · {caseData?.district}</p>
        </motion.div>
      </div>

      {/* Checklist */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="border-b border-border px-5 py-3.5 flex items-center gap-2">
          <Target className="h-4 w-4 text-muted-foreground" />
          <p className="text-sm font-semibold text-foreground">Court Readiness Checklist</p>
        </div>
        <div className="divide-y divide-border">
          {report.items.map((item, i) => (
            <motion.div key={item.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}
              className={cn("flex items-start gap-4 px-5 py-3 transition-colors", item.done ? "hover:bg-muted/20" : "hover:bg-muted/40")}>
              <div className="mt-0.5">
                {item.done
                  ? <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                  : <XCircle className="h-5 w-5 text-red-400" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className={cn("text-sm font-medium", item.done ? "text-foreground line-through opacity-60" : "text-foreground")}>{item.label}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <StatusBadge variant={PRIORITY_BADGE[item.priority]} size="xs">{item.priority}</StatusBadge>
                  <span className="text-2xs text-muted-foreground capitalize">{item.category}</span>
                </div>
              </div>
              {item.done && <span className="text-2xs text-emerald-600 font-medium shrink-0">Completed</span>}
            </motion.div>
          ))}
        </div>
      </div>

      {/* AI Recommendations */}
      <div className="rounded-xl border border-[hsl(var(--primary))]/20 bg-[hsl(var(--primary))]/5 p-5">
        <div className="flex items-center gap-2 mb-3">
          <Lightbulb className="h-4 w-4 text-[hsl(var(--primary))]" />
          <p className="text-sm font-semibold text-foreground">AI Recommendations to Improve Readiness</p>
        </div>
        <ul className="space-y-2">
          {report.recommendations.map((rec, i) => (
            <li key={i} className="flex items-start gap-2.5 text-sm text-foreground">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[hsl(var(--primary))]" />
              {rec}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
