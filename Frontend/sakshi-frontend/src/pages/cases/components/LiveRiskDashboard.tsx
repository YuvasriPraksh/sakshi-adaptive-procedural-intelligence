import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Shield, AlertTriangle, TrendingUp, Info, RotateCcw, AlertCircle } from "lucide-react";
import { CircularProgress, ProgressBar } from "@/components/ui/feedback/ProgressBar";
import { StatusBadge } from "@/components/ui/feedback/StatusBadge";
import { PageSpinner } from "@/components/ui/feedback/Spinner";
import { cn } from "@/lib/utils";
import { riskService } from "@/services/riskService";
import type { RiskAssessment } from "@/types/risk.types";
import { formatDate } from "@/utils/format";

const RISK_CONFIG = {
  LOW:      { label: "Low",      color: "text-emerald-600", bg: "bg-emerald-50  dark:bg-emerald-950/30", border: "border-emerald-200 dark:border-emerald-800", badge: "success" as const, bar: "success" as const, desc: "Procedural compliance is acceptable. Continue standard monitoring." },
  MEDIUM:   { label: "Medium",   color: "text-amber-600",   bg: "bg-amber-50    dark:bg-amber-950/30",   border: "border-amber-200   dark:border-amber-800",   badge: "warning" as const, bar: "warning" as const, desc: "Some risk factors present. Supervisor review recommended within 48 hours." },
  HIGH:     { label: "High",     color: "text-red-600",     bg: "bg-red-50      dark:bg-red-950/30",     border: "border-red-200     dark:border-red-800",     badge: "danger"  as const, bar: "danger"  as const, desc: "Significant procedural and evidentiary risks. Immediate intervention required." },
  CRITICAL: { label: "Critical", color: "text-red-700",     bg: "bg-red-100     dark:bg-red-950/40",     border: "border-red-300     dark:border-red-700",     badge: "danger"  as const, bar: "danger"  as const, desc: "CRITICAL — Multiple risk factors breached. Escalate to highest authority immediately." },
};

/**
 * Convert the numeric impact value (0-100 as string) to a display severity.
 * The backend stores impact as a numeric score coerced to string by Pydantic.
 */
function impactToSeverity(impact: string): { label: string; badge: "danger" | "warning" | "muted"; value: number } {
  const val = parseInt(impact, 10);
  const num = isNaN(val) ? 0 : Math.max(0, Math.min(100, val));
  if (num >= 70) return { label: "High",   badge: "danger",  value: num };
  if (num >= 30) return { label: "Medium", badge: "warning", value: num };
  return                { label: "Low",    badge: "muted",   value: num };
}

interface Props { caseId: string; assignedOfficerId?: string }

export function LiveRiskDashboard({ caseId }: Props) {
  const [risk, setRisk] = useState<RiskAssessment | null>(null);
  const [loading, setLoading] = useState(true);
  const [computing, setComputing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<number | null>(null);

  const fetchRisk = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      setErrorCode(null);
      const res = await riskService.getCaseRisk(caseId);
      setRisk(res.data);
    } catch (err: any) {
      setErrorCode(err.statusCode);
      if (err.statusCode === 404) {
        setRisk(null);
      } else if (err.statusCode === 403) {
        setError("You do not have authorization to view procedural risk for this case.");
      } else {
        setError(err.message || "Failed to load risk assessment.");
      }
    } finally {
      setLoading(false);
    }
  }, [caseId]);

  useEffect(() => {
    fetchRisk();
  }, [fetchRisk]);

  const handleCompute = async () => {
    try {
      setComputing(true);
      setError(null);
      setErrorCode(null);
      const res = await riskService.computeRisk(caseId);
      setRisk(res.data);
    } catch (err: any) {
      setErrorCode(err.statusCode);
      if (err.statusCode === 403) {
        setError("You do not have authorization to compute procedural risk for this case.");
      } else {
        setError(err.message || "Failed to compute risk assessment.");
      }
    } finally {
      setComputing(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center"><PageSpinner /></div>;
  }

  if (error && errorCode === 403) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center text-red-600 dark:border-red-800 dark:bg-red-950/30">
        <AlertTriangle className="h-10 w-10 mx-auto mb-3 opacity-80" />
        <h3 className="font-semibold mb-1">Access Denied</h3>
        <p className="text-sm">{error}</p>
      </div>
    );
  }

  if (error && errorCode !== 404) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center text-red-600 dark:border-red-800 dark:bg-red-950/30">
        <AlertCircle className="h-10 w-10 mx-auto mb-3 opacity-80" />
        <p className="text-sm">{error}</p>
        <button onClick={fetchRisk} className="mt-4 text-xs font-medium underline">Try Again</button>
      </div>
    );
  }

  // Separate the "dependency" factor (which reflects D-POG root blocker impact)
  // from the other procedural risk factors for clearer UX.
  const dependencyFactor = risk?.riskFactors.find(f => f.id === "dependency");
  const proceduralFactors = risk?.riskFactors.filter(f => f.id !== "dependency") ?? [];

  return (
    <div className="space-y-4">
      {/* Header controls */}
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-foreground">Current Procedural Risk</p>
        <button
          onClick={handleCompute}
          disabled={computing}
          className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium hover:bg-muted transition-colors disabled:opacity-50"
        >
          <RotateCcw className={cn("h-3.5 w-3.5", computing && "animate-spin")} />
          {computing ? "Computing..." : "Compute Risk"}
        </button>
      </div>

      {!risk ? (
        <div className="rounded-xl border border-border bg-card p-12 text-center">
          <Shield className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
          <h3 className="font-semibold text-foreground mb-1">No Risk Assessment Found</h3>
          <p className="text-sm text-muted-foreground mb-4">This case does not have a procedural risk assessment yet.</p>
          <button onClick={handleCompute} disabled={computing} className="inline-flex items-center gap-1.5 rounded-lg bg-[hsl(var(--primary))] text-primary-foreground px-4 py-2 text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50">
            {computing ? "Computing..." : "Compute Risk Now"}
          </button>
        </div>
      ) : (
        <>
          {/* Top row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Risk meter */}
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              className={cn("rounded-xl border p-6 flex flex-col items-center gap-4", RISK_CONFIG[risk.riskLevel].border, RISK_CONFIG[risk.riskLevel].bg)}>
              <CircularProgress value={risk.riskScore} size={120} strokeWidth={10} color={RISK_CONFIG[risk.riskLevel].bar} showValue />
              <div className="text-center">
                <p className={cn("text-xl font-extrabold", RISK_CONFIG[risk.riskLevel].color)}>{RISK_CONFIG[risk.riskLevel].label} Risk</p>
                <p className="text-xs text-muted-foreground mt-1">Score: {risk.riskScore}</p>
              </div>
              <StatusBadge variant={RISK_CONFIG[risk.riskLevel].badge} size="sm" dot>{RISK_CONFIG[risk.riskLevel].label}</StatusBadge>
            </motion.div>

            {/* Summary */}
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="md:col-span-2 rounded-xl border border-border bg-card p-5 space-y-4">
              <div className="flex items-start gap-3">
                <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl", RISK_CONFIG[risk.riskLevel].bg)}>
                  <Shield className={cn("h-5 w-5", RISK_CONFIG[risk.riskLevel].color)} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">Assessment Summary</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Computed: {formatDate(risk.generatedAt)}
                  </p>
                </div>
              </div>
              <p className="text-sm text-foreground leading-relaxed">{risk.summary}</p>
              <div className={cn("flex items-start gap-2 rounded-lg border p-3 text-xs", RISK_CONFIG[risk.riskLevel].border, RISK_CONFIG[risk.riskLevel].bg)}>
                <AlertTriangle className={cn("h-4 w-4 shrink-0 mt-0.5", RISK_CONFIG[risk.riskLevel].color)} />
                <p className={RISK_CONFIG[risk.riskLevel].color}>{RISK_CONFIG[risk.riskLevel].desc}</p>
              </div>
            </motion.div>
          </div>

          {/* Risk Factors */}
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="flex items-center gap-2 border-b border-border px-5 py-3.5">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm font-semibold text-foreground">Risk Factors</p>
              <span className="ml-auto text-xs text-muted-foreground">{proceduralFactors.length} factors</span>
            </div>
            {proceduralFactors.length === 0 ? (
              <div className="p-8 text-center text-sm text-muted-foreground">No specific risk factors identified.</div>
            ) : (
              <div className="divide-y divide-border">
                {proceduralFactors.map((factor, i) => {
                  const severity = impactToSeverity(factor.impact);
                  return (
                    <motion.div key={factor.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.05 * i }}
                      className="flex items-start gap-4 px-5 py-4 hover:bg-muted/30 transition-colors">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted">
                        <Info className="h-3.5 w-3.5 text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-semibold text-foreground">{factor.factor}</p>
                          <StatusBadge variant={severity.badge} size="xs">
                            {severity.label} ({severity.value})
                          </StatusBadge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{factor.description}</p>
                      </div>
                      <div className="shrink-0 w-20">
                        <ProgressBar value={severity.value} size="xs"
                          color={severity.badge === "danger" ? "danger" : severity.badge === "warning" ? "warning" : "primary"} />
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Downstream Impact (D-POG Root Blocker) — displayed separately */}
          {dependencyFactor && (
            <div className="rounded-xl border border-border bg-card overflow-hidden">
              <div className="flex items-center gap-2 border-b border-border px-5 py-3.5">
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm font-semibold text-foreground">Downstream Impact</p>
              </div>
              <div className="px-5 py-4">
                {(() => {
                  const severity = impactToSeverity(dependencyFactor.impact);
                  return (
                    <div className="flex items-start gap-4">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted">
                        <Info className="h-3.5 w-3.5 text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-semibold text-foreground">Root Blocker Impact</p>
                          <StatusBadge variant={severity.badge} size="xs">
                            {severity.label} ({severity.value})
                          </StatusBadge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{dependencyFactor.description}</p>
                        <p className="text-2xs text-muted-foreground mt-2 italic">
                          This value reflects the proportion of downstream stages blocked by an unresolved root dependency in the D-POG graph.
                          Detailed root-blocker stage information is available via the Workflow Graph tab.
                        </p>
                      </div>
                      <div className="shrink-0 w-20">
                        <ProgressBar value={severity.value} size="xs"
                          color={severity.badge === "danger" ? "danger" : severity.badge === "warning" ? "warning" : "primary"} />
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
