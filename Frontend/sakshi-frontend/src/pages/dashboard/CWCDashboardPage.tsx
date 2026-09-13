import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Users, Heart, ClipboardList, CheckCircle2, ArrowRight } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatusBadge }     from "@/components/ui/feedback/StatusBadge";
import { CASES }           from "@/data/cases.data";
import { ROUTES }          from "@/router/routes";
import { cn } from "@/lib/utils";

export default function CWCDashboardPage() {
  const navigate = useNavigate();
  const stats = [
    { label:"Children in Care",    value:14, icon:Heart,        color:"text-pink-600",   bg:"bg-pink-50   dark:bg-pink-950/40"  },
    { label:"Pending Counselling", value:6,  icon:ClipboardList,color:"text-amber-600",  bg:"bg-amber-50  dark:bg-amber-950/40" },
    { label:"Sessions Completed",  value:28, icon:CheckCircle2, color:"text-emerald-600",bg:"bg-emerald-50 dark:bg-emerald-950/40"},
    { label:"Cases Assigned",      value:9,  icon:Users,        color:"text-royal-600",  bg:"bg-royal-50  dark:bg-royal-950/40" },
  ];
  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-[1200px] mx-auto">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-pink-100 dark:bg-pink-950/40"><Users className="h-6 w-6 text-pink-600" /></div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">CWC Dashboard</h1>
              <p className="text-sm text-muted-foreground">Child Welfare Committee · Karnataka</p>
            </div>
          </div>
          <button onClick={() => navigate(ROUTES.CASES)}
            className="inline-flex items-center gap-2 rounded-lg bg-pink-600 hover:bg-pink-700 px-4 py-2 text-xs font-bold text-white transition-colors">
            <ClipboardList className="h-3.5 w-3.5" /> Case Welfare Review
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
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-semibold text-foreground">Cases Requiring CWC Attention</p>
            <button onClick={() => navigate(ROUTES.CASES)} className="text-xs text-[hsl(var(--primary))] hover:underline flex items-center gap-1">All cases <ArrowRight className="h-3 w-3" /></button>
          </div>
          <div className="space-y-2">
            {CASES.filter(c => c.status === "in_progress" || c.status === "escalated").slice(0,5).map(c => (
              <div key={c.id} className="flex items-center gap-3 rounded-lg border border-border px-4 py-3 hover:bg-muted/40 transition-colors">
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-mono font-semibold text-[hsl(var(--primary))]">{c.caseNumber.split("/").pop()}</p>
                  <p className="text-xs text-muted-foreground">{c.district} · Victim age {c.victimAge}</p>
                </div>
                <StatusBadge variant={c.status === "escalated" ? "danger" : "warning"} size="xs" dot>{c.status.replace("_"," ")}</StatusBadge>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
