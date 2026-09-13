import { useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Clock, Circle, ChevronDown, ChevronUp, Edit2, Save, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDate } from "@/utils/format";
import type { InvestigationCase, WorkflowStage, WorkflowStageStatus } from "@/types/case.types";

interface Props {
  caseData:  InvestigationCase;
  onUpdate:  (c: InvestigationCase) => void;
}

const DEPT_COLORS: Record<string, string> = {
  police:   "border-royal-200  bg-royal-50  dark:bg-royal-950/30  text-royal-700  dark:text-royal-300",
  hospital: "border-emerald-200 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300",
  fsl:      "border-purple-200  bg-purple-50  dark:bg-purple-950/30  text-purple-700  dark:text-purple-300",
  cwc:      "border-amber-200   bg-amber-50   dark:bg-amber-950/30   text-amber-700   dark:text-amber-300",
  court:    "border-slate-200   bg-slate-50   dark:bg-slate-800/50   text-slate-700   dark:text-slate-300",
};

export function WorkflowTab({ caseData, onUpdate }: Props) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editingId,  setEditingId]  = useState<string | null>(null);
  const [editRemarks, setEditRemarks] = useState("");

  const completedCount = caseData.workflow.filter(s => s.status === "completed").length;

  const toggleStage = (stage: WorkflowStage) => {
    const newStatus: WorkflowStageStatus = stage.status === "completed" ? "pending" : stage.status === "in_progress" ? "completed" : "in_progress";
    const updated = caseData.workflow.map(s => {
      if (s.id !== stage.id) return s;
      return {
        ...s,
        status: newStatus,
        completedDate: newStatus === "completed" ? new Date().toISOString().split("T")[0] : undefined,
      };
    });
    const newStageOrder = updated.filter(s => s.status === "completed").length + 1;
    const currentStage  = updated.find(s => s.status === "in_progress") ?? updated.find(s => s.status === "pending");
    onUpdate({ ...caseData, workflow: updated, currentStageOrder: Math.min(newStageOrder, 9), currentStage: currentStage?.title ?? caseData.currentStage });
  };

  const saveRemarks = (stage: WorkflowStage) => {
    const updated = caseData.workflow.map(s => s.id === stage.id ? { ...s, remarks: editRemarks } : s);
    onUpdate({ ...caseData, workflow: updated });
    setEditingId(null);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between rounded-xl border border-border bg-card p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[hsl(var(--primary))]/10 text-[hsl(var(--primary))] font-bold text-sm">
            {completedCount}/{caseData.totalStages}
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">Investigation Progress</p>
            <p className="text-xs text-muted-foreground">{completedCount} of {caseData.totalStages} stages completed</p>
          </div>
        </div>
        <div className="w-40 space-y-1">
          <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
            <div className="h-full rounded-full bg-[hsl(var(--primary))] transition-all duration-500" style={{ width:`${(completedCount/caseData.totalStages)*100}%` }} />
          </div>
          <p className="text-2xs text-right text-muted-foreground">{Math.round((completedCount/caseData.totalStages)*100)}%</p>
        </div>
      </div>

      {/* Stages */}
      <div className="space-y-3">
        {caseData.workflow.map((stage, i) => (
          <motion.div key={stage.id} initial={{ opacity:0, x:-8 }} animate={{ opacity:1, x:0 }} transition={{ delay: i*0.05 }}
            className={cn("rounded-xl border bg-card overflow-hidden transition-all",
              stage.status==="in_progress" ? "border-[hsl(var(--primary))]/40 shadow-sm" :
              stage.status==="completed"   ? "border-emerald-200 dark:border-emerald-800" : "border-border")}>
            {/* Stage header */}
            <div className="flex items-center gap-3 p-4 cursor-pointer" onClick={() => setExpandedId(expandedId===stage.id ? null : stage.id)}>
              {/* Status icon */}
              <button onClick={(e) => { e.stopPropagation(); toggleStage(stage); }}
                className="shrink-0 transition-transform hover:scale-110"
                title={`Click to toggle status (currently ${stage.status})`}>
                {stage.status==="completed" ? <CheckCircle2 className="h-6 w-6 text-emerald-500" /> :
                 stage.status==="in_progress" ? <Clock className="h-6 w-6 text-[hsl(var(--primary))]" /> :
                 <Circle className="h-6 w-6 text-muted-foreground/40" />}
              </button>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-semibold text-foreground">{stage.title}</span>
                  <span className={cn("rounded-full border px-2 py-0.5 text-2xs font-medium", DEPT_COLORS[stage.department])}>{stage.department.toUpperCase()}</span>
                  {stage.status === "in_progress" && <span className="rounded-full bg-[hsl(var(--primary))]/10 text-[hsl(var(--primary))] text-2xs font-semibold px-2 py-0.5">Active</span>}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5 truncate">{stage.description}</p>
              </div>

              {/* Meta */}
              <div className="hidden sm:flex items-center gap-4 text-xs text-muted-foreground shrink-0">
                {stage.completedDate && <span>✓ {formatDate(stage.completedDate)}</span>}
                {stage.officer && <span className="font-medium text-foreground">{stage.officer}</span>}
              </div>
              {expandedId===stage.id ? <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0" /> : <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />}
            </div>

            {/* Expanded */}
            {expandedId===stage.id && (
              <motion.div initial={{ height:0 }} animate={{ height:"auto" }} exit={{ height:0 }} className="overflow-hidden border-t border-border">
                <div className="p-4 space-y-4">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
                    <div><p className="text-muted-foreground mb-0.5">Stage #</p><p className="font-medium text-foreground">{stage.order} of {caseData.totalStages}</p></div>
                    <div><p className="text-muted-foreground mb-0.5">Department</p><p className="font-medium text-foreground capitalize">{stage.department}</p></div>
                    <div><p className="text-muted-foreground mb-0.5">Status</p><p className="font-medium text-foreground capitalize">{stage.status.replace("_"," ")}</p></div>
                    {stage.officer      && <div><p className="text-muted-foreground mb-0.5">Officer</p><p className="font-medium text-foreground">{stage.officer}</p></div>}
                    {stage.completedDate&& <div><p className="text-muted-foreground mb-0.5">Completed</p><p className="font-medium text-foreground">{formatDate(stage.completedDate)}</p></div>}
                  </div>

                  {/* Remarks */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <p className="text-xs font-medium text-foreground">Remarks</p>
                      {editingId !== stage.id
                        ? <button onClick={() => { setEditingId(stage.id); setEditRemarks(stage.remarks ?? ""); }} className="flex items-center gap-1 text-2xs text-[hsl(var(--primary))] hover:underline"><Edit2 className="h-3 w-3" />Edit</button>
                        : <div className="flex items-center gap-1">
                            <button onClick={() => saveRemarks(stage)} className="flex items-center gap-1 text-2xs text-emerald-600 hover:underline"><Save className="h-3 w-3" />Save</button>
                            <button onClick={() => setEditingId(null)} className="flex items-center gap-1 text-2xs text-muted-foreground hover:underline"><X className="h-3 w-3" />Cancel</button>
                          </div>
                      }
                    </div>
                    {editingId === stage.id
                      ? <textarea value={editRemarks} onChange={e => setEditRemarks(e.target.value)} rows={3}
                          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))] resize-none dark:bg-slate-900 dark:text-white" />
                      : <p className="text-xs text-muted-foreground bg-muted/50 rounded-lg p-3 min-h-[40px]">{stage.remarks || "No remarks added yet."}</p>
                    }
                  </div>

                  {/* Action buttons */}
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    {stage.status !== "completed" && (
                      <button onClick={() => toggleStage(stage)}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 px-3 py-1.5 text-xs font-semibold text-white transition-colors">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Mark Complete
                      </button>
                    )}
                    {stage.status === "completed" && (
                      <button onClick={() => toggleStage(stage)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card hover:bg-muted px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors">
                        <X className="h-3.5 w-3.5" /> Reopen Stage
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
