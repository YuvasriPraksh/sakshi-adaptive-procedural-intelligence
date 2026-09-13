import { useState } from "react";
import { motion } from "framer-motion";
import {
  Lightbulb, ArrowRight, CheckCircle2, Clock,
  FileText, Users, Scale, Beaker, ClipboardList, ChevronDown, Filter,
} from "lucide-react";
import { StatusBadge } from "@/components/ui/feedback/StatusBadge";
import { cn } from "@/lib/utils";
import { AI_RECOMMENDATIONS } from "@/data/ai.data";
import type { AIRecommendation } from "@/types/ai.types";

const CATEGORY_CONFIG = {
  procedure:    { icon: ClipboardList, color: "text-royal-600",   bg: "bg-royal-50   dark:bg-royal-950/30"   },
  document:     { icon: FileText,      color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-950/30" },
  coordination: { icon: Users,         color: "text-amber-600",   bg: "bg-amber-50   dark:bg-amber-950/30"   },
  legal:        { icon: Scale,         color: "text-purple-600",  bg: "bg-purple-50  dark:bg-purple-950/30"  },
  evidence:     { icon: Beaker,        color: "text-red-600",     bg: "bg-red-50     dark:bg-red-950/30"     },
};

const PRIORITY_BADGE = {
  critical: "danger"  as const,
  high:     "warning" as const,
  medium:   "primary" as const,
  low:      "muted"   as const,
};

const PRIORITY_ORDER = { critical: 0, high: 1, medium: 2, low: 3 };

interface Props { caseId: string }

export function RecommendationsPanel({ caseId }: Props) {
  const [filterPriority, setFilterPriority] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [completed, setCompleted]           = useState<Set<string>>(new Set());

  const all = AI_RECOMMENDATIONS.filter(r => r.caseId === caseId || r.caseId !== caseId).sort(
    (a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority],
  );

  const filtered = all.filter(r => {
    if (filterPriority && r.priority !== filterPriority) return false;
    if (filterCategory && r.category !== filterCategory) return false;
    return true;
  });

  const toggleDone = (id: string) =>
    setCompleted(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });

  const pending   = filtered.filter(r => !completed.has(r.id));
  const done      = filtered.filter(r =>  completed.has(r.id));

  return (
    <div className="space-y-4">
      {/* Summary strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total",    value: all.length,                          color: "text-foreground"  },
          { label: "Critical", value: all.filter(r=>r.priority==="critical").length, color: "text-red-600" },
          { label: "Pending",  value: all.length - completed.size,         color: "text-amber-600"   },
          { label: "Done",     value: completed.size,                      color: "text-emerald-600" },
        ].map(s => (
          <div key={s.label} className="rounded-xl border border-border bg-card px-4 py-3 text-center">
            <p className={cn("text-2xl font-bold", s.color)}>{s.value}</p>
            <p className="text-xs text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <SelectFilter label="Priority" value={filterPriority} onChange={setFilterPriority}
          options={[{v:"",l:"All Priorities"},{v:"critical",l:"Critical"},{v:"high",l:"High"},{v:"medium",l:"Medium"},{v:"low",l:"Low"}]} />
        <SelectFilter label="Category" value={filterCategory} onChange={setFilterCategory}
          options={[{v:"",l:"All Categories"}, ...Object.keys(CATEGORY_CONFIG).map(k=>({v:k,l:k.charAt(0).toUpperCase()+k.slice(1)}))]} />
        <span className="text-xs text-muted-foreground">{filtered.length} recommendations</span>
      </div>

      {/* Pending recs */}
      {pending.length > 0 && (
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Pending ({pending.length})</p>
          {pending.map((rec, i) => (
            <RecommendationCard key={rec.id} rec={rec} index={i} done={false} onToggle={toggleDone} />
          ))}
        </div>
      )}

      {/* Completed */}
      {done.length > 0 && (
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Completed ({done.length})</p>
          {done.map((rec, i) => (
            <RecommendationCard key={rec.id} rec={rec} index={i} done={true} onToggle={toggleDone} />
          ))}
        </div>
      )}

      {filtered.length === 0 && (
        <div className="rounded-xl border border-border bg-card py-12 text-center">
          <Lightbulb className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">No recommendations match your filters.</p>
        </div>
      )}
    </div>
  );
}

function RecommendationCard({ rec, index, done, onToggle }: { rec: AIRecommendation; index: number; done: boolean; onToggle: (id: string) => void }) {
  const cfg  = CATEGORY_CONFIG[rec.category];
  const Icon = cfg.icon;

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}
      className={cn(
        "rounded-xl border bg-card p-4 transition-all hover:shadow-sm",
        done ? "opacity-60 border-border" : rec.priority === "critical" ? "border-red-200 dark:border-red-900/50" : rec.priority === "high" ? "border-amber-200 dark:border-amber-900/50" : "border-border",
      )}>
      <div className="flex items-start gap-4">
        <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border", cfg.bg)}>
          <Icon className={cn("h-5 w-5", cfg.color)} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <p className={cn("text-sm font-semibold text-foreground", done && "line-through")}>{rec.title}</p>
            <StatusBadge variant={PRIORITY_BADGE[rec.priority]} size="xs" dot>
              {rec.priority.charAt(0).toUpperCase() + rec.priority.slice(1)}
            </StatusBadge>
            <span className="rounded-full border border-border bg-muted px-2 py-0.5 text-2xs capitalize text-muted-foreground">{rec.category}</span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">{rec.description}</p>
          <div className="flex flex-wrap items-center gap-3 mt-3">
            <div className="flex items-start gap-2 flex-1 rounded-lg bg-muted/50 px-3 py-2 text-xs">
              <ArrowRight className="h-3.5 w-3.5 shrink-0 mt-0.5 text-[hsl(var(--primary))]" />
              <span className="text-foreground">{rec.suggestedAction}</span>
            </div>
            {rec.deadline && (
              <div className="flex items-center gap-1.5 text-2xs text-muted-foreground shrink-0">
                <Clock className="h-3 w-3" />
                <span className={cn(rec.deadline === "Overdue" && "text-red-500 font-semibold")}>{rec.deadline}</span>
              </div>
            )}
          </div>
        </div>
        <button onClick={() => onToggle(rec.id)}
          className={cn(
            "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border transition-all",
            done ? "border-emerald-300 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600" : "border-border hover:border-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 text-muted-foreground hover:text-emerald-600",
          )}
          title={done ? "Mark as pending" : "Mark as done"}>
          <CheckCircle2 className="h-4 w-4" />
        </button>
      </div>
    </motion.div>
  );
}

function SelectFilter({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: { v: string; l: string }[] }) {
  return (
    <div className="relative flex items-center">
      <Filter className="pointer-events-none absolute left-2.5 h-3.5 w-3.5 text-muted-foreground" />
      <select value={value} onChange={e => onChange(e.target.value)}
        className="h-9 rounded-lg border border-border bg-card pl-8 pr-7 text-xs focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))] appearance-none dark:bg-slate-900 dark:text-white"
        aria-label={label}>
        {options.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2 h-3 w-3 text-muted-foreground" />
    </div>
  );
}
