import { useState } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, Clock, FileX, Beaker, ShieldAlert, Filter, ChevronDown } from "lucide-react";
import { StatusBadge } from "@/components/ui/feedback/StatusBadge";
import { cn } from "@/lib/utils";
import { MISSING_PROCEDURES } from "@/data/ai.data";
import type { MissingProcedure } from "@/types/ai.types";

const TYPE_CONFIG = {
  workflow_step:    { icon: AlertTriangle, label: "Workflow Step",    color: "text-amber-600",  bg: "bg-amber-50  dark:bg-amber-950/30"  },
  overdue_task:     { icon: Clock,         label: "Overdue Task",     color: "text-red-600",    bg: "bg-red-50    dark:bg-red-950/30"    },
  missing_evidence: { icon: Beaker,        label: "Missing Evidence", color: "text-purple-600", bg: "bg-purple-50 dark:bg-purple-950/30" },
  missing_document: { icon: FileX,         label: "Missing Document", color: "text-royal-600",  bg: "bg-royal-50  dark:bg-royal-950/30"  },
  delayed_approval: { icon: ShieldAlert,   label: "Delayed Approval", color: "text-orange-600", bg: "bg-orange-50 dark:bg-orange-950/30" },
};

const PRIORITY_BADGE = {
  critical: "danger"  as const,
  high:     "warning" as const,
  medium:   "primary" as const,
  low:      "muted"   as const,
};

interface Props { caseId: string }

export function MissingProceduresPanel({ caseId }: Props) {
  const [filterType, setFilterType]         = useState("");
  const [filterPriority, setFilterPriority] = useState("");

  const all = MISSING_PROCEDURES.filter(m => m.caseId === caseId || true);

  const filtered = all.filter(m => {
    if (filterType     && m.type     !== filterType)     return false;
    if (filterPriority && m.priority !== filterPriority) return false;
    return true;
  });

  const criticalCount = all.filter(m => m.priority === "critical").length;
  const highCount     = all.filter(m => m.priority === "high").length;

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total Issues",    value: all.length,    color: "text-foreground"     },
          { label: "Critical",        value: criticalCount, color: "text-red-600"        },
          { label: "High Priority",   value: highCount,     color: "text-amber-600"      },
          { label: "Overdue Tasks",   value: all.filter(m => m.type === "overdue_task").length, color: "text-orange-600" },
        ].map(s => (
          <motion.div key={s.label} whileHover={{ y: -2 }}
            className="rounded-xl border border-border bg-card px-4 py-3 text-center">
            <p className={cn("text-2xl font-bold", s.color)}>{s.value}</p>
            <p className="text-xs text-muted-foreground">{s.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <TypeSelect label="Type"     value={filterType}     onChange={setFilterType}
          options={[{ value:"",label:"All Types" }, ...Object.entries(TYPE_CONFIG).map(([v,c])=>({ value:v, label:c.label }))]} />
        <TypeSelect label="Priority" value={filterPriority} onChange={setFilterPriority}
          options={[{ value:"",label:"All Priorities" },{ value:"critical",label:"Critical" },{ value:"high",label:"High" },{ value:"medium",label:"Medium" },{ value:"low",label:"Low" }]} />
        <span className="text-xs text-muted-foreground">{filtered.length} issues</span>
      </div>

      {/* List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="rounded-xl border border-border bg-card py-12 text-center">
            <AlertTriangle className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No missing procedures found for selected filters.</p>
          </div>
        ) : (
          filtered.map((item, i) => <MissingItem key={item.id} item={item} index={i} />)
        )}
      </div>
    </div>
  );
}

function MissingItem({ item, index }: { item: MissingProcedure; index: number }) {
  const cfg = TYPE_CONFIG[item.type];
  const Icon = cfg.icon;

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}
      className={cn(
        "rounded-xl border bg-card p-4 hover:shadow-sm transition-all",
        item.priority === "critical" && "border-red-200 dark:border-red-900/50",
        item.priority === "high"     && "border-amber-200 dark:border-amber-900/50",
      )}>
      <div className="flex items-start gap-4">
        <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border", cfg.bg)}>
          <Icon className={cn("h-5 w-5", cfg.color)} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <p className="text-sm font-semibold text-foreground">{item.title}</p>
            <StatusBadge variant={PRIORITY_BADGE[item.priority]} size="xs" dot>
              {item.priority.charAt(0).toUpperCase() + item.priority.slice(1)}
            </StatusBadge>
            <span className="rounded-full border border-border bg-muted px-2 py-0.5 text-2xs font-medium text-muted-foreground">
              {cfg.label}
            </span>
            {item.daysOverdue && (
              <span className="rounded-full bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 px-2 py-0.5 text-2xs font-semibold text-red-600">
                {item.daysOverdue}d overdue
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed mb-2">{item.description}</p>
          <div className="flex items-start gap-2 rounded-lg bg-muted/50 px-3 py-2 text-xs">
            <span className="font-semibold text-foreground shrink-0">Action:</span>
            <span className="text-muted-foreground">{item.suggestedAction}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function TypeSelect({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: { value: string; label: string }[] }) {
  return (
    <div className="relative flex items-center">
      <Filter className="pointer-events-none absolute left-2.5 h-3.5 w-3.5 text-muted-foreground" />
      <select value={value} onChange={e => onChange(e.target.value)}
        className="h-9 rounded-lg border border-border bg-card pl-8 pr-7 text-xs focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))] appearance-none dark:bg-slate-900 dark:text-white"
        aria-label={label}>
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2 h-3 w-3 text-muted-foreground" />
    </div>
  );
}
