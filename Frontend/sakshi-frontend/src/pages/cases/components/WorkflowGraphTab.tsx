import { useMemo } from "react";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  type Node,
  type Edge,
  MarkerType,
  Handle,
  Position,
} from "reactflow";
import "reactflow/dist/style.css";
import { CheckCircle2, Clock, Circle } from "lucide-react";
import type { InvestigationCase, WorkflowStage } from "@/types/case.types";

interface Props { caseData: InvestigationCase }

const DEPT_COLORS: Record<string, { border: string; bg: string; text: string }> = {
  police:   { border: "#3b82f6", bg: "#eff6ff", text: "#1d4ed8" },
  hospital: { border: "#10b981", bg: "#ecfdf5", text: "#047857" },
  fsl:      { border: "#8b5cf6", bg: "#f5f3ff", text: "#6d28d9" },
  cwc:      { border: "#f59e0b", bg: "#fffbeb", text: "#b45309" },
  court:    { border: "#64748b", bg: "#f8fafc", text: "#334155" },
};

function WorkflowNode({ data }: { data: WorkflowStage & { isLast: boolean } }) {
  const colors = DEPT_COLORS[data.department];
  return (
    <>
      <Handle type="target" position={Position.Left} style={{ background: colors.border, border: `2px solid ${colors.border}` }} />
      <div style={{ borderColor: colors.border, borderWidth: data.status === "in_progress" ? 2 : 1.5 }}
        className={`w-44 rounded-xl border bg-white shadow-sm transition-all ${data.status === "in_progress" ? "shadow-md" : ""}`}>
        {/* Header */}
        <div style={{ backgroundColor: colors.bg }} className="flex items-center gap-2 rounded-t-xl px-3 py-2">
          <div style={{ color: colors.text }}>
            {data.status === "completed"  ? <CheckCircle2 className="h-4 w-4" /> :
             data.status === "in_progress" ? <Clock className="h-4 w-4" /> :
             <Circle className="h-4 w-4 text-slate-300" />}
          </div>
          <span className="text-2xs font-bold uppercase tracking-widest" style={{ color: colors.text }}>
            {data.department}
          </span>
        </div>
        {/* Body */}
        <div className="px-3 py-2.5">
          <p className="text-xs font-semibold text-slate-800 leading-tight">{data.title}</p>
          <div className={`mt-1.5 inline-flex items-center rounded-full px-2 py-0.5 text-2xs font-semibold
            ${data.status === "completed"   ? "bg-emerald-50 text-emerald-700" :
              data.status === "in_progress" ? "bg-blue-50 text-blue-700" :
              "bg-slate-50 text-slate-500"}`}>
            {data.status === "completed" ? "Completed" : data.status === "in_progress" ? "In Progress" : "Pending"}
          </div>
          {data.completedDate && (
            <p className="mt-1 text-2xs text-slate-400">{data.completedDate}</p>
          )}
          {data.officer && (
            <p className="mt-0.5 text-2xs text-slate-500 truncate">{data.officer}</p>
          )}
        </div>
      </div>
      {!data.isLast && <Handle type="source" position={Position.Right} style={{ background: colors.border, border: `2px solid ${colors.border}` }} />}
    </>
  );
}

const nodeTypes = { workflowNode: WorkflowNode };

const EDGE_COLOR: Record<string, string> = {
  completed:   "#10b981",
  in_progress: "#3b82f6",
  pending:     "#cbd5e1",
};

export function WorkflowGraphTab({ caseData }: Props) {
  const { nodes, edges } = useMemo(() => {
    const stages = caseData.workflow;
    const ROW_HEIGHT = 180;
    const COL_WIDTH  = 230;
    const PER_ROW    = 3;

    const nodes: Node[] = stages.map((stage, i) => {
      const col = i % PER_ROW;
      const row = Math.floor(i / PER_ROW);
      // Zigzag: even rows left→right, odd rows right→left
      const x = row % 2 === 0 ? col * COL_WIDTH : (PER_ROW - 1 - col) * COL_WIDTH;
      const y = row * ROW_HEIGHT;
      return {
        id:       stage.id,
        type:     "workflowNode",
        position: { x, y },
        data:     { ...stage, isLast: i === stages.length - 1 },
      };
    });

    const edges: Edge[] = stages.slice(0, -1).map((stage, i) => ({
      id:           `e${i}`,
      source:       stage.id,
      target:       stages[i + 1].id,
      animated:     stages[i + 1].status === "in_progress",
      markerEnd:    { type: MarkerType.ArrowClosed, color: EDGE_COLOR[stages[i + 1].status], width: 16, height: 16 },
      style:        { stroke: EDGE_COLOR[stage.status], strokeWidth: 2 },
    }));

    return { nodes, edges };
  }, [caseData.workflow]);

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="flex items-center justify-between border-b border-border px-5 py-3">
        <p className="text-sm font-semibold text-foreground">Investigation Flow Graph</p>
        <div className="flex items-center gap-4 text-2xs">
          {[["bg-emerald-500","Completed"],["bg-royal-500","In Progress"],["bg-slate-300","Pending"]].map(([c,l]) => (
            <span key={l} className="flex items-center gap-1.5 text-muted-foreground">
              <span className={`h-2 w-2 rounded-full ${c}`} />{l}
            </span>
          ))}
        </div>
      </div>
      <div style={{ height: 520 }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.2 }}
          proOptions={{ hideAttribution: true }}
        >
          <Background gap={16} color="#e2e8f0" size={1} />
          <Controls showInteractive={false} />
          <MiniMap nodeColor={n => {
            const s = caseData.workflow.find(w => w.id === n.id)?.status;
            return s === "completed" ? "#10b981" : s === "in_progress" ? "#3b82f6" : "#cbd5e1";
          }} />
        </ReactFlow>
      </div>
    </div>
  );
}
