import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ShieldAlert, Activity, TrendingUp, AlertTriangle, CheckCircle2, 
  Clock, ArrowRight, BrainCircuit, Workflow, Lock, ShieldCheck, FileCheck, XCircle, ChevronRight, HelpCircle
} from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatusBadge } from "@/components/ui/feedback/StatusBadge";
import { cn } from "@/lib/utils";
import { formatRelativeTime } from "@/utils/format";
import { ROUTES } from "@/router/routes";
import { CASES } from "@/data/cases.data";

// Extracted AI Insight mock data (Assuming it comes from AI integration or mocked if not in case data)
const AI_INSIGHT = {
  issue: "FSL Report Delay Detected",
  impact: "Delayed medical forensics blocks the 'Court Submission' stage and risks exceeding the 60-day POCSO mandate.",
  recommendation: "Issue urgent request to FSL Director citing Case SAKSHI/2024/001835 priority.",
  caseRef: "SAKSHI/2024/001835"
};

const RECENT_ACTIVITY = [
  { id: 1, user: "Investigating Officer", role: "IO", action: "FIR Registered and uploaded", time: new Date(Date.now() - 3600000), status: "success" },
  { id: 2, user: "Medical Officer", role: "Hospital", action: "Medical examination report pending", time: new Date(Date.now() - 7200000), status: "pending" },
  { id: 3, user: "CWC Member", role: "CWC", action: "Child counselling session scheduled", time: new Date(Date.now() - 86400000), status: "info" },
];

export default function DashboardPage() {
  const navigate = useNavigate();

  // Metrics calculation
  const metrics = useMemo(() => {
    const active = CASES.filter(c => c.status === "in_progress").length;
    const pending = CASES.filter(c => c.status === "pending" || c.status === "under_review").length;
    const critical = CASES.filter(c => c.priority === "critical").length;
    
    // Calculate overall progress based on stages
    const totalProgress = CASES.reduce((acc, c) => acc + (c.currentStageOrder / c.totalStages), 0);
    const avgProgress = CASES.length ? Math.round((totalProgress / CASES.length) * 100) : 0;

    return { active, pending, critical, avgProgress };
  }, []);

  // Priority Actions
  const priorityActions = useMemo(() => {
    return CASES.filter(c => c.priority === "critical" || c.status === "escalated").slice(0, 4);
  }, []);

  // Bottleneck case
  const bottleneckCase = useMemo(() => {
    return CASES.find(c => c.status === "escalated") || CASES.find(c => c.priority === "critical");
  }, []);

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-[1600px] mx-auto animate-in fade-in duration-500">
        
        {/* 1. TOP HEADER */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border pb-4">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-royal-950/50 border border-royal-800 text-royal-300 text-xs font-mono mb-3">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>ROLE: INVESTIGATING OFFICER</span>
            </div>
            <h1 className="text-3xl font-bold text-foreground tracking-tight flex items-center gap-3">
              INVESTIGATION COMMAND CENTER
            </h1>
            <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
              Monitor procedural progress, dependencies, deadlines and next actions from one unified workspace.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <button onClick={() => navigate(ROUTES.CASES)}
              className="inline-flex items-center gap-2 rounded-lg bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))]/90 px-4 py-2.5 text-sm font-semibold text-white transition-all shadow-[0_0_15px_rgba(14,165,233,0.3)] hover:shadow-[0_0_20px_rgba(14,165,233,0.5)]">
              <Lock className="h-4 w-4" /> Secure Action
            </button>
          </div>
        </div>

        {/* 2. EXECUTIVE OVERVIEW */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "ACTIVE CASES", value: metrics.active, icon: Activity, color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20" },
            { label: "PENDING OBLIGATIONS", value: metrics.pending, icon: Clock, color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20" },
            { label: "CRITICAL DEADLINES", value: metrics.critical, icon: AlertTriangle, color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/20" },
            { label: "INVESTIGATION PROGRESS", value: `${metrics.avgProgress}%`, icon: TrendingUp, color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
          ].map((stat, i) => (
            <motion.div key={stat.label}
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
              className={cn("rounded-xl border bg-card p-5 relative overflow-hidden group", stat.border)}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{stat.label}</p>
                  <p className="mt-2 text-3xl font-bold text-foreground font-mono">{stat.value}</p>
                </div>
                <div className={cn("p-2.5 rounded-lg", stat.bg)}>
                  <stat.icon className={cn("h-5 w-5", stat.color)} />
                </div>
              </div>
              {/* Subtle background glow effect */}
              <div className={cn("absolute -bottom-6 -right-6 h-24 w-24 rounded-full blur-2xl opacity-20 group-hover:opacity-30 transition-opacity", stat.bg)} />
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Main Column */}
          <div className="xl:col-span-2 space-y-6">
            
            {/* 3. INVESTIGATION PROGRESS & 7. MINI D-POG PREVIEW */}
            <div className="rounded-xl border border-border bg-card p-5 relative overflow-hidden">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <Workflow className="h-4 w-4 text-[hsl(var(--primary))]" /> 
                    DYNAMIC PROCEDURAL OBLIGATION GRAPH (D-POG)
                  </h2>
                  <p className="text-xs text-muted-foreground mt-1">Real-time mapping of procedural stages and dependencies.</p>
                </div>
                <button onClick={() => navigate(ROUTES.GRAPH)}
                  className="text-xs font-medium text-[hsl(var(--primary))] hover:text-[hsl(var(--primary))]/80 flex items-center gap-1 group">
                  OPEN FULL D-POG <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>

              {/* Simplified visual timeline/graph */}
              <div className="relative py-4 overflow-x-auto hide-scrollbar">
                <div className="min-w-[500px]">
                  <div className="absolute top-1/2 left-8 right-8 h-0.5 bg-border -translate-y-1/2 z-0" />
                  <div className="relative z-10 flex justify-between items-center px-4">
                    {[
                      { label: "FIR", status: "completed", icon: FileCheck },
                      { label: "STATEMENT", status: "completed", icon: FileCheck },
                      { label: "MEDICAL", status: "current", icon: Activity },
                      { label: "FSL", status: "blocked", icon: ShieldAlert },
                      { label: "CWC", status: "pending", icon: Clock },
                    ].map((step) => (
                      <div key={step.label} className="flex flex-col items-center gap-2 group relative bg-card px-2">
                        <div className={cn(
                          "h-10 w-10 rounded-full flex items-center justify-center border-2 bg-card transition-colors z-10",
                          step.status === "completed" ? "border-emerald-500 text-emerald-500" :
                          step.status === "current" ? "border-[hsl(var(--primary))] text-[hsl(var(--primary))] shadow-[0_0_10px_rgba(14,165,233,0.3)]" :
                          step.status === "blocked" ? "border-red-500 text-red-500" :
                          "border-muted-foreground/30 text-muted-foreground"
                        )}>
                          <step.icon className="h-4 w-4" />
                        </div>
                        <span className={cn(
                          "text-xs font-bold tracking-wider whitespace-nowrap",
                          step.status === "current" ? "text-foreground" : "text-muted-foreground"
                        )}>{step.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="mt-6 pt-4 border-t border-border flex flex-wrap justify-between gap-4 text-xs text-muted-foreground font-medium">
                <span className="flex items-center gap-1.5"><div className="h-2 w-2 rounded-full bg-emerald-500" /> COMPLETED</span>
                <span className="flex items-center gap-1.5"><div className="h-2 w-2 rounded-full bg-[hsl(var(--primary))]" /> CURRENT</span>
                <span className="flex items-center gap-1.5"><div className="h-2 w-2 rounded-full bg-red-500" /> BLOCKED</span>
                <span className="flex items-center gap-1.5"><div className="h-2 w-2 rounded-full bg-muted-foreground" /> PENDING</span>
              </div>
            </div>

            {/* 4. PRIORITY ACTIONS */}
            <div className="rounded-xl border border-border bg-card p-5">
              <h2 className="text-sm font-semibold text-foreground mb-4">PRIORITY ACTIONS</h2>
              <div className="space-y-3">
                {priorityActions.map(action => (
                  <div key={action.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-lg border border-border bg-background hover:border-border/80 transition-colors">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5">
                        <StatusBadge variant={action.status === 'escalated' ? 'danger' : 'warning'} size="xs" dot>
                          {action.status.toUpperCase().replace('_', ' ')}
                        </StatusBadge>
                        <span className="text-xs font-mono text-[hsl(var(--primary))] truncate">{action.caseNumber}</span>
                      </div>
                      <p className="text-sm font-semibold text-foreground truncate">{action.currentStage} Pending</p>
                      <p className="text-xs text-muted-foreground mt-1 truncate">Responsible: <span className="text-foreground">{action.assignedOfficer}</span></p>
                    </div>
                    <div className="shrink-0 flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-3">
                      <span className={cn(
                        "text-xs font-medium flex items-center gap-1",
                        action.status === 'escalated' ? "text-red-400" : "text-amber-400"
                      )}>
                        <Clock className="h-3 w-3" /> {action.status === 'escalated' ? 'CRITICAL ACTION' : 'ACTION REQUIRED'}
                      </span>
                      <button onClick={() => navigate(`${ROUTES.CASES}/${action.id}`)}
                        className="text-xs font-semibold bg-secondary hover:bg-secondary/80 text-foreground px-3 py-1.5 rounded-md transition-colors">
                        Review Case
                      </button>
                    </div>
                  </div>
                ))}
                {priorityActions.length === 0 && (
                  <div className="text-center py-6 text-muted-foreground text-sm">
                    No priority actions at this time.
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* Right Column */}
          <div className="space-y-6">
            
            {/* 6. AI PROCEDURAL INSIGHT */}
            <div className="rounded-xl border border-royal-500/30 bg-gradient-to-b from-royal-950/40 to-background p-5 relative overflow-hidden shadow-[0_0_20px_rgba(99,102,241,0.05)]">
              <div className="absolute -top-4 -right-4 p-4 opacity-5">
                <BrainCircuit className="h-32 w-32 text-royal-500" />
              </div>
              <div className="relative z-10">
                <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-royal-500/10 border border-royal-500/20 text-royal-400 text-2xs font-bold tracking-wider mb-4">
                  <BrainCircuit className="h-3 w-3" /> AI PROCEDURAL INSIGHT
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">ISSUE DETECTED</h3>
                    <p className="text-sm font-medium text-red-400 flex items-start gap-1.5">
                      <XCircle className="h-4 w-4 mt-0.5 shrink-0" /> {AI_INSIGHT.issue}
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">WHY IT MATTERS</h3>
                    <p className="text-sm text-foreground/90 leading-relaxed">
                      {AI_INSIGHT.impact}
                    </p>
                  </div>
                  
                  <div className="bg-background rounded-lg p-3 border border-border">
                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">RECOMMENDED NEXT ACTION</h3>
                    <p className="text-sm text-foreground font-medium mb-3">
                      {AI_INSIGHT.recommendation}
                    </p>
                    <div className="flex gap-2">
                      <button className="flex-1 bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))]/90 text-white text-xs font-semibold py-2 px-3 rounded-md transition-colors shadow-sm">
                        TAKE ACTION
                      </button>
                      <button className="flex-1 bg-secondary hover:bg-secondary/80 text-foreground text-xs font-semibold py-2 px-3 rounded-md transition-colors">
                        EXPLANATION
                      </button>
                    </div>
                  </div>
                </div>
                <p className="text-2xs text-muted-foreground text-center mt-4 flex items-center justify-center gap-1">
                  <HelpCircle className="h-3 w-3" /> AI-generated recommendation. Verify before action.
                </p>
              </div>
            </div>

            {/* 5. PROCEDURAL BOTTLENECK */}
            {bottleneckCase && (
              <div className="rounded-xl border border-border bg-card p-5">
                <h2 className="text-sm font-semibold text-foreground mb-4">PROCEDURAL BOTTLENECK</h2>
                <div className="flex flex-col items-center">
                  <div className="w-full bg-background border border-red-500/30 rounded-lg p-3 text-center relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-red-500" />
                    <span className="text-xs font-bold text-red-400 block mb-1">BLOCKED OBLIGATION</span>
                    <span className="text-sm font-semibold text-foreground">{bottleneckCase.currentStage}</span>
                  </div>
                  
                  <div className="h-6 w-0.5 bg-border relative">
                    <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-center">
                      <ChevronRight className="h-3 w-3 text-muted-foreground rotate-90" />
                    </div>
                  </div>
                  
                  <div className="w-full bg-background border border-amber-500/30 rounded-lg p-3 text-center relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-amber-500" />
                    <span className="text-xs font-bold text-amber-400 block mb-1">DEPENDENCY</span>
                    <span className="text-sm font-medium text-foreground">Waiting on preceding stage completion</span>
                  </div>
                  
                  <div className="h-6 w-0.5 bg-border relative">
                    <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-center">
                      <ChevronRight className="h-3 w-3 text-muted-foreground rotate-90" />
                    </div>
                  </div>

                  <button className="w-full border border-border hover:border-royal-500/50 bg-background hover:bg-royal-500/10 text-foreground hover:text-royal-400 font-semibold text-xs py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2">
                    RESOLVE DEPENDENCY <ArrowRight className="h-3 w-3" />
                  </button>
                </div>
              </div>
            )}

            {/* 8. RECENT ACTIVITY */}
            <div className="rounded-xl border border-border bg-card p-5">
              <h2 className="text-sm font-semibold text-foreground mb-4">RECENT ACTIVITY</h2>
              <div className="space-y-4">
                {RECENT_ACTIVITY.map((activity, i) => (
                  <div key={activity.id} className="flex gap-3 relative">
                    {i !== RECENT_ACTIVITY.length - 1 && (
                      <div className="absolute left-[15px] top-[30px] bottom-[-20px] w-[2px] bg-border" />
                    )}
                    <div className="shrink-0 mt-0.5 z-10">
                      <div className={cn(
                        "h-8 w-8 rounded-full flex items-center justify-center border-2 bg-card",
                        activity.status === "success" ? "border-emerald-500/50 text-emerald-500" :
                        activity.status === "pending" ? "border-amber-500/50 text-amber-500" :
                        "border-[hsl(var(--primary))]/50 text-[hsl(var(--primary))]"
                      )}>
                        {activity.status === "success" ? <CheckCircle2 className="h-4 w-4" /> :
                         activity.status === "pending" ? <Clock className="h-4 w-4" /> :
                         <Activity className="h-4 w-4" />}
                      </div>
                    </div>
                    <div className="flex-1 pb-1">
                      <p className="text-sm text-foreground font-medium leading-tight">{activity.action}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-muted-foreground font-medium">{activity.user}</span>
                        <span className="text-2xs text-muted-foreground/40">•</span>
                        <span className="text-xs text-muted-foreground">{formatRelativeTime(activity.time)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}
