import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ShieldCheck, Package, Clock, CheckCircle2, Share2, AlertTriangle,
  ArrowRight, Plus, BarChart3, Activity, Lock,
} from "lucide-react";
import { DashboardLayout }  from "@/components/layout/DashboardLayout";
import { StatusBadge }       from "@/components/ui/feedback/StatusBadge";
import { ProgressBar }       from "@/components/ui/feedback/ProgressBar";
import { CircularProgress }  from "@/components/ui/feedback/ProgressBar";
import { Spinner }           from "@/components/ui/feedback/Spinner";
import { cn }                from "@/lib/utils";
import { ROUTES }            from "@/router/routes";
import { evidenceService }   from "@/services/evidenceService";
import { EVIDENCE_ITEMS }    from "@/data/evidence.items";
import { EVIDENCE_ALERTS }   from "@/data/evidence.data";
import { EVIDENCE_STATUS_LABEL, EVIDENCE_STATUS_BADGE, AGENCY_LABEL, AGENCY_COLOR, truncateHash } from "@/utils/evidence.utils";
import { formatRelativeTime } from "@/utils/format";
import type { EvidenceDashboardStats } from "@/types/evidence.types";

const FADE = { initial:{opacity:0,y:10}, animate:{opacity:1,y:0} };

export default function EvidenceDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<EvidenceDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    evidenceService.getStats().then(r => { setStats(r.data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return <DashboardLayout><div className="flex h-64 items-center justify-center"><Spinner size="lg" /></div></DashboardLayout>;

  const kpis = [
    { label:"Total Evidence",        value:stats?.total ?? 0,              icon:Package,       bg:"bg-royal-50   dark:bg-royal-950/40",   text:"text-royal-600"   },
    { label:"Pending Verification",  value:stats?.pendingVerification ?? 0, icon:Clock,        bg:"bg-amber-50   dark:bg-amber-950/40",   text:"text-amber-600"   },
    { label:"Verified",              value:stats?.verified ?? 0,            icon:CheckCircle2,  bg:"bg-emerald-50 dark:bg-emerald-950/40", text:"text-emerald-600" },
    { label:"Shared Cross-Agency",   value:stats?.sharedAcrossAgencies ?? 0,icon:Share2,       bg:"bg-purple-50  dark:bg-purple-950/40",  text:"text-purple-600"  },
    { label:"In Transit",            value:stats?.inTransit ?? 0,           icon:Activity,      bg:"bg-blue-50    dark:bg-blue-950/40",    text:"text-blue-600"    },
    { label:"Court Submitted",       value:stats?.courtSubmitted ?? 0,      icon:ShieldCheck,   bg:"bg-slate-100  dark:bg-slate-800/50",   text:"text-slate-600"   },
  ];

  const unresolvedAlerts = EVIDENCE_ALERTS.filter(a => !a.resolved);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* ── Header ── */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2.5">
              <ShieldCheck className="h-6 w-6 text-[hsl(var(--primary))]" />
              Evidence Management
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Cross-Agency Secure Evidence &amp; Chain-of-Custody System
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => navigate(ROUTES.EVIDENCE_ANALYTICS)}
              className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-xs font-medium hover:bg-muted transition-colors">
              <BarChart3 className="h-3.5 w-3.5" /> Analytics
            </button>
            <button onClick={() => navigate(ROUTES.EVIDENCE_REGISTER)}
              className="inline-flex items-center gap-2 rounded-lg bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))]/90 px-4 py-2 text-xs font-bold text-white transition-colors shadow-sm">
              <Plus className="h-3.5 w-3.5" /> Register Evidence
            </button>
          </div>
        </div>

        {/* ── Alerts strip ── */}
        {unresolvedAlerts.length > 0 && (
          <motion.div {...FADE} transition={{ delay:0.05 }}
            className="rounded-xl border border-red-200 bg-red-50 dark:bg-red-950/20 dark:border-red-900/60 p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-4 w-4 text-red-600 shrink-0" />
              <p className="text-sm font-semibold text-red-700 dark:text-red-400">
                {unresolvedAlerts.length} Active Evidence Alert{unresolvedAlerts.length > 1 ? "s" : ""}
              </p>
            </div>
            <div className="space-y-1.5">
              {unresolvedAlerts.slice(0,3).map(a => (
                <div key={a.id} className="flex items-start gap-2 text-xs text-red-600 dark:text-red-400">
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-red-500" />
                  <span><strong>{a.evidenceRef}</strong> — {a.message}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* ── KPI cards ── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-4">
          {kpis.map((k, i) => (
            <motion.div key={k.label} {...FADE} transition={{ delay:0.06*i }}
              whileHover={{ y:-2, transition:{ duration:0.15 } }}
              className="rounded-xl border border-border bg-card p-4 hover:shadow-md transition-all cursor-default">
              <div className={cn("flex h-9 w-9 items-center justify-center rounded-xl mb-3", k.bg)}>
                <k.icon className={cn("h-4 w-4", k.text)} />
              </div>
              <p className="text-2xl font-extrabold text-foreground">{k.value}</p>
              <p className="text-2xs text-muted-foreground mt-0.5 leading-tight">{k.label}</p>
            </motion.div>
          ))}
        </div>

        {/* ── Integrity + chain health ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <motion.div {...FADE} transition={{ delay:0.3 }}
            className="md:col-span-1 rounded-xl border border-border bg-card p-5 flex flex-col items-center gap-3">
            <CircularProgress value={stats?.integrityHealth ?? 94} size={88} strokeWidth={8} color="success" showValue label="Integrity Health" />
            <p className="text-xs text-center text-muted-foreground">All evidence hash checks passing</p>
          </motion.div>
          <motion.div {...FADE} transition={{ delay:0.35 }}
            className="md:col-span-1 rounded-xl border border-border bg-card p-5 flex flex-col items-center gap-3">
            <CircularProgress value={stats?.chainHealth ?? 97} size={88} strokeWidth={8} color="primary" showValue label="Chain Health" />
            <p className="text-xs text-center text-muted-foreground">Custody chain completeness</p>
          </motion.div>

          <motion.div {...FADE} transition={{ delay:0.4 }}
            className="md:col-span-2 rounded-xl border border-border bg-card p-5">
            <p className="text-sm font-semibold text-foreground mb-3">Security Status</p>
            <div className="space-y-3">
              {[
                { label:"Encrypted Items",          value:100, color:"success" as const },
                { label:"Hash Verified",            value:Math.round((stats?.verified ?? 31)/((stats?.total ?? 47)||1)*100), color:"success" as const },
                { label:"Pending Verification",     value:Math.round((stats?.pendingVerification ?? 8)/((stats?.total ?? 47)||1)*100), color:"warning" as const },
                { label:"Chain Completeness",       value:stats?.chainHealth ?? 97, color:"primary" as const },
              ].map(s => (
                <div key={s.label} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">{s.label}</span>
                    <span className="font-semibold text-foreground">{s.value}%</span>
                  </div>
                  <ProgressBar value={s.value} color={s.color} size="xs" />
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* ── Evidence list ── */}
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <p className="text-sm font-semibold text-foreground">Evidence Items</p>
            <button onClick={() => navigate(ROUTES.EVIDENCE)}
              className="text-xs text-[hsl(var(--primary))] hover:underline flex items-center gap-1">
              View all <ArrowRight className="h-3 w-3" />
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  {["Evidence ID","Case","Type","Current Custody","Status","Integrity","Updated"].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-2xs font-semibold uppercase tracking-wider text-muted-foreground whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {EVIDENCE_ITEMS.map((e, i) => {
                  const agCol = AGENCY_COLOR[e.currentCustody];
                  return (
                    <motion.tr key={e.id} initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.04*i }}
                      onClick={() => navigate(ROUTES.EVIDENCE_DETAIL.replace(":evidenceId", e.id))}
                      className="border-b border-border last:border-0 hover:bg-muted/40 transition-colors cursor-pointer">
                      <td className="px-4 py-3.5">
                        <p className="text-xs font-mono font-semibold text-[hsl(var(--primary))]">{e.evidenceId}</p>
                        <p className="text-2xs text-muted-foreground mt-0.5">{e.sealNumber}</p>
                      </td>
                      <td className="px-4 py-3.5 text-xs text-foreground font-mono whitespace-nowrap">{e.caseNumber.split("/").pop()}</td>
                      <td className="px-4 py-3.5 text-xs text-foreground capitalize whitespace-nowrap">{e.type.replace(/_/g," ")}</td>
                      <td className="px-4 py-3.5">
                        <span className={cn("rounded-full border px-2 py-0.5 text-2xs font-semibold", agCol.bg, agCol.text, agCol.border)}>
                          {AGENCY_LABEL[e.currentCustody]}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <StatusBadge variant={EVIDENCE_STATUS_BADGE[e.status]} size="xs" dot>
                          {EVIDENCE_STATUS_LABEL[e.status]}
                        </StatusBadge>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1.5">
                          {e.verificationStatus === "verified"
                            ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                            : <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />}
                          <span className={cn("text-2xs font-medium", e.verificationStatus==="verified" ? "text-emerald-600" : "text-amber-600")}>
                            {e.verificationStatus === "verified" ? "Verified" : "Pending"}
                          </span>
                        </div>
                        <p className="text-2xs text-muted-foreground font-mono mt-0.5">{truncateHash(e.currentHash, 12)}</p>
                      </td>
                      <td className="px-4 py-3.5 text-xs text-muted-foreground whitespace-nowrap">{formatRelativeTime(e.updatedAt)}</td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── Recent chain events ── */}
        <div className="rounded-xl border border-border bg-card p-5">
          <p className="text-sm font-semibold text-foreground mb-4">Recent Custody Events</p>
          <div className="relative pl-5">
            <div className="absolute left-2 top-0 bottom-0 w-0.5 bg-border" />
            <div className="space-y-3">
              {EVIDENCE_ITEMS.flatMap(e => e.chain.slice(-2).map(c => ({ ...c, evidenceId:e.evidenceId, evidenceRef:e.id })))
                .sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                .slice(0,6).map((event, i) => {
                  const agCol = AGENCY_COLOR[event.agency];
                  return (
                    <motion.div key={event.id} initial={{ opacity:0, x:-8 }} animate={{ opacity:1, x:0 }} transition={{ delay:i*0.05 }}
                      className="flex items-start gap-3">
                      <div className={cn("h-4 w-4 rounded-full border-2 border-emerald-500 bg-card z-10 shrink-0 mt-0.5")} />
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-xs font-semibold text-foreground">{event.action.replace(/_/g," ").replace(/\b\w/g,c=>c.toUpperCase())}</p>
                          <span className={cn("rounded-full border px-2 py-0.5 text-2xs font-medium", agCol.bg, agCol.text, agCol.border)}>{AGENCY_LABEL[event.agency]}</span>
                          <span className="text-2xs font-mono text-[hsl(var(--primary))]">{(event as typeof event & {evidenceId:string}).evidenceId}</span>
                        </div>
                        <p className="text-2xs text-muted-foreground mt-0.5">{event.officer} · {formatRelativeTime(event.timestamp)}</p>
                      </div>
                      <Lock className="h-3 w-3 text-muted-foreground/40 shrink-0 mt-1" />
                    </motion.div>
                  );
                })}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
