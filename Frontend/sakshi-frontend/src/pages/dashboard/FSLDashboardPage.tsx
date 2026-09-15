import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FlaskConical, TestTube2, Clock, CheckCircle2, ArrowRight } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatusBadge }     from "@/components/ui/feedback/StatusBadge";
import { CASES }           from "@/data/cases.data";
import { ROUTES }          from "@/router/routes";
import { cn } from "@/lib/utils";

export default function FSLDashboardPage() {
  const navigate = useNavigate();
  const fslCases = CASES.filter(c => c.currentStageOrder >= 5 && c.currentStageOrder <= 7);
  const fslReports = CASES.flatMap(c => c.documents).filter(d => d.type === "fsl_report").length;
  const stats = [
    { label:"Pending Analysis", value:fslCases.length, icon:Clock, color:"text-amber-600", bg:"bg-amber-50 dark:bg-amber-950/40" },
    { label:"FSL Reports", value:fslReports, icon:CheckCircle2, color:"text-emerald-600", bg:"bg-emerald-50 dark:bg-emerald-950/40" },
    { label:"Assigned Cases", value:fslCases.length, icon:TestTube2, color:"text-purple-600", bg:"bg-purple-50 dark:bg-purple-950/40" },
    { label:"Critical Pending", value:fslCases.filter(c => c.priority === "critical").length, icon:FlaskConical, color:"text-red-600", bg:"bg-red-50 dark:bg-red-950/40" },
  ];
  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-[1200px] mx-auto">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-100 dark:bg-purple-950/40"><FlaskConical className="h-6 w-6 text-purple-600" /></div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">FSL Dashboard</h1>
              <p className="text-sm text-muted-foreground">Forensic Science Laboratory · Hyderabad</p>
            </div>
          </div>
          <button onClick={() => navigate(ROUTES.DOCUMENTS)}
            className="inline-flex items-center gap-2 rounded-lg bg-purple-600 hover:bg-purple-700 px-4 py-2 text-xs font-bold text-white transition-colors">
            <CheckCircle2 className="h-3.5 w-3.5" /> Review FSL Reports
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
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <p className="text-sm font-semibold text-foreground">Cases Pending FSL Analysis</p>
            <button onClick={() => navigate(ROUTES.CASES)} className="text-xs text-[hsl(var(--primary))] hover:underline flex items-center gap-1">View all <ArrowRight className="h-3 w-3" /></button>
          </div>
          <div className="divide-y divide-border">
            {fslCases.slice(0,5).map(c => (
              <button key={c.id} onClick={() => navigate(`/cases/${c.id}`)} className="flex w-full items-center gap-4 px-5 py-3.5 text-left hover:bg-muted/40 transition-colors">
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-mono font-semibold text-[hsl(var(--primary))]">{c.caseNumber.split("/").pop()}</p>
                  <p className="text-xs text-muted-foreground">{c.currentStage} · {c.district}</p>
                </div>
                <StatusBadge variant={c.priority === "critical" ? "danger" : "warning"} size="xs">{c.priority}</StatusBadge>
              </button>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
