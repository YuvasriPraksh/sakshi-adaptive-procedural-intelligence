import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Network, ArrowLeft, ChevronDown } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { WorkflowGraphTab } from "@/pages/cases/components/WorkflowGraphTab";
import { StatusBadge }      from "@/components/ui/feedback/StatusBadge";
import { CASES }            from "@/data/cases.data";
import { ROUTES }           from "@/router/routes";
import { CRIME_LABEL, STATUS_BADGE, STATUS_LABEL } from "@/utils/case.utils";

export default function GraphPage() {
  const { caseId } = useParams<{ caseId: string }>();
  const navigate   = useNavigate();
  const [selected, setSelected] = useState(caseId ?? CASES[0].id);
  const caseData   = CASES.find(c => c.id === selected) ?? CASES[0];

  return (
    <DashboardLayout>
      <div className="space-y-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(ROUTES.CASES)}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-border hover:bg-muted transition-colors"
              aria-label="Back">
              <ArrowLeft className="h-4 w-4 text-muted-foreground" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                <Network className="h-5 w-5 text-[hsl(var(--primary))]" />
                Procedural Flow Graph
              </h1>
              <p className="text-sm text-muted-foreground mt-0.5">Visual investigation workflow with interactive nodes</p>
            </div>
          </div>
          <div className="relative">
            <select value={selected} onChange={e => setSelected(e.target.value)}
              className="h-9 min-w-64 rounded-lg border border-border bg-card pl-3 pr-8 text-xs focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))] appearance-none dark:bg-slate-900 dark:text-white"
              aria-label="Select case">
              {CASES.map(c => (
                <option key={c.id} value={c.id}>
                  {c.caseNumber.split("/").pop()} — {c.district}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3 rounded-xl border border-border bg-card px-5 py-3">
          <span className="font-mono text-sm font-bold text-[hsl(var(--primary))]">{caseData.caseNumber}</span>
          <span className="text-muted-foreground">·</span>
          <span className="text-sm text-foreground">{CRIME_LABEL[caseData.crimeType]}</span>
          <span className="text-muted-foreground">·</span>
          <StatusBadge variant={STATUS_BADGE[caseData.status]} size="xs" dot>{STATUS_LABEL[caseData.status]}</StatusBadge>
          <button onClick={() => navigate(`/cases/${caseData.id}`)}
            className="ml-auto rounded-lg border border-border px-3 py-1.5 text-xs font-medium hover:bg-muted transition-colors">
            Open Case →
          </button>
        </div>
        <WorkflowGraphTab caseData={caseData} />
      </div>
    </DashboardLayout>
  );
}
