import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Shield, FolderOpen, Clock, ArrowRight, AlertTriangle, Workflow, BrainCircuit, Activity, ShieldAlert } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatusBadge }     from "@/components/ui/feedback/StatusBadge";
import { ProgressBar }     from "@/components/ui/feedback/ProgressBar";
import { CASES }           from "@/data/cases.data";
import { ROUTES }          from "@/router/routes";
import { formatRelativeTime } from "@/utils/format";
import { cn } from "@/lib/utils";

const myCases = CASES.filter(c => c.assignedOfficer.includes("Rajan") || c.assignedOfficer.includes("Priya")).slice(0, 5);
const activeCases = myCases.filter(c => !["completed", "closed"].includes(c.status));
const pendingObligations = activeCases.flatMap(c => c.workflow.filter(stage => stage.status !== "completed").map(stage => ({ caseItem: c, stage })));
const priorityActions = activeCases.filter(c => c.priority === "critical" || c.status === "escalated");
const riskCases = activeCases.filter(c => c.priority === "critical" || c.status === "escalated");

export default function PoliceDashboardPage() {
  const navigate = useNavigate();
  const stats = [
    { label:"My Active Cases", value:activeCases.length, icon:FolderOpen, color:"text-royal-600", bg:"bg-royal-50 dark:bg-royal-950/40" },
    { label:"Pending Obligations", value:pendingObligations.length, icon:Clock, color:"text-amber-600", bg:"bg-amber-50 dark:bg-amber-950/40" },
    { label:"Risk / Early Warnings", value:riskCases.length, icon:AlertTriangle, color:"text-red-600", bg:"bg-red-50 dark:bg-red-950/40" },
  ];
  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-[1200px] mx-auto">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-border pb-5">
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

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {stats.map((s, i) => (
            <motion.div key={s.label} initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay:i*0.07 }}
              className="rounded-xl border border-border bg-card p-4">
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className={cn("flex h-8 w-8 items-center justify-center rounded-lg", s.bg)}>
                  <s.icon className={cn("h-4 w-4", s.color)} />
                </div>
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

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <div>
                <p className="text-sm font-semibold text-foreground">Pending Procedural Obligations</p>
                <p className="text-xs text-muted-foreground mt-1">Next actions across assigned cases</p>
              </div>
              <Workflow className="h-4 w-4 text-amber-500" />
            </div>
            <div className="divide-y divide-border">
              {pendingObligations.slice(0, 5).map(({ caseItem, stage }) => (
                <button key={`${caseItem.id}-${stage.id}`} onClick={() => navigate(`/cases/${caseItem.id}`)} className="flex w-full items-center gap-3 px-5 py-3 text-left hover:bg-muted/40 transition-colors">
                  <Clock className="h-4 w-4 shrink-0 text-amber-500" />
                  <span className="flex-1 min-w-0"><span className="block text-xs font-semibold text-foreground truncate">{stage.title}</span><span className="block text-2xs text-muted-foreground">{caseItem.caseNumber}</span></span>
                  <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-center justify-between mb-4"><p className="text-sm font-semibold text-foreground">Priority Actions</p><AlertTriangle className="h-4 w-4 text-red-500" /></div>
            <div className="space-y-3">
              {priorityActions.slice(0, 4).map(c => <button key={c.id} onClick={() => navigate(`/cases/${c.id}`)} className="flex w-full items-center gap-3 rounded-lg border border-border p-3 text-left hover:bg-muted/40 transition-colors"><ShieldAlert className="h-4 w-4 shrink-0 text-red-500" /><span className="flex-1 min-w-0"><span className="block text-xs font-semibold truncate">{c.currentStage}</span><span className="block text-2xs text-muted-foreground truncate">{c.caseNumber} · {c.status}</span></span><ArrowRight className="h-3.5 w-3.5 text-muted-foreground" /></button>)}
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-center justify-between mb-4"><p className="text-sm font-semibold text-foreground">Procedural Risk</p><Activity className="h-4 w-4 text-red-500" /></div>
            <div className="space-y-3">
              {riskCases.slice(0, 4).map(c => <button key={c.id} onClick={() => navigate(`/cases/${c.id}`)} className="flex w-full items-center justify-between gap-3 rounded-lg bg-red-50/60 dark:bg-red-950/20 px-3 py-2.5 text-left hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"><span className="min-w-0"><span className="block text-xs font-semibold truncate">{c.caseNumber}</span><span className="block text-2xs text-muted-foreground truncate">{c.currentStage}</span></span><StatusBadge variant="danger" size="xs">{c.priority}</StatusBadge></button>)}
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-center gap-2 mb-3"><Workflow className="h-4 w-4 text-[hsl(var(--primary))]" /><p className="text-sm font-semibold">D-POG / Workflow</p></div>
            <p className="text-sm text-muted-foreground">Track procedural dependencies and open the full graph for an assigned case.</p>
            <button onClick={() => navigate(ROUTES.GRAPH)} className="mt-4 text-xs font-semibold text-[hsl(var(--primary))] hover:underline">Open procedural graph <ArrowRight className="inline h-3 w-3" /></button>
          </div>

          <div className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-center gap-2 mb-3"><BrainCircuit className="h-4 w-4 text-royal-500" /><p className="text-sm font-semibold">AI Procedural Insight</p></div>
            <p className="text-xs text-muted-foreground">Review the AI assistant for case-specific procedural guidance.</p>
            <button onClick={() => navigate(ROUTES.AI_ASSISTANT)} className="mt-4 text-xs font-semibold text-[hsl(var(--primary))] hover:underline">Open assistant <ArrowRight className="inline h-3 w-3" /></button>
          </div>

          <div className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-center gap-2 mb-3"><Activity className="h-4 w-4 text-emerald-500" /><p className="text-sm font-semibold">Recent Activity</p></div>
            <div className="space-y-3">
              {myCases.slice(0, 3).map(c => <button key={c.id} onClick={() => navigate(`/cases/${c.id}`)} className="flex w-full items-center gap-3 text-left"><span className="h-2 w-2 shrink-0 rounded-full bg-emerald-500" /><span className="min-w-0 flex-1"><span className="block text-xs truncate">{c.currentStage}</span><span className="block text-2xs text-muted-foreground truncate">{c.caseNumber} · {formatRelativeTime(c.updatedAt)}</span></span></button>)}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
