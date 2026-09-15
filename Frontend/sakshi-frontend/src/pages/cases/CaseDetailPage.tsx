import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft, ExternalLink,
  MapPin, Calendar, User, FileText, AlertTriangle,
  CheckCircle2, Clock, ChevronRight, Shield,
} from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatusBadge } from "@/components/ui/feedback/StatusBadge";
import { Avatar } from "@/components/ui/feedback/Avatar";
import { ProgressBar } from "@/components/ui/feedback/ProgressBar";
import { cn } from "@/lib/utils";
import { caseService } from "@/services/caseService";
import { ROUTES } from "@/router/routes";
import { STATUS_LABEL, STATUS_BADGE, PRIORITY_LABEL, PRIORITY_BADGE, CRIME_LABEL } from "@/utils/case.utils";
import { formatDate, formatRelativeTime } from "@/utils/format";
import { WorkflowTab } from "./components/WorkflowTab";
import { DocumentsTab } from "./components/DocumentsTab";
import { WorkflowGraphTab } from "./components/WorkflowGraphTab";
import { OfficerAssignPanel } from "./components/OfficerAssignPanel";
import { LiveRiskDashboard } from "./components/LiveRiskDashboard";
import { RiskHistoryChart } from "./components/RiskHistoryChart";
import { EarlyWarningBanner } from "./components/EarlyWarningBanner";
import type { InvestigationCase } from "@/types/case.types";

const TABS = ["Overview","Workflow","Graph","Documents","History","Procedural Risk"] as const;
type Tab = typeof TABS[number];

export default function CaseDetailPage() {
  const { caseId } = useParams<{ caseId: string }>();
  const navigate   = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>("Overview");
  const [caseData, setCaseData]   = useState<InvestigationCase>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAssign, setShowAssign] = useState(false);

  useEffect(() => {
    if (!caseId) return;
    setLoading(true);
    caseService.getById(caseId)
      .then(response => setCaseData(response.data))
      .catch((err: { message?: string; statusCode?: number }) => {
        setError(err.statusCode === 401 ? "Your session has expired. Please sign in again." : err.statusCode === 403 ? "You are not authorized to view this case." : err.statusCode === 404 ? "Case not found." : err.message ?? "Unable to load this case from the backend.");
      })
      .finally(() => setLoading(false));
  }, [caseId]);

  if (loading) {
    return <DashboardLayout><div className="py-16 text-center text-sm text-muted-foreground">Loading live case…</div></DashboardLayout>;
  }

  if (!caseData || error) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
          <AlertTriangle className="h-12 w-12 text-amber-400" />
          <p className="text-lg font-semibold text-foreground">{error ?? "Case not found"}</p>
          <button onClick={() => navigate(ROUTES.CASES)} className="text-sm text-[hsl(var(--primary))] hover:underline">← Back to Cases</button>
        </div>
      </DashboardLayout>
    );
  }

  const officer = caseData.assignedOfficer ? {
    id: caseData.assignedOfficerId,
    name: caseData.assignedOfficer,
    designation: "Assigned Officer",
    station: caseData.assignedStation,
    badge: "",
    phone: "",
    email: "",
    department: "police" as const,
    activeCases: 0,
  } : undefined;
  const progress = Math.round((caseData.currentStageOrder / caseData.totalStages) * 100);

  return (
    <DashboardLayout>
      <div className="space-y-5">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <button onClick={() => navigate(ROUTES.CASES)} className="hover:text-foreground flex items-center gap-1 transition-colors">
            <ArrowLeft className="h-3.5 w-3.5" /> Cases
          </button>
          <ChevronRight className="h-3 w-3" />
          <span className="font-mono font-semibold text-foreground">{caseData.caseNumber}</span>
        </div>

        {/* Phase 7D Early Warning Intelligence Banner */}
        <EarlyWarningBanner
          caseId={caseData.id}
          onNavigateTab={(tab) => setActiveTab(tab === "risk" ? "Procedural Risk" : "Workflow")}
        />

        {/* Header card */}
        <motion.div initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} className="rounded-xl border border-border bg-card p-5 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-sm font-bold text-[hsl(var(--primary))]">{caseData.caseNumber}</span>
                <StatusBadge variant={PRIORITY_BADGE[caseData.priority]} size="xs" dot>{PRIORITY_LABEL[caseData.priority]}</StatusBadge>
                <StatusBadge variant={STATUS_BADGE[caseData.status]} size="xs" dot>{STATUS_LABEL[caseData.status]}</StatusBadge>
              </div>
              <h1 className="text-xl font-bold text-foreground">{CRIME_LABEL[caseData.crimeType]}</h1>
              <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{caseData.incidentLocation}</span>
                <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" />Incident: {formatDate(caseData.incidentDate)}</span>
                <span className="flex items-center gap-1"><FileText className="h-3.5 w-3.5" />FIR: {caseData.firNumber}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setShowAssign(true)} className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-2 text-xs font-medium hover:bg-muted transition-colors">
                <User className="h-3.5 w-3.5" /> Assign Officer
              </button>
            </div>
          </div>

          {/* Progress */}
          <div className="mt-5 space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-foreground">{caseData.currentStage}</span>
              <span className="text-muted-foreground">{caseData.currentStageOrder} of {caseData.totalStages} stages</span>
            </div>
            <ProgressBar value={progress} color={caseData.priority === "critical" ? "danger" : caseData.priority === "high" ? "warning" : "primary"} size="md" />
          </div>
        </motion.div>

        <div className="flex flex-wrap items-center gap-2 rounded-xl border border-border bg-card p-3">
          <span className="mr-2 text-xs font-semibold text-muted-foreground">Case workspace</span>
          {[
            ["Workflow", () => setActiveTab("Workflow" as Tab)],
            ["Procedural Graph", () => setActiveTab("Graph" as Tab)],
            ["Evidence", () => setActiveTab("Documents" as Tab)],
            ["Risk", () => setActiveTab("Procedural Risk" as Tab)],
            ["Audit Trail", () => navigate(ROUTES.AUDIT)],
            ["AI Assistant", () => navigate(ROUTES.AI_ASSISTANT)],
          ].map(([label, action]) => (
            <button key={label as string} onClick={action as () => void} className="inline-flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
              {label as string}<ExternalLink className="h-3 w-3" />
            </button>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-0 overflow-x-auto no-scrollbar border-b border-border">
          {TABS.map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={cn("flex items-center gap-1.5 whitespace-nowrap px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px",
                activeTab === tab ? "border-[hsl(var(--primary))] text-[hsl(var(--primary))]" : "border-transparent text-muted-foreground hover:text-foreground")}>
              {tab === "Procedural Risk" && <Shield className="h-3.5 w-3.5" />}
              {tab}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <motion.div key={activeTab} initial={{ opacity:0, y:6 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.2 }}>
          {activeTab === "Overview"    && <OverviewTab c={caseData} officer={officer} />}
          {activeTab === "Workflow"    && <WorkflowTab caseData={caseData} onUpdate={setCaseData} />}
          {activeTab === "Graph"       && <WorkflowGraphTab caseData={caseData} />}
          {activeTab === "Documents"   && <DocumentsTab documents={caseData.documents} />}
          {activeTab === "History"     && <HistoryTab caseData={caseData} />}
          {activeTab === "Procedural Risk" && (
            <div className="space-y-6">
              <LiveRiskDashboard caseId={caseData.id} />
              <RiskHistoryChart caseId={caseData.id} />
            </div>
          )}
        </motion.div>
      </div>

      <OfficerAssignPanel open={showAssign} onClose={() => setShowAssign(false)}
        currentOfficerId={caseData.assignedOfficerId}
        onAssign={(officer) => { setCaseData(prev => prev ? { ...prev, assignedOfficerId: officer.id, assignedOfficer: officer.name } : prev); setShowAssign(false); }} />
    </DashboardLayout>
  );
}

// ─── Overview Tab ─────────────────────────────────────────────────────────────
function OverviewTab({ c, officer }: { c: InvestigationCase; officer?: {
  name: string;
  designation: string;
  station: string;
  badge: string;
  phone: string;
  department: string;
  activeCases: number;
} }) {
  const infoItems = [
    { label: "Case Number",    value: c.caseNumber },
    { label: "FIR Number",     value: c.firNumber },
    { label: "Crime Type",     value: CRIME_LABEL[c.crimeType] },
    { label: "Victim Code",    value: c.victimCode },
    { label: "Victim Age",     value: `${c.victimAge} years, ${c.victimGender === "F" ? "Female" : "Male"}` },
    { label: "Incident Date",  value: formatDate(c.incidentDate) },
    { label: "Location",       value: c.incidentLocation },
    { label: "District",       value: `${c.district}, ${c.state}` },
    { label: "Created",        value: formatDate(c.createdAt) },
    { label: "Last Updated",   value: formatRelativeTime(c.updatedAt) },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div className="lg:col-span-2 space-y-4">
        <div className="rounded-xl border border-border bg-card p-5">
          <p className="text-sm font-semibold text-foreground mb-4">Case Information</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6">
            {infoItems.map(item => (
              <div key={item.label}>
                <p className="text-2xs font-semibold uppercase tracking-widest text-muted-foreground mb-0.5">{item.label}</p>
                <p className="text-sm font-medium text-foreground">{item.value}</p>
              </div>
            ))}
          </div>
          {c.remarks && (
            <div className="mt-4 pt-4 border-t border-border">
              <p className="text-2xs font-semibold uppercase tracking-widest text-muted-foreground mb-1">Remarks</p>
              <p className="text-sm text-foreground">{c.remarks}</p>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-4">
        {/* Assigned Officer */}
        <div className="rounded-xl border border-border bg-card p-5">
          <p className="text-sm font-semibold text-foreground mb-4">Assigned Officer</p>
          {officer ? (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Avatar name={officer.name} size="lg" online />
                <div>
                  <p className="text-sm font-semibold text-foreground">{officer.name}</p>
                  <p className="text-xs text-muted-foreground">{officer.designation}</p>
                  <StatusBadge variant="primary" size="xs" className="mt-1 capitalize">{officer.department}</StatusBadge>
                </div>
              </div>
              <div className="space-y-2 pt-2 border-t border-border text-xs">
                {[
                  { label: "Station",      value: officer.station },
                  { label: "Badge",        value: officer.badge },
                  { label: "Phone",        value: officer.phone },
                  { label: "Active Cases", value: `${officer.activeCases} cases` },
                ].map(r => (
                  <div key={r.label} className="flex justify-between">
                    <span className="text-muted-foreground">{r.label}</span>
                    <span className="font-medium text-foreground">{r.value}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No officer assigned</p>
          )}
        </div>

        {/* Stage summary */}
        <div className="rounded-xl border border-border bg-card p-5">
          <p className="text-sm font-semibold text-foreground mb-3">Stage Summary</p>
          <div className="space-y-2">
            {c.workflow.slice(0,5).map(stage => (
              <div key={stage.id} className="flex items-center gap-2.5">
                <div className={cn("h-5 w-5 rounded-full flex items-center justify-center shrink-0",
                  stage.status==="completed" ? "bg-emerald-100 dark:bg-emerald-950/40" :
                  stage.status==="in_progress" ? "bg-royal-100 dark:bg-royal-950/40" : "bg-muted")}>
                  {stage.status==="completed" ? <CheckCircle2 className="h-3 w-3 text-emerald-600" /> :
                   stage.status==="in_progress" ? <Clock className="h-3 w-3 text-royal-600" /> :
                   <div className="h-2 w-2 rounded-full bg-muted-foreground/30" />}
                </div>
                <p className={cn("text-xs truncate", stage.status==="completed" ? "text-foreground" : "text-muted-foreground")}>{stage.title}</p>
              </div>
            ))}
            {c.workflow.length > 5 && <p className="text-2xs text-muted-foreground pl-7">+{c.workflow.length-5} more stages</p>}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── History Tab ──────────────────────────────────────────────────────────────
function HistoryTab({ caseData }: { caseData: InvestigationCase }) {
  const events = caseData.workflow.filter(s => s.status === "completed").map(s => ({
    title: s.title,
    by: s.officer ?? "—",
    date: s.completedDate ?? "",
    remarks: s.remarks ?? "",
  })).reverse();

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <p className="text-sm font-semibold text-foreground mb-5">Case History</p>
      {events.length === 0 ? (
        <p className="text-sm text-muted-foreground">No completed stages yet.</p>
      ) : (
        <div className="relative pl-6">
          <div className="absolute left-2 top-0 bottom-0 w-0.5 bg-border" />
          <div className="space-y-6">
            {events.map((e, i) => (
              <motion.div key={i} initial={{ opacity:0, x:-8 }} animate={{ opacity:1, x:0 }} transition={{ delay: i*0.07 }} className="relative">
                <div className="absolute -left-6 top-1 h-4 w-4 rounded-full border-2 border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center">
                  <CheckCircle2 className="h-2.5 w-2.5 text-emerald-600" />
                </div>
                <div className="rounded-lg border border-border bg-muted/30 p-3.5">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-semibold text-foreground">{e.title}</p>
                    <p className="text-2xs text-muted-foreground shrink-0">{e.date ? formatDate(e.date) : "—"}</p>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">By: {e.by}</p>
                  {e.remarks && <p className="text-xs text-foreground/70 mt-1.5 italic">"{e.remarks}"</p>}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
