import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Network, ArrowLeft, ChevronDown, Sparkles } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { WorkflowGraphTab } from "@/pages/cases/components/WorkflowGraphTab";
import { StatusBadge } from "@/components/ui/feedback/StatusBadge";
import { CASES } from "@/data/cases.data";
import { ROUTES } from "@/router/routes";
import { CRIME_LABEL, STATUS_BADGE, STATUS_LABEL } from "@/utils/case.utils";

export default function GraphPage() {
  const { caseId } = useParams<{ caseId: string }>();
  const navigate = useNavigate();
  const [selected, setSelected] = useState(caseId ?? CASES[0].id);
  const caseData = CASES.find(c => c.id === selected) ?? CASES[0];

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-[1600px] mx-auto animate-in fade-in duration-500">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border pb-4">
          <div>
            <button onClick={() => navigate(ROUTES.CASES)}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground mb-4 transition-colors group">
              <ArrowLeft className="h-3.5 w-3.5 group-hover:-translate-x-0.5 transition-transform" /> Back to Cases
            </button>
            <div className="flex items-center gap-3 mb-3">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[hsl(var(--primary))]/10 border border-[hsl(var(--primary))]/20 text-[hsl(var(--primary))] text-xs font-bold tracking-wider">
                <Sparkles className="h-3.5 w-3.5" />
                CORE SAKSHI INNOVATION
              </div>
            </div>
            <h1 className="text-3xl font-bold text-foreground tracking-tight flex items-center gap-3">
              <Network className="h-8 w-8 text-[hsl(var(--primary))]" />
              DYNAMIC PROCEDURAL OBLIGATION GRAPH
            </h1>
            <p className="text-sm text-muted-foreground mt-2 max-w-2xl">
              Visualize procedural dependencies, identify bottlenecks and understand the next required action.
            </p>
          </div>

          <div className="flex flex-col gap-3 shrink-0 md:w-80">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Active Investigation</label>
            <div className="relative">
              <select value={selected} onChange={e => setSelected(e.target.value)}
                className="w-full h-11 rounded-lg border border-border bg-card pl-4 pr-10 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))] appearance-none shadow-sm transition-shadow cursor-pointer"
                aria-label="Select case">
                {CASES.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.caseNumber.split("/").pop()} — {c.victimCode}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            </div>
          </div>
        </div>

        {/* Case Context Bar */}
        <div className="flex flex-wrap items-center gap-4 rounded-xl border border-border bg-card px-5 py-3.5 shadow-sm">
          <span className="font-mono text-sm font-bold text-[hsl(var(--primary))]">{caseData.caseNumber}</span>
          <div className="w-1.5 h-1.5 rounded-full bg-border" />
          <span className="text-sm font-medium text-foreground">{CRIME_LABEL[caseData.crimeType]}</span>
          <div className="w-1.5 h-1.5 rounded-full bg-border" />
          <span className="text-sm text-muted-foreground">{caseData.district}</span>
          <div className="w-1.5 h-1.5 rounded-full bg-border" />
          <StatusBadge variant={STATUS_BADGE[caseData.status]} size="sm" dot>{STATUS_LABEL[caseData.status]}</StatusBadge>

          <button onClick={() => navigate(`/cases/${caseData.id}`)}
            className="ml-auto inline-flex items-center gap-1.5 rounded-lg bg-secondary hover:bg-secondary/80 text-foreground px-4 py-2 text-xs font-semibold transition-colors">
            Open Full Case File
          </button>
        </div>

        {/* Graph Workspace */}
        <WorkflowGraphTab caseData={caseData} />

      </div>
    </DashboardLayout>
  );
}
