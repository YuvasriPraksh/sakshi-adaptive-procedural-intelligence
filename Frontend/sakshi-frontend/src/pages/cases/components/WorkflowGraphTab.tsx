import { useState, useMemo, useEffect, useCallback } from "react";
import {
  CheckCircle2,
  Clock,
  ShieldAlert,
  ArrowRight,
  Info,
  Calendar,
  User,
  GitCommit,
  Activity,
  Layers,
  Sparkles,
  RefreshCw,
  AlertTriangle,
  Flame,
} from "lucide-react";
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
import type { InvestigationCase } from "@/types/case.types";
import type { DPOGNode, ProceduralGraphData, StageTransitionPayload } from "@/types/dpog.types";
import { caseService } from "@/services/caseService";
import { cn } from "@/lib/utils";

interface Props {
  caseData: InvestigationCase;
}

// ── Custom React Flow Node for Procedural Obligation ─────────────────────────
function ProceduralNodeComponent({
  data,
}: {
  data: DPOGNode & { isSelected: boolean };
}) {
  const status = data.calculatedStatus;

  const config = {
    COMPLETED: {
      border: "border-emerald-500",
      bg: "bg-emerald-500/10",
      text: "text-emerald-500",
      badge: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
      icon: CheckCircle2,
      label: "COMPLETED",
    },
    IN_PROGRESS: {
      border: "border-sky-500",
      bg: "bg-sky-500/10",
      text: "text-sky-400",
      badge: "bg-sky-500/15 text-sky-300 border-sky-500/30 animate-pulse",
      icon: Activity,
      label: "IN PROGRESS",
    },
    READY: {
      border: "border-amber-500",
      bg: "bg-amber-500/10",
      text: "text-amber-400",
      badge: "bg-amber-500/15 text-amber-300 border-amber-500/30",
      icon: Clock,
      label: "ACTIONABLE",
    },
    BLOCKED: {
      border: "border-red-500",
      bg: "bg-red-500/10",
      text: "text-red-400",
      badge: "bg-red-500/15 text-red-300 border-red-500/30",
      icon: ShieldAlert,
      label: "BLOCKED",
    },
    AWAITING_EXTERNAL: {
      border: "border-purple-500",
      bg: "bg-purple-500/10",
      text: "text-purple-400",
      badge: "bg-purple-500/15 text-purple-300 border-purple-500/30",
      icon: Clock,
      label: "AWAITING EXT",
    },
    OVERDUE: {
      border: "border-rose-600",
      bg: "bg-rose-600/10",
      text: "text-rose-500",
      badge: "bg-rose-600/20 text-rose-300 border-rose-600/40",
      icon: AlertTriangle,
      label: "OVERDUE",
    },
    COMPLETED_UNVERIFIED: {
      border: "border-teal-500",
      bg: "bg-teal-500/10",
      text: "text-teal-400",
      badge: "bg-teal-500/15 text-teal-300 border-teal-500/30",
      icon: CheckCircle2,
      label: "UNVERIFIED",
    },
    NOT_STARTED: {
      border: "border-slate-700",
      bg: "bg-slate-800/30",
      text: "text-slate-400",
      badge: "bg-slate-800 text-slate-400 border-slate-700",
      icon: Clock,
      label: "PENDING",
    },
  }[status] || {
    border: "border-slate-700",
    bg: "bg-slate-800/30",
    text: "text-slate-400",
    badge: "bg-slate-800 text-slate-400 border-slate-700",
    icon: Clock,
    label: status,
  };

  const Icon = config.icon;

  return (
    <>
      <Handle
        type="target"
        position={Position.Left}
        className="!w-2.5 !h-4 !rounded-sm !bg-slate-600 !border-none"
      />
      <div
        className={cn(
          "w-[270px] rounded-xl border-2 shadow-md transition-all bg-card overflow-hidden",
          config.border,
          data.isSelected
            ? "ring-2 ring-sky-400 shadow-[0_0_20px_rgba(56,189,248,0.25)] scale-[1.02]"
            : "hover:border-foreground/40",
        )}
      >
        {/* Header Bar */}
        <div className={cn("px-3.5 py-2 flex items-center justify-between border-b border-border/50", config.bg)}>
          <div className="flex items-center gap-1.5">
            <Icon className={cn("h-4 w-4", config.text)} />
            <span className={cn("text-2xs font-extrabold tracking-wider uppercase", config.text)}>
              Stage {data.order}
            </span>
          </div>
          <span className={cn("text-3xs font-bold px-2 py-0.5 rounded border uppercase tracking-wider", config.badge)}>
            {config.label}
          </span>
        </div>

        {/* Content */}
        <div className="p-3.5 space-y-2.5">
          <p className="text-xs font-bold text-foreground leading-snug line-clamp-2">
            {data.title}
          </p>

          <div className="flex flex-col gap-1 text-3xs text-muted-foreground">
            <div className="flex items-center gap-1.5 truncate">
              <User className="h-3 w-3 shrink-0 text-slate-400" />
              <span className="capitalize">{data.department}</span>
              {data.officer && <span className="truncate">({data.officer})</span>}
            </div>
            {data.deadline && (
              <div className="flex items-center gap-1.5 truncate">
                <Calendar className="h-3 w-3 shrink-0 text-slate-400" />
                <span className="truncate">{data.deadline}</span>
              </div>
            )}
          </div>

          {/* Blocker Callout Badge */}
          {data.isBlocked && data.rootBlockerInfo && (
            <div className="pt-2 border-t border-red-500/20 flex items-start gap-1.5 text-3xs text-red-400">
              <ShieldAlert className="h-3 w-3 shrink-0 mt-0.5" />
              <span className="truncate">
                Blocked by: <strong>{data.rootBlockerInfo.rootBlockerTitle}</strong>
              </span>
            </div>
          )}
        </div>
      </div>
      <Handle
        type="source"
        position={Position.Right}
        className="!w-2.5 !h-4 !rounded-sm !bg-slate-600 !border-none"
      />
    </>
  );
}

const nodeTypes = { proceduralNode: ProceduralNodeComponent };

// ── Inner Flow Canvas ────────────────────────────────────────────────────────
function FlowContent({
  graphData,
  selectedNodeId,
  onNodeSelect,
}: {
  graphData: ProceduralGraphData;
  selectedNodeId: string | null;
  onNodeSelect: (id: string) => void;
}) {
  const { fitView } = useReactFlow();

  const { nodes, edges } = useMemo(() => {
    const rawNodes = graphData.nodes;
    const ROW_HEIGHT = 180;
    const COL_WIDTH = 320;
    const PER_ROW = 3;

    const flowNodes: Node[] = rawNodes.map((stg, i) => {
      const col = i % PER_ROW;
      const row = Math.floor(i / PER_ROW);
      const x = row % 2 === 0 ? col * COL_WIDTH : (PER_ROW - 1 - col) * COL_WIDTH;
      const y = row * ROW_HEIGHT;

      return {
        id: stg.stageId,
        type: "proceduralNode",
        position: { x, y },
        data: {
          ...stg,
          isSelected: stg.stageId === selectedNodeId,
        },
      };
    });

    const flowEdges: Edge[] = graphData.edges.map((e) => {
      const strokeColor = e.style?.stroke || "#475569";
      return {
        id: e.id,
        source: e.source,
        target: e.target,
        type: e.type || "smoothstep",
        animated: Boolean(e.animated),
        style: e.style,
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: strokeColor,
          width: 16,
          height: 16,
        },
      };
    });

    return { nodes: flowNodes, edges: flowEdges };
  }, [graphData, selectedNodeId]);

  useEffect(() => {
    const timer = setTimeout(() => fitView({ padding: 0.18 }), 60);
    return () => clearTimeout(timer);
  }, [graphData.caseId, fitView]);

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      nodeTypes={nodeTypes}
      onNodeClick={(_, node) => onNodeSelect(node.id)}
      fitView
      fitViewOptions={{ padding: 0.18 }}
      proOptions={{ hideAttribution: true }}
      className="bg-[#070b15]"
    >
      <Background gap={20} color="#1e293b" size={1.5} />
      <Controls showInteractive={false} className="bg-card border-border fill-foreground" />
      <MiniMap
        nodeColor={(n) => {
          const s = graphData.nodes.find((w) => w.stageId === n.id);
          if (!s) return "#475569";
          if (s.calculatedStatus === "COMPLETED") return "#10b981";
          if (s.calculatedStatus === "BLOCKED") return "#ef4444";
          if (s.calculatedStatus === "IN_PROGRESS") return "#38bdf8";
          if (s.calculatedStatus === "READY") return "#f59e0b";
          return "#475569";
        }}
        maskColor="rgba(7, 11, 21, 0.75)"
        className="bg-card border-border"
      />
    </ReactFlow>
  );
}

// ── Main D-POG Component ─────────────────────────────────────────────────────
export function WorkflowGraphTab({ caseData }: Props) {
  const [graphData, setGraphData] = useState<ProceduralGraphData | null>(null);
  const [loading, setLoading] = useState(true);
  const [transitioning, setTransitioning] = useState(false);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Fetch live procedural graph
  const loadGraph = useCallback(async () => {
    if (!caseData?.id) return;
    setLoading(true);
    setError(null);
    try {
      const res = await caseService.getProceduralGraph(caseData.id);
      if (res.success && res.data) {
        setGraphData(res.data);
        // Default select active or first blocked node
        const activeNode =
          res.data.nodes.find((n) => n.calculatedStatus === "IN_PROGRESS") ||
          res.data.nodes.find((n) => n.calculatedStatus === "BLOCKED") ||
          res.data.nodes[0];
        setSelectedNodeId((prev) => prev || activeNode?.stageId || null);
      } else {
        setError(res.message || "Failed to load procedural graph.");
      }
    } catch (err: any) {
      setError(err?.message || "Unable to reach procedural twin service.");
    } finally {
      setLoading(false);
    }
  }, [caseData?.id]);

  useEffect(() => {
    loadGraph();
  }, [loadGraph]);

  const selectedNode = useMemo(() => {
    if (!graphData || !selectedNodeId) return null;
    return graphData.nodes.find((n) => n.stageId === selectedNodeId) || null;
  }, [graphData, selectedNodeId]);

  // Handle stage completion / transition
  const handleTransition = async (newStatus: "completed" | "in_progress" | "pending") => {
    if (!caseData?.id || !selectedNode) return;
    setTransitioning(true);
    try {
      const payload: StageTransitionPayload = {
        newStatus,
        remarks: `Updated via D-POG digital twin interface at ${new Date().toLocaleTimeString()}`,
      };
      const res = await caseService.transitionWorkflowStage(caseData.id, selectedNode.stageId, payload);
      if (res.success && res.data) {
        setGraphData(res.data);
      }
    } catch (err: any) {
      alert(err?.message || "Failed to transition stage.");
    } finally {
      setTransitioning(false);
    }
  };

  if (loading && !graphData) {
    return (
      <div className="flex h-[600px] w-full items-center justify-center rounded-xl border border-border bg-card">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="h-8 w-8 animate-spin text-[hsl(var(--primary))]" />
          <p className="text-sm font-medium text-muted-foreground">Evaluating Dynamic Procedural Obligation Graph…</p>
        </div>
      </div>
    );
  }

  if (error && !graphData) {
    return (
      <div className="flex h-[600px] w-full items-center justify-center rounded-xl border border-border bg-card p-6 text-center">
        <div className="space-y-3">
          <AlertTriangle className="mx-auto h-8 w-8 text-amber-500" />
          <p className="text-sm font-semibold text-foreground">{error}</p>
          <button
            onClick={loadGraph}
            className="rounded-lg bg-secondary px-4 py-2 text-xs font-semibold text-foreground hover:bg-secondary/80"
          >
            Retry Evaluation
          </button>
        </div>
      </div>
    );
  }

  if (!graphData) return null;

  const readiness = graphData.readiness;
  const isSelectedBlocked = selectedNode?.isBlocked;
  const blockerInfo = selectedNode?.rootBlockerInfo;
  const downstream = selectedNode?.downstreamImpactInfo;

  return (
    <div className="space-y-4 w-full">
      {/* ── TOP STATS & READINESS INDICATOR BAR ───────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        {/* Readiness Indicator */}
        <div className="rounded-xl border border-border bg-card p-4 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-3xs font-bold text-muted-foreground uppercase tracking-wider">
              Procedural Readiness
            </p>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-foreground font-mono">{readiness.percentage}</span>
              <span
                className={cn(
                  "text-3xs font-bold px-2 py-0.5 rounded uppercase tracking-wider",
                  readiness.score >= 70
                    ? "bg-emerald-500/15 text-emerald-400"
                    : readiness.score >= 40
                    ? "bg-amber-500/15 text-amber-400"
                    : "bg-red-500/15 text-red-400",
                )}
              >
                {readiness.status.replace("_", " ")}
              </span>
            </div>
          </div>
          <div className="h-10 w-10 rounded-full border-2 border-[hsl(var(--primary))]/30 flex items-center justify-center bg-[hsl(var(--primary))]/10">
            <Sparkles className="h-5 w-5 text-[hsl(var(--primary))]" />
          </div>
        </div>

        {/* Completed Obligations */}
        <div className="rounded-xl border border-border bg-card p-4 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-3xs font-bold text-muted-foreground uppercase tracking-wider">Completed Stages</p>
            <p className="text-2xl font-black text-emerald-400 font-mono mt-1">
              {readiness.completedStages}{" "}
              <span className="text-xs font-normal text-muted-foreground">/ {readiness.totalStages}</span>
            </p>
          </div>
          <CheckCircle2 className="h-8 w-8 text-emerald-500/40" />
        </div>

        {/* Active Blockers */}
        <div className="rounded-xl border border-border bg-card p-4 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-3xs font-bold text-muted-foreground uppercase tracking-wider">Active Blockers</p>
            <p className="text-2xl font-black text-red-400 font-mono mt-1">
              {readiness.blockedStages}{" "}
              <span className="text-xs font-normal text-muted-foreground">obligations</span>
            </p>
          </div>
          <ShieldAlert className="h-8 w-8 text-red-500/40" />
        </div>

        {/* Next Actionable */}
        <div className="rounded-xl border border-border bg-card p-4 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-3xs font-bold text-muted-foreground uppercase tracking-wider">Actionable Now</p>
            <p className="text-2xl font-black text-sky-400 font-mono mt-1">
              {readiness.actionableStages}{" "}
              <span className="text-xs font-normal text-muted-foreground">stages</span>
            </p>
          </div>
          <Activity className="h-8 w-8 text-sky-500/40" />
        </div>
      </div>

      {/* ── MAIN WORKSPACE: GRAPH CANVAS + INSIGHT PANEL ──────────────────── */}
      <div className="flex flex-col lg:flex-row gap-5 h-[720px] w-full">
        {/* GRAPH CANVAS */}
        <div className="flex-1 rounded-xl border border-border bg-[#070b15] overflow-hidden relative shadow-lg">
          {/* Legend Overlay */}
          <div className="absolute top-4 left-4 z-10 flex flex-col gap-1.5 p-3 rounded-lg border border-border/80 bg-card/85 backdrop-blur-md shadow-sm">
            <p className="text-3xs font-bold text-muted-foreground uppercase tracking-widest mb-0.5">D-POG States</p>
            {[
              { label: "COMPLETED", color: "bg-emerald-500" },
              { label: "IN PROGRESS", color: "bg-sky-400" },
              { label: "ACTIONABLE", color: "bg-amber-400" },
              { label: "BLOCKED", color: "bg-red-500" },
            ].map((l) => (
              <div key={l.label} className="flex items-center gap-2 text-3xs font-medium text-foreground">
                <span className={cn("h-2 w-2 rounded-full", l.color)} /> {l.label}
              </div>
            ))}
          </div>

          {/* Reload Graph Button */}
          <button
            onClick={loadGraph}
            disabled={loading}
            className="absolute top-4 right-4 z-10 flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border/80 bg-card/85 backdrop-blur-md text-xs font-medium text-foreground hover:bg-card shadow-sm transition-colors"
          >
            <RefreshCw className={cn("h-3.5 w-3.5", loading && "animate-spin")} /> Refresh Graph
          </button>

          <ReactFlowProvider>
            <FlowContent
              graphData={graphData}
              selectedNodeId={selectedNodeId}
              onNodeSelect={setSelectedNodeId}
            />
          </ReactFlowProvider>
        </div>

        {/* GRAPH INSIGHT & CONTROL PANEL */}
        <div className="w-full lg:w-[410px] shrink-0 flex flex-col gap-3.5 overflow-y-auto hide-scrollbar">
          {selectedNode ? (
            <>
              {/* Obligation Details Card */}
              <div className="rounded-xl border border-border bg-card shadow-sm flex flex-col overflow-hidden">
                <div className="px-4 py-3 border-b border-border bg-muted/20 flex items-center justify-between">
                  <h2 className="text-xs font-bold text-foreground tracking-wider flex items-center gap-2">
                    <GitCommit className="h-4 w-4 text-[hsl(var(--primary))]" />
                    PROCEDURAL OBLIGATION #{selectedNode.order}
                  </h2>
                  <span
                    className={cn(
                      "text-3xs font-bold px-2 py-0.5 rounded uppercase tracking-wider",
                      selectedNode.calculatedStatus === "COMPLETED"
                        ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                        : selectedNode.isBlocked
                        ? "bg-red-500/15 text-red-400 border border-red-500/30"
                        : selectedNode.calculatedStatus === "IN_PROGRESS"
                        ? "bg-sky-500/15 text-sky-300 border border-sky-500/30"
                        : "bg-amber-500/15 text-amber-400 border border-amber-500/30",
                    )}
                  >
                    {selectedNode.calculatedStatus}
                  </span>
                </div>

                <div className="p-4 space-y-4">
                  <div>
                    <p className="text-sm font-bold text-foreground leading-snug">{selectedNode.title}</p>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{selectedNode.description}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="p-2.5 rounded-lg border border-border bg-background/50">
                      <p className="text-3xs font-bold text-muted-foreground uppercase tracking-wider">Stakeholder</p>
                      <p className="font-semibold text-foreground capitalize mt-0.5">{selectedNode.department}</p>
                      <p className="text-3xs text-muted-foreground truncate">{selectedNode.officer || "Assigned Officer"}</p>
                    </div>

                    <div className="p-2.5 rounded-lg border border-border bg-background/50">
                      <p className="text-3xs font-bold text-muted-foreground uppercase tracking-wider">Statutory Deadline</p>
                      <p className="font-semibold text-foreground mt-0.5">{selectedNode.statutoryDeadlineLabel}</p>
                    </div>
                  </div>

                  {/* Evidence Requirements */}
                  {selectedNode.evidenceRequired && selectedNode.evidenceRequired.length > 0 && (
                    <div className="space-y-1.5">
                      <p className="text-3xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                        <Layers className="h-3 w-3" /> Mandatory Evidence / Filings
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {selectedNode.evidenceRequired.map((doc) => (
                          <span
                            key={doc}
                            className="text-3xs font-medium px-2 py-1 rounded bg-secondary text-foreground border border-border"
                          >
                            {doc}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* ROOT BLOCKER SECTION (WHEN BLOCKED) */}
                  {isSelectedBlocked && blockerInfo && (
                    <div className="p-3.5 rounded-lg bg-red-500/10 border border-red-500/25 space-y-2">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-red-400">
                        <ShieldAlert className="h-4 w-4 shrink-0" />
                        <span>ROOT BLOCKER IDENTIFIED</span>
                      </div>
                      <p className="text-xs text-foreground font-medium">{blockerInfo.explanation}</p>
                      <div className="pt-2 border-t border-red-500/20 text-3xs text-red-300/80 space-y-1">
                        <p>
                          <strong>Root Cause Stage:</strong> {blockerInfo.rootBlockerTitle} ({blockerInfo.rootBlockerDepartment.toUpperCase()})
                        </p>
                        <p>
                          <strong>Downstream Blast Radius:</strong> Blocks {blockerInfo.downstreamImpactCount} dependent obligations across the investigation.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* DOWNSTREAM IMPACT SECTION */}
                  {downstream && downstream.totalAffectedCount > 0 && (
                    <div className="p-3 rounded-lg bg-background border border-border text-xs space-y-1.5">
                      <p className="text-3xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                        <Flame className="h-3 w-3 text-amber-400" /> Downstream Dependency Impact
                      </p>
                      <p className="text-xs text-foreground font-medium">
                        Directly / indirectly impacts{" "}
                        <span className="font-bold text-[hsl(var(--primary))]">
                          {downstream.totalAffectedCount} downstream obligations
                        </span>
                        {downstream.affectsStatutoryChargesheet && (
                          <span className="text-amber-400"> including Final Chargesheet submission.</span>
                        )}
                      </p>
                    </div>
                  )}

                  {/* STATE TRANSITION ACTION BUTTONS */}
                  <div className="pt-2 border-t border-border space-y-2">
                    {selectedNode.calculatedStatus !== "COMPLETED" && (
                      <button
                        onClick={() => handleTransition("completed")}
                        disabled={transitioning || isSelectedBlocked}
                        className={cn(
                          "w-full font-bold text-xs py-2.5 rounded-lg transition-all flex items-center justify-center gap-2 shadow-md",
                          isSelectedBlocked
                            ? "bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700"
                            : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/20",
                        )}
                      >
                        {transitioning ? (
                          <RefreshCw className="h-4 w-4 animate-spin" />
                        ) : isSelectedBlocked ? (
                          <>
                            <ShieldAlert className="h-4 w-4" /> Resolve Root Blocker to Enable
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="h-4 w-4" /> Mark Obligation Complete
                          </>
                        )}
                      </button>
                    )}

                    {selectedNode.calculatedStatus === "COMPLETED" && (
                      <button
                        onClick={() => handleTransition("in_progress")}
                        disabled={transitioning}
                        className="w-full bg-secondary hover:bg-secondary/80 text-foreground font-semibold text-xs py-2 rounded-lg transition-colors border border-border flex items-center justify-center gap-2"
                      >
                        {transitioning ? (
                          <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <>
                            <ArrowRight className="h-3.5 w-3.5" /> Re-open for Procedural Amendment
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="p-8 text-center flex flex-col items-center justify-center text-muted-foreground h-full rounded-xl border border-border bg-card">
              <Info className="h-8 w-8 mb-3 opacity-50" />
              <p className="text-sm font-medium">Select an obligation node on the graph to inspect procedural details.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
