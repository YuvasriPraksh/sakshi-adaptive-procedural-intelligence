import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { GitBranch, ArrowLeft, ChevronDown } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { WorkflowTab }     from "@/pages/cases/components/WorkflowTab";
import { StatusBadge }     from "@/components/ui/feedback/StatusBadge";
import { ProgressBar }     from "@/components/ui/feedback/ProgressBar";
import { CASES }           from "@/data/cases.data";
import { ROUTES }          from "@/router/routes";
import { STATUS_BADGE, STATUS_LABEL, PRIORITY_BADGE, PRIORITY_LABEL, CRIME_LABEL } from "@/utils/case.utils";
import type { InvestigationCase } from "@/types/case.types";

export default function TimelinePage() {
  const { caseId }   = useParams<{ caseId: string }>();
  const navigate     = useNavigate();
  const [selected,   setSelected]  = useState<string>(caseId ?? CASES[0].id);
  const [caseData,   setCaseData]  = useState<InvestigationCase>(
    () => CASES.find(c => c.id === selected) ?? CASES[0],
  );

  const handleSelect = (id: string) => {
    const c = CASES.find(c => c.id === id);
    if (c) { setSelected(id); setCaseData(c); }
  };

  const progress = Math.round((caseData.currentStageOrder / caseData.totalStages) * 100);

  return (
    <DashboardLayout>
      <div className="space-y-5">
        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(ROUTES.CASES)}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-border hover:bg-muted transition-colors"
              aria-label="Back to cases">
              <ArrowLeft className="h-4 w-4 text-muted-foreground" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                <GitBranch className="h-5 w-5 text-[hsl(var(--primary))]" />
                Investigation Timeline
              </h1>
              <p className="text-sm text-muted-foreground mt-0.5">Interactive procedural workflow for each case</p>
            </div>
          </div>

          {/* Case selector */}
          <div className="relative">
            <select value={selected} onChange={e => handleSelect(e.target.value)}
              className="h-9 min-w-64 rounded-lg border border-border bg-card pl-3 pr-8 text-xs focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))] appearance-none dark:bg-slate-900 dark:text-white"
              aria-label="Select case">
              {CASES.map(c => (
                <option key={c.id} value={c.id}>
                  {c.caseNumber.split("/").pop()} — {c.district} ({CRIME_LABEL[c.crimeType]})
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          </div>
        </div>

        {/* Case summary strip */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-border bg-card px-5 py-4 flex flex-wrap items-center gap-6">
          <div>
            <p className="text-xs text-muted-foreground">Case Number</p>
            <p className="text-sm font-bold font-mono text-[hsl(var(--primary))]">{caseData.caseNumber}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Crime Type</p>
            <p className="text-sm font-semibold text-foreground">{CRIME_LABEL[caseData.crimeType]}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Priority</p>
            <StatusBadge variant={PRIORITY_BADGE[caseData.priority]} size="xs" dot>
              {PRIORITY_LABEL[caseData.priority]}
            </StatusBadge>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Status</p>
            <StatusBadge variant={STATUS_BADGE[caseData.status]} size="xs" dot>
              {STATUS_LABEL[caseData.status]}
            </StatusBadge>
          </div>
          <div className="flex-1 min-w-48">
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-muted-foreground">{caseData.currentStage}</span>
              <span className="font-semibold text-foreground">{progress}%</span>
            </div>
            <ProgressBar value={progress} color={caseData.priority === "critical" ? "danger" : "primary"} size="sm" />
          </div>
          <button onClick={() => navigate(`/cases/${caseData.id}`)}
            className="rounded-lg border border-border bg-card hover:bg-muted px-3 py-1.5 text-xs font-medium text-foreground transition-colors whitespace-nowrap">
            Open Case →
          </button>
        </motion.div>

        {/* Workflow */}
        <WorkflowTab caseData={caseData} onUpdate={setCaseData} />
      </div>
    </DashboardLayout>
  );
}
