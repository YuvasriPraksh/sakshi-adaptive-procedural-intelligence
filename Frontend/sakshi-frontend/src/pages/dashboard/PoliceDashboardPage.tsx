import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Shield, FolderOpen, Clock, CheckCircle2, ArrowRight, AlertTriangle } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatusBadge }     from "@/components/ui/feedback/StatusBadge";
import { ProgressBar }     from "@/components/ui/feedback/ProgressBar";
import { CASES }           from "@/data/cases.data";
import { ROUTES }          from "@/router/routes";
import { formatRelativeTime } from "@/utils/format";
import { cn } from "@/lib/utils";

const myCases = CASES.filter(c => c.assignedOfficer.includes("Rajan") || c.assignedOfficer.includes("Priya")).slice(0, 5);

export default function PoliceDashboardPage() {
  const navigate = useNavigate();
  const stats = [
    { label:"My Active Cases",  value:8,  icon:FolderOpen,   color:"text-royal-600",   bg:"bg-royal-50 dark:bg-royal-950/40",   change:"+2" },
    { label:"Pending Stages",   value:12, icon:Clock,        color:"text-amber-600",   bg:"bg-amber-50 dark:bg-amber-950/40",   change:"3 overdue" },
    { label:"Completed (30d)",  value:5,  icon:CheckCircle2, color:"text-emerald-600", bg:"bg-emerald-50 dark:bg-emerald-950/40",change:"+1" },
    { label:"Escalated",        value:1,  icon:AlertTriangle,color:"text-red-600",     bg:"bg-red-50 dark:bg-red-950/40",       change:"Action needed" },
  ];
  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-[1200px] mx-auto">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-royal-100 dark:bg-royal-950/40"><Shield className="h-6 w-6 text-royal-600" /></div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Police Dashboard</h1>
              <p className="text-sm text-muted-foreground">South Delhi Police Station · POCSO Unit</p>
            </div>
          </div>
          <button onClick={() => navigate(ROUTES.CASES)}
            className="inline-flex items-center gap-2 rounded-lg bg-[hsl(var(--primary))] px-4 py-2 text-xs font-bold text-white hover:bg-[hsl(var(--primary))]/90 transition-colors">
            <FolderOpen className="h-3.5 w-3.5" /> My Cases
          </button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((s, i) => (
            <motion.div key={s.label} initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay:i*0.07 }}
              className="rounded-xl border border-border bg-card p-4">
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className={cn("flex h-8 w-8 items-center justify-center rounded-lg", s.bg)}>
                  <s.icon className={cn("h-4 w-4", s.color)} />
                </div>
                <span className="text-2xs text-muted-foreground">{s.change}</span>
              </div>
              <p className="text-2xl font-bold text-foreground">{s.value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
            </motion.div>
          ))}
        </div>

        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <p className="text-sm font-semibold text-foreground">My Assigned Cases</p>
            <button onClick={() => navigate(ROUTES.CASES)} className="text-xs text-[hsl(var(--primary))] hover:underline flex items-center gap-1">All cases <ArrowRight className="h-3 w-3" /></button>
          </div>
          <div className="divide-y divide-border">
            {myCases.map(c => (
              <div key={c.id} onClick={() => navigate(`/cases/${c.id}`)}
                className="flex items-center gap-4 px-5 py-3.5 hover:bg-muted/40 transition-colors cursor-pointer">
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-mono font-semibold text-[hsl(var(--primary))]">{c.caseNumber.split("/").pop()}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{c.district}, {c.state}</p>
                </div>
                <div className="hidden sm:block w-32">
                  <p className="text-2xs text-muted-foreground mb-1">{c.currentStage}</p>
                  <ProgressBar value={(c.currentStageOrder / c.totalStages) * 100} size="xs" color="primary" />
                </div>
                <StatusBadge variant={c.priority === "critical" ? "danger" : c.priority === "high" ? "warning" : "primary"} size="xs">{c.priority}</StatusBadge>
                <span className="text-2xs text-muted-foreground whitespace-nowrap">{formatRelativeTime(c.updatedAt)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
