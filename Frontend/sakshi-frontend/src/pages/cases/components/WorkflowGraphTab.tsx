import { useState, useMemo, useEffect } from "react";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  type Node,
  type Edge,
  MarkerType,
  Handle,
  Position,
  useReactFlow,
  ReactFlowProvider,
} from "reactflow";
import "reactflow/dist/style.css";
import { CheckCircle2, Clock, ShieldAlert, ArrowRight, BrainCircuit, XCircle, Info, Calendar, User, GitCommit, Activity } from "lucide-react";
import type { InvestigationCase, WorkflowStage } from "@/types/case.types";
import { cn } from "@/lib/utils";

interface Props { caseData: InvestigationCase }

function WorkflowNode({ data }: { data: WorkflowStage & { isLast: boolean, isBlocked: boolean, isSelected: boolean } }) {
  // Determine visual state
  const state = data.status === "completed" ? "completed" :
                data.isBlocked ? "blocked" :
                data.status === "in_progress" ? "current" : "pending";

  const config = {
    completed: { border: "border-emerald-500", bg: "bg-emerald-500/10", text: "text-emerald-500", icon: CheckCircle2 },
    current:   { border: "border-[hsl(var(--primary))]", bg: "bg-[hsl(var(--primary))]/10", text: "text-[hsl(var(--primary))]", icon: Activity },
    blocked:   { border: "border-red-500", bg: "bg-red-500/10", text: "text-red-500", icon: ShieldAlert },
    pending:   { border: "border-amber-500/50", bg: "bg-background", text: "text-amber-500", icon: Clock },
  }[state];

  const Icon = config.icon;

  return (
    <>
      <Handle type="target" position={Position.Left} className="!w-2 !h-4 !rounded-sm !bg-muted-foreground/30 !border-none" />
      <div className={cn(
        "w-[260px] rounded-xl border-2 shadow-sm transition-all bg-card overflow-hidden",
        config.border,
        data.isSelected ? "shadow-[0_0_15px_rgba(var(--primary),0.3)] scale-[1.02]" : "hover:border-foreground/30",
        state === "current" && !data.isSelected && "shadow-[0_0_10px_rgba(14,165,233,0.15)]"
      )}>
        <div className={cn("px-4 py-2 flex items-center gap-2 border-b border-border/50", config.bg)}>
          <Icon className={cn("h-4 w-4", config.text)} />
          <span className={cn("text-xs font-bold tracking-wider uppercase", config.text)}>
            {state === "current" ? "CURRENT STAGE" : state}
          </span>
        </div>
        <div className="p-4 space-y-3">
          <p className="text-sm font-semibold text-foreground leading-tight">{data.title}</p>
          
          <div className="flex flex-col gap-1.5 mt-2">
            {data.officer && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <User className="h-3 w-3" /> <span className="truncate">{data.officer}</span>
              </div>
            )}
            {data.completedDate && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3" /> <span>{data.completedDate}</span>
              </div>
            )}
          </div>

          {data.isBlocked && (
            <div className="mt-3 pt-3 border-t border-red-500/20">
              <p className="text-2xs font-bold text-red-400 mb-1 uppercase tracking-wider">Blocked By</p>
              <p className="text-xs text-foreground font-medium">Incomplete Prerequisites</p>
            </div>
          )}
        </div>
      </div>
      {!data.isLast && <Handle type="source" position={Position.Right} className="!w-2 !h-4 !rounded-sm !bg-muted-foreground/30 !border-none" />}
    </>
  );
}

const nodeTypes = { workflowNode: WorkflowNode };

function FlowContent({ caseData, selectedNodeId, onNodeSelect }: { caseData: InvestigationCase, selectedNodeId: string | null, onNodeSelect: (id: string) => void }) {
  const { fitView } = useReactFlow();

  const { nodes, edges } = useMemo(() => {
    const stages = caseData.workflow;
    const ROW_HEIGHT = 200;
    const COL_WIDTH  = 320;
    const PER_ROW    = 3;

    const nodes: Node[] = stages.map((stage, i) => {
      const col = i % PER_ROW;
      const row = Math.floor(i / PER_ROW);
      const x = row % 2 === 0 ? col * COL_WIDTH : (PER_ROW - 1 - col) * COL_WIDTH;
      const y = row * ROW_HEIGHT;
      
      const isBlocked = stage.status === "in_progress" && (caseData.status === "escalated" || caseData.priority === "critical");
      const isSelected = stage.id === selectedNodeId;

      return {
        id:       stage.id,
        type:     "workflowNode",
        position: { x, y },
        data:     { ...stage, isLast: i === stages.length - 1, isBlocked, isSelected },
      };
    });

    const edges: Edge[] = stages.slice(0, -1).map((stage, i) => {
      const nextStage = stages[i + 1];
      const isBlocked = nextStage.status === "in_progress" && (caseData.status === "escalated" || caseData.priority === "critical");
      const isCurrent = nextStage.status === "in_progress";
      const isCompleted = nextStage.status === "completed";

      const color = isCompleted ? "#10b981" : isBlocked ? "#ef4444" : isCurrent ? "#0284c7" : "#475569";
      
      return {
        id:           `e${i}`,
        source:       stage.id,
        target:       nextStage.id,
        animated:     isCurrent && !isBlocked,
        markerEnd:    { type: MarkerType.ArrowClosed, color, width: 20, height: 20 },
        style:        { stroke: color, strokeWidth: isCurrent || isBlocked ? 3 : 2, strokeDasharray: isBlocked ? "5,5" : "none" },
      };
    });

    return { nodes, edges };
  }, [caseData, selectedNodeId]);

  // Refit view when case changes
  useEffect(() => {
    setTimeout(() => fitView({ padding: 0.2 }), 50);
  }, [caseData.id, fitView]);

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      nodeTypes={nodeTypes}
      onNodeClick={(_, node) => onNodeSelect(node.id)}
      fitView
      fitViewOptions={{ padding: 0.2 }}
      proOptions={{ hideAttribution: true }}
      className="bg-[#070b15]"
    >
      <Background gap={20} color="#1e293b" size={2} />
      <Controls showInteractive={false} className="bg-card border-border fill-foreground" />
      <MiniMap 
        nodeColor={n => {
          const s = caseData.workflow.find(w => w.id === n.id);
          if (!s) return "#475569";
          const isBlocked = s.status === "in_progress" && (caseData.status === "escalated" || caseData.priority === "critical");
          return s.status === "completed" ? "#10b981" : isBlocked ? "#ef4444" : s.status === "in_progress" ? "#0284c7" : "#475569";
        }} 
        maskColor="rgba(7, 11, 21, 0.7)"
        className="bg-card border-border"
      />
    </ReactFlow>
  );
}

export function WorkflowGraphTab({ caseData }: Props) {
  // By default, select the in_progress stage, or the first stage
  const currentStage = caseData.workflow.find(w => w.status === "in_progress") || caseData.workflow[0];
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(currentStage.id);

  // Update selected if case changes
  useEffect(() => {
    const stage = caseData.workflow.find(w => w.status === "in_progress") || caseData.workflow[0];
    setSelectedNodeId(stage.id);
  }, [caseData.id]);

  const selectedNode = useMemo(() => caseData.workflow.find(w => w.id === selectedNodeId), [caseData, selectedNodeId]);
  const isBlocked = selectedNode?.status === "in_progress" && (caseData.status === "escalated" || caseData.priority === "critical");
  
  // Find preceding node for dependencies
  const precedingNode = useMemo(() => {
    if (!selectedNode) return null;
    const idx = caseData.workflow.findIndex(w => w.id === selectedNode.id);
    return idx > 0 ? caseData.workflow[idx - 1] : null;
  }, [caseData, selectedNode]);

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-[750px] w-full">
      {/* GRAPH AREA - HERO SECTION */}
      <div className="flex-1 rounded-xl border border-border bg-[#070b15] overflow-hidden relative shadow-lg">
        {/* Compact Legend */}
        <div className="absolute top-4 left-4 z-10 flex flex-col gap-2 p-3 rounded-lg border border-border bg-card/80 backdrop-blur-sm shadow-sm">
          <p className="text-2xs font-bold text-muted-foreground uppercase tracking-widest mb-1">Legend</p>
          {[
            { label: "COMPLETED", color: "bg-emerald-500" },
            { label: "CURRENT", color: "bg-[hsl(var(--primary))]" },
            { label: "PENDING", color: "bg-amber-500" },
            { label: "BLOCKED", color: "bg-red-500" },
          ].map(l => (
            <div key={l.label} className="flex items-center gap-2 text-xs font-medium text-foreground">
              <span className={cn("h-2 w-2 rounded-full", l.color)} /> {l.label}
            </div>
          ))}
        </div>
        
        <ReactFlowProvider>
          <FlowContent caseData={caseData} selectedNodeId={selectedNodeId} onNodeSelect={setSelectedNodeId} />
        </ReactFlowProvider>
      </div>

      {/* GRAPH INSIGHT PANEL */}
      <div className="w-full lg:w-[400px] shrink-0 flex flex-col gap-4 overflow-y-auto hide-scrollbar">
        
        {/* Node Details */}
        <div className="rounded-xl border border-border bg-card shadow-sm flex flex-col overflow-hidden">
          <div className="px-5 py-4 border-b border-border bg-muted/20">
            <h2 className="text-sm font-bold text-foreground tracking-wider flex items-center gap-2">
              <GitCommit className="h-4 w-4 text-[hsl(var(--primary))]" />
              PROCEDURAL OBLIGATION
            </h2>
          </div>
          
          {selectedNode ? (
            <div className="p-5 space-y-5">
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Stage</p>
                <p className="text-lg font-bold text-foreground">{selectedNode.title}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Status</p>
                  <div className={cn("inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs font-bold", 
                    selectedNode.status === "completed" ? "bg-emerald-500/10 text-emerald-500" :
                    isBlocked ? "bg-red-500/10 text-red-500" :
                    selectedNode.status === "in_progress" ? "bg-[hsl(var(--primary))]/10 text-[hsl(var(--primary))]" :
                    "bg-amber-500/10 text-amber-500"
                  )}>
                    {selectedNode.status === "completed" ? "COMPLETED" : isBlocked ? "BLOCKED" : selectedNode.status === "in_progress" ? "CURRENT" : "PENDING"}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Deadline</p>
                  <p className="text-sm font-medium text-foreground">{selectedNode.deadline || "TBD"}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Responsible Role</p>
                  <p className="text-sm font-medium text-foreground capitalize flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" /> {selectedNode.department} ({selectedNode.officer || "Pending Assignment"})
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-border">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Prerequisites & Dependencies</p>
                {precedingNode ? (
                  <div className="flex items-center gap-3 p-3 rounded-lg border border-border bg-background">
                    <CheckCircle2 className={cn("h-4 w-4 shrink-0", precedingNode.status === "completed" ? "text-emerald-500" : "text-muted-foreground")} />
                    <div>
                      <p className="text-xs font-medium text-foreground">{precedingNode.title}</p>
                      <p className="text-2xs text-muted-foreground">{precedingNode.status === "completed" ? "Requirement satisfied" : "Requirement pending"}</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground italic">Initiation stage — no prior dependencies.</p>
                )}
              </div>

              {/* Blocked Section Highlight */}
              {isBlocked && precedingNode && (
                <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20">
                  <h3 className="text-xs font-bold text-red-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <ShieldAlert className="h-4 w-4" /> BLOCKED DEPENDENCY
                  </h3>
                  <p className="text-sm text-foreground mb-1">Blocked by: <span className="font-semibold">{precedingNode.title}</span></p>
                  <p className="text-xs text-red-300/80 mb-3">Required prerequisite has not been completed.</p>
                  
                  <div className="pt-3 border-t border-red-500/20">
                    <p className="text-xs font-bold text-foreground uppercase tracking-wider mb-1">Next Action</p>
                    <p className="text-xs text-foreground font-medium">Complete {precedingNode.title.toLowerCase()} to unblock this stage.</p>
                  </div>
                </div>
              )}

              {/* Next Action Button */}
              {!isBlocked && selectedNode.status !== "completed" && (
                <button className="w-full bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))]/90 text-white font-semibold text-xs py-3 rounded-lg transition-colors flex items-center justify-center gap-2">
                  <ArrowRight className="h-4 w-4" /> INITIATE WORKFLOW
                </button>
              )}
            </div>
          ) : (
            <div className="p-8 text-center flex flex-col items-center justify-center text-muted-foreground h-full">
              <Info className="h-8 w-8 mb-3 opacity-50" />
              <p className="text-sm">Select a node to view obligation details.</p>
            </div>
          )}
        </div>

        {/* AI Connection Panel */}
        {isBlocked && (
          <div className="rounded-xl border border-royal-500/30 bg-gradient-to-b from-royal-950/40 to-background p-5 relative overflow-hidden shadow-[0_0_20px_rgba(99,102,241,0.05)] shrink-0">
            <div className="absolute -top-4 -right-4 p-4 opacity-5">
              <BrainCircuit className="h-32 w-32 text-royal-500" />
            </div>
            <div className="relative z-10">
              <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-royal-500/10 border border-royal-500/20 text-royal-400 text-2xs font-bold tracking-wider mb-4">
                <BrainCircuit className="h-3 w-3" /> AI PROCEDURAL INSIGHT
              </div>
              
              <div className="space-y-3">
                <p className="text-sm font-medium text-red-400 flex items-start gap-1.5">
                  <XCircle className="h-4 w-4 mt-0.5 shrink-0" /> {selectedNode?.title} is currently blocked due to incomplete preceding obligations.
                </p>
                <p className="text-xs text-foreground/90 leading-relaxed">
                  Prolonged delays at this stage risk exceeding mandatory statutory timelines. Coordinating directly with the responsible officer is recommended.
                </p>
                <button className="mt-2 w-full bg-secondary hover:bg-secondary/80 text-foreground text-xs font-semibold py-2 px-3 rounded-md transition-colors border border-border">
                  VIEW AI EXPLANATION
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
