import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Building2, FileText, Clock, CheckCircle2, ArrowRight, AlertTriangle } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatusBadge }     from "@/components/ui/feedback/StatusBadge";
import { CASES }           from "@/data/cases.data";
import { ROUTES }          from "@/router/routes";
import { cn } from "@/lib/utils";

const pendingExams = CASES.filter(c => c.currentStage.includes("Medical") || c.currentStageOrder < 5).slice(0, 4);

export default function HospitalDashboardPage() {
  const navigate = useNavigate();
  const medicalReports = CASES.flatMap(c => c.documents).filter(d => d.type === "medical_report").length;
  const priorityExams = pendingExams.filter(c => c.priority === "critical").length;
  const stats = [
    { label:"Pending Examinations", value:pendingExams.length, icon:Clock, color:"text-amber-600", bg:"bg-amber-50 dark:bg-amber-950/40" },
    { label:"Medical Reports", value:medicalReports, icon:FileText, color:"text-royal-600", bg:"bg-royal-50 dark:bg-royal-950/40" },
    { label:"Completed Cases", value:CASES.filter(c => c.status === "completed").length, icon:CheckCircle2, color:"text-emerald-600", bg:"bg-emerald-50 dark:bg-emerald-950/40" },
    { label:"Priority Examinations", value:priorityExams, icon:AlertTriangle, color:"text-red-600", bg:"bg-red-50 dark:bg-red-950/40" },
  ];
  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-[1200px] mx-auto">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-950/40"><Building2 className="h-6 w-6 text-emerald-600" /></div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Hospital Dashboard</h1>
              <p className="text-sm text-muted-foreground">AIIMS Delhi · POCSO Medical Unit</p>
            </div>
          </div>
          <button onClick={() => navigate(ROUTES.DOCUMENTS)}
            className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 px-4 py-2 text-xs font-bold text-white transition-colors">
            <FileText className="h-3.5 w-3.5" /> Review Medical Reports
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
            <p className="text-sm font-semibold text-foreground">Pending Medical Examinations</p>
            <button onClick={() => navigate(ROUTES.CASES)} className="text-xs text-[hsl(var(--primary))] hover:underline flex items-center gap-1">View all <ArrowRight className="h-3 w-3" /></button>
          </div>
          <div className="divide-y divide-border">
            {pendingExams.map(c => (
              <button key={c.id} onClick={() => navigate(`/cases/${c.id}`)} className="flex w-full items-center gap-4 px-5 py-3.5 text-left hover:bg-muted/40 transition-colors">
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-mono font-semibold text-[hsl(var(--primary))]">{c.caseNumber.split("/").pop()}</p>
                  <p className="text-xs text-muted-foreground">{c.district} · Stage {c.currentStageOrder}/{c.totalStages}</p>
                </div>
                <StatusBadge variant={c.priority === "critical" ? "danger" : "warning"} size="xs" dot>{c.priority}</StatusBadge>
              </button>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
