export type ProceduralStatus =
  | "COMPLETED"
  | "IN_PROGRESS"
  | "READY"
  | "BLOCKED"
  | "AWAITING_EXTERNAL"
  | "OVERDUE"
  | "COMPLETED_UNVERIFIED"
  | "NOT_STARTED";

export interface RootBlockerInfo {
  immediateBlockerId: string;
  immediateBlockerTitle: string;
  immediateBlockerDepartment: string;
  rootBlockerId: string;
  rootBlockerTitle: string;
  rootBlockerDepartment: string;
  blockerChain: string[];
  explanation: string;
  downstreamImpactCount: number;
}

export interface DownstreamImpactInfo {
  directDependentIds: string[];
  totalAffectedCount: number;
  affectedStageIds: string[];
  affectsStatutoryChargesheet: boolean;
}

export interface DPOGNode {
  id: string;
  dbId?: string | null;
  stageId: string;
  order: number;
  title: string;
  description: string;
  department: string;
  responsibleRole: string;
  rawStatus: string;
  calculatedStatus: ProceduralStatus;
  isCompleted: boolean;
  isBlocked: boolean;
  isActionable: boolean;
  isCriticalPath: boolean;
  deadline?: string | null;
  statutoryDeadlineLabel: string;
  officer?: string | null;
  completedDate?: string | null;
  remarks?: string | null;
  evidenceRequired: string[];
  prerequisites: string[];
  incompletePrerequisites: string[];
  directDependents: string[];
  rootBlockerInfo?: RootBlockerInfo | null;
  downstreamImpactInfo: DownstreamImpactInfo;
}

export interface DPOGEdge {
  id: string;
  source: string;
  target: string;
  type?: string;
  animated?: boolean;
  isBlockedPath?: boolean;
  style?: Record<string, any>;
  markerEnd?: Record<string, any>;
}

export interface FactorBreakdown {
  baseCompletionPoints: number;
  activeProgressPoints: number;
  pathIntegrityPoints: number;
  blockerDeductions: number;
}

export interface ProceduralReadiness {
  score: number;
  percentage: string;
  status: string;
  completedStages: number;
  totalStages: number;
  blockedStages: number;
  actionableStages: number;
  inProgressStages: number;
  factorBreakdown: FactorBreakdown;
  explanation: string;
}

export interface ActiveBlockerSummary {
  stageId: string;
  title: string;
  department: string;
  rootBlocker?: string | null;
  affectedDownstreamCount: number;
}

export interface NextActionableSummary {
  stageId: string;
  title: string;
  department: string;
  status: string;
  deadline?: string | null;
}

export interface DPOGSummary {
  activeBlockers: ActiveBlockerSummary[];
  nextActionable: NextActionableSummary[];
  isProcedurallyIntact: boolean;
}

export interface ProceduralGraphData {
  caseId: string;
  caseNumber: string;
  templateId: string;
  crimeType: string;
  totalStages: number;
  readiness: ProceduralReadiness;
  nodes: DPOGNode[];
  edges: DPOGEdge[];
  summary: DPOGSummary;
}

export interface StageTransitionPayload {
  newStatus: "completed" | "in_progress" | "pending";
  officer?: string;
  remarks?: string;
  completedDate?: string;
}
