import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { UserCog, AlertTriangle, BarChart3, FolderOpen, ArrowRight, CheckCircle2 } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatusBadge }     from "@/components/ui/feedback/StatusBadge";
import { ProgressBar }     from "@/components/ui/feedback/ProgressBar";
import { CASES }           from "@/data/cases.data";
import { ROUTES }          from "@/router/routes";
import { cn } from "@/lib/utils";

const escalated = CASES.filter(c => c.status === "escalated" || c.priority === "critical").slice(0, 5);

export default function SupervisorDashboardPage() {
  const navigate = useNavigate();
  const stats = [
    { label:"Total Active Cases",  value:53,  icon:FolderOpen,   color:"text-royal-600",   bg:"bg-royal-50   dark:bg-royal-950/40"  },
    { label:"Escalated",           value:8,   icon:AlertTriangle,color:"text-red-600",     bg:"bg-red-50     dark:bg-red-950/40"    },
    { label:"SLA Compliant",       value:"78%",icon:CheckCircle2,color:"text-emerald-600", bg:"bg-emerald-50 dark:bg-emerald-950/40"},
    { label:"Awaiting Review",     value:12,  icon:BarChart3,    color:"text-amber-600",   bg:"bg-amber-50   dark:bg-amber-950/40"  },
  ];
  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-[1200px] mx-auto">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-navy-100 dark:bg-navy-950/40"><UserCog className="h-6 w-6 text-navy-600" /></div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Supervisor Dashboard</h1>
              <p className="text-sm text-muted-foreground">Multi-district oversight · POCSO Supervisor</p>
            </div>
          </div>
          <button onClick={() => navigate(ROUTES.ANALYTICS)}
            className="inline-flex items-center gap-2 rounded-lg bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))]/90 px-4 py-2 text-xs font-bold text-white transition-colors">
            <BarChart3 className="h-3.5 w-3.5" /> Analytics
          </button>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((s, i) => (
            <motion.div key={s.label} initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay:i*0.07 }}
              className="rounded-xl border border-border bg-card p-4">
              <div className={cn("flex h-9 w-9 items-center justify-center rounded-xl mb-3", s.bg)}>
                <s.icon className={cn("h-4 w-4", s.color)} />
              </div>
              <p className="text-2xl font-bold text-foreground">{s.value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
            </motion.div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <p className="text-sm font-semibold text-foreground">Escalated / Critical Cases</p>
              <button onClick={() => navigate(ROUTES.CASES)} className="text-xs text-[hsl(var(--primary))] hover:underline flex items-center gap-1">All <ArrowRight className="h-3 w-3" /></button>
            </div>
            <div className="divide-y divide-border">
              {escalated.map(c => (
                <div key={c.id} onClick={() => navigate(`/cases/${c.id}`)}
                  className="flex items-center gap-3 px-5 py-3 hover:bg-muted/40 transition-colors cursor-pointer">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-mono font-semibold text-[hsl(var(--primary))]">{c.caseNumber.split("/").pop()}</p>
                    <p className="text-xs text-muted-foreground">{c.district} · {c.assignedOfficer}</p>
                  </div>
                  <StatusBadge variant="danger" size="xs" dot>{c.status === "escalated" ? "Escalated" : "Critical"}</StatusBadge>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-xl border border-border bg-card p-5">
            <p className="text-sm font-semibold text-foreground mb-4">SLA Compliance by Stage</p>
            <div className="space-y-3">
              {[
                { stage:"FIR Registration",    pct:91 },
                { stage:"Victim Statement",    pct:78 },
                { stage:"Medical Examination", pct:62 },
                { stage:"FSL Submission",      pct:83 },
                { stage:"Charge Sheet",        pct:94 },
              ].map(s => (
                <div key={s.stage} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">{s.stage}</span>
                    <span className={cn("font-semibold", s.pct >= 80 ? "text-emerald-600" : s.pct >= 60 ? "text-amber-600" : "text-red-500")}>{s.pct}%</span>
                  </div>
                  <ProgressBar value={s.pct} color={s.pct >= 80 ? "success" : s.pct >= 60 ? "warning" : "danger"} size="xs" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
