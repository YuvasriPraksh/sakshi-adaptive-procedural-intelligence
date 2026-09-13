import { motion } from "framer-motion";
import { Shield, AlertTriangle, TrendingUp, Info } from "lucide-react";
import { CircularProgress, ProgressBar } from "@/components/ui/feedback/ProgressBar";
import { StatusBadge } from "@/components/ui/feedback/StatusBadge";
import { cn } from "@/lib/utils";
import { RISK_REPORTS } from "@/data/ai.data";
import { CASES } from "@/data/cases.data";

const RISK_CONFIG = {
  low:      { label: "Low",      color: "text-emerald-600", bg: "bg-emerald-50  dark:bg-emerald-950/30", border: "border-emerald-200 dark:border-emerald-800", badge: "success" as const, bar: "success" as const, desc: "Procedural compliance is acceptable. Continue standard monitoring." },
  medium:   { label: "Medium",   color: "text-amber-600",   bg: "bg-amber-50    dark:bg-amber-950/30",   border: "border-amber-200   dark:border-amber-800",   badge: "warning" as const, bar: "warning" as const, desc: "Some risk factors present. Supervisor review recommended within 48 hours." },
  high:     { label: "High",     color: "text-red-600",     bg: "bg-red-50      dark:bg-red-950/30",     border: "border-red-200     dark:border-red-800",     badge: "danger"  as const, bar: "danger"  as const, desc: "Significant procedural and evidentiary risks. Immediate intervention required." },
  critical: { label: "Critical", color: "text-red-700",     bg: "bg-red-100     dark:bg-red-950/40",     border: "border-red-300     dark:border-red-700",     badge: "danger"  as const, bar: "danger"  as const, desc: "CRITICAL — Multiple risk factors breached. Escalate to highest authority immediately." },
};

const IMPACT_BADGE = {
  high:   "danger"  as const,
  medium: "warning" as const,
  low:    "muted"   as const,
};

interface Props { caseId: string }

export function RiskDashboard({ caseId }: Props) {
  const report   = RISK_REPORTS.find(r => r.caseId === caseId) ?? RISK_REPORTS[0];
  const caseData = CASES.find(c => c.id === caseId);
  const config   = RISK_CONFIG[report.riskLevel];

  return (
    <div className="space-y-4">
      {/* Top row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Risk meter */}
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
          className={cn("rounded-xl border p-6 flex flex-col items-center gap-4", config.border, config.bg)}>
          <CircularProgress value={report.riskScore} size={120} strokeWidth={10} color={report.riskLevel === "low" ? "success" : report.riskLevel === "medium" ? "warning" : "danger"} showValue />
          <div className="text-center">
            <p className={cn("text-xl font-extrabold", config.color)}>{config.label} Risk</p>
            <p className="text-xs text-muted-foreground mt-1">Score: {report.riskScore}/100</p>
          </div>
          <StatusBadge variant={config.badge} size="sm" dot>{config.label}</StatusBadge>
        </motion.div>

        {/* Summary + case info */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="md:col-span-2 rounded-xl border border-border bg-card p-5 space-y-4">
          <div className="flex items-start gap-3">
            <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl", config.bg)}>
              <Shield className={cn("h-5 w-5", config.color)} />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Risk Assessment Summary</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {caseData?.caseNumber} · {caseData?.district}
              </p>
            </div>
          </div>
          <p className="text-sm text-foreground leading-relaxed">{report.summary}</p>
          <div className={cn("flex items-start gap-2 rounded-lg border p-3 text-xs", config.border, config.bg)}>
            <AlertTriangle className={cn("h-4 w-4 shrink-0 mt-0.5", config.color)} />
            <p className={config.color}>{config.desc}</p>
          </div>

          {/* Score breakdown bars */}
          <div className="space-y-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Score Breakdown</p>
            {[
              { label: "Evidence Integrity",   score: 60 },
              { label: "Procedural Compliance",score: 45 },
              { label: "Victim Safety",        score: 85 },
              { label: "Timeline Adherence",   score: 30 },
            ].map(item => (
              <div key={item.label} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">{item.label}</span>
                  <span className="font-semibold text-foreground">{item.score}%</span>
                </div>
                <ProgressBar value={item.score} size="xs"
                  color={item.score >= 70 ? "success" : item.score >= 40 ? "warning" : "danger"} />
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Risk factors */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="flex items-center gap-2 border-b border-border px-5 py-3.5">
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
          <p className="text-sm font-semibold text-foreground">Risk Factors</p>
          <span className="ml-auto text-xs text-muted-foreground">{report.riskFactors.length} factors identified</span>
        </div>
        <div className="divide-y divide-border">
          {report.riskFactors.map((factor, i) => (
            <motion.div key={factor.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.05 * i }}
              className="flex items-start gap-4 px-5 py-4 hover:bg-muted/30 transition-colors">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted">
                <Info className="h-3.5 w-3.5 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-sm font-semibold text-foreground">{factor.factor}</p>
                  <StatusBadge variant={IMPACT_BADGE[factor.impact]} size="xs">
                    {factor.impact.charAt(0).toUpperCase() + factor.impact.slice(1)} Impact
                  </StatusBadge>
                </div>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{factor.description}</p>
              </div>
              <div className="shrink-0 w-20">
                <ProgressBar value={factor.impact === "high" ? 85 : factor.impact === "medium" ? 55 : 25}
                  size="xs" color={IMPACT_BADGE[factor.impact] === "danger" ? "danger" : factor.impact === "medium" ? "warning" : "primary"} />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
