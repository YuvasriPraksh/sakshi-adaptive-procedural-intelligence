import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, Shield, CheckCircle2, Clock, Circle,
  AlertTriangle, Phone, HelpCircle, Lock, Globe,
} from "lucide-react";
import { PublicLayout }  from "@/components/layout/PublicLayout";
import { ProgressBar }   from "@/components/ui/feedback/ProgressBar";
import { StatusBadge }   from "@/components/ui/feedback/StatusBadge";
import { cn }            from "@/lib/utils";

// ─── Public tracking data (NO confidential info) ─────────────────────────────
interface PublicCase {
  trackId:       string;
  caseNumber:    string;
  currentStage:  string;
  stageOrder:    number;
  totalStages:   number;
  status:        "registered"|"in_progress"|"under_review"|"completed"|"closed";
  lastUpdated:   string;
  estimatedNext: string;
  helplineRef:   string;
  timeline: { stage:string; done:boolean; active:boolean; date?:string }[];
}

const PUBLIC_CASES: Record<string, PublicCase> = {
  "SAKSHI/2024/001842": {
    trackId:"TRK-842", caseNumber:"SAKSHI/2024/001842",
    currentStage:"Medical Examination", stageOrder:4, totalStages:9,
    status:"in_progress", lastUpdated:"20 Feb 2024", estimatedNext:"Evidence Collection",
    helplineRef:"HL-2024-842",
    timeline:[
      { stage:"Complaint Registered", done:true,  active:false, date:"15 Jan 2024" },
      { stage:"FIR Registered",        done:true,  active:false, date:"16 Jan 2024" },
      { stage:"Statement Recorded",    done:true,  active:false, date:"18 Jan 2024" },
      { stage:"Medical Examination",   done:false, active:true  },
      { stage:"Evidence Collection",   done:false, active:false },
      { stage:"Forensic Examination",  done:false, active:false },
      { stage:"Witness Statements",    done:false, active:false },
      { stage:"Charge Sheet",          done:false, active:false },
      { stage:"Court Submission",      done:false, active:false },
    ],
  },
  "SAKSHI/2024/001839": {
    trackId:"TRK-839", caseNumber:"SAKSHI/2024/001839",
    currentStage:"Court Submission", stageOrder:9, totalStages:9,
    status:"completed", lastUpdated:"20 Feb 2024", estimatedNext:"Court Date Pending",
    helplineRef:"HL-2024-839",
    timeline:[
      { stage:"Complaint Registered", done:true, active:false, date:"11 Jan 2024" },
      { stage:"FIR Registered",        done:true, active:false, date:"12 Jan 2024" },
      { stage:"Statement Recorded",    done:true, active:false, date:"14 Jan 2024" },
      { stage:"Medical Examination",   done:true, active:false, date:"16 Jan 2024" },
      { stage:"Evidence Collection",   done:true, active:false, date:"19 Jan 2024" },
      { stage:"Forensic Examination",  done:true, active:false, date:"01 Feb 2024" },
      { stage:"Witness Statements",    done:true, active:false, date:"05 Feb 2024" },
      { stage:"Charge Sheet",          done:true, active:false, date:"12 Feb 2024" },
      { stage:"Court Submission",      done:true, active:true,  date:"20 Feb 2024" },
    ],
  },
  "SAKSHI/2024/001841": {
    trackId:"TRK-841", caseNumber:"SAKSHI/2024/001841",
    currentStage:"Statement Recording", stageOrder:3, totalStages:9,
    status:"in_progress", lastUpdated:"16 Feb 2024", estimatedNext:"Medical Examination",
    helplineRef:"HL-2024-841",
    timeline:[
      { stage:"Complaint Registered", done:true,  active:false, date:"14 Jan 2024" },
      { stage:"FIR Registered",        done:true,  active:false, date:"15 Jan 2024" },
      { stage:"Statement Recorded",    done:false, active:true  },
      { stage:"Medical Examination",   done:false, active:false },
      { stage:"Evidence Collection",   done:false, active:false },
      { stage:"Forensic Examination",  done:false, active:false },
      { stage:"Witness Statements",    done:false, active:false },
      { stage:"Charge Sheet",          done:false, active:false },
      { stage:"Court Submission",      done:false, active:false },
    ],
  },
};

const STATUS_CONFIG = {
  registered:   { badge:"primary"  as const, label:"Registered"   },
  in_progress:  { badge:"success"  as const, label:"In Progress"  },
  under_review: { badge:"info"     as const, label:"Under Review" },
  completed:    { badge:"muted"    as const, label:"Completed"    },
  closed:       { badge:"muted"    as const, label:"Closed"       },
};

export default function CitizenPortalPage() {
  const [query,   setQuery]   = useState("");
  const [result,  setResult]  = useState<PublicCase | null>(null);
  const [error,   setError]   = useState("");
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    const key = query.trim().toUpperCase();
    if (!key) { setError("Please enter a case number."); return; }
    setLoading(true); setError(""); setResult(null);
    await new Promise(r => setTimeout(r, 800));
    const found = PUBLIC_CASES[key];
    if (found) { setResult(found); }
    else { setError("Case not found. Please verify the case number provided by your Helpline Officer."); }
    setLoading(false);
  };

  const pct = result ? Math.round((result.stageOrder / result.totalStages) * 100) : 0;

  return (
    <PublicLayout>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-12">
        {/* Hero */}
        <div className="mx-auto max-w-3xl px-4 text-center mb-10">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-[hsl(var(--primary))] text-white mb-4 shadow-lg">
            <Globe className="h-7 w-7" />
          </div>
          <h1 className="text-3xl font-extrabold text-foreground">SAKSHI Citizen Portal</h1>
          <p className="mt-2 text-muted-foreground max-w-lg mx-auto leading-relaxed">
            Track the progress of a POCSO investigation case. Enter your case reference number to see the current status.
          </p>
          <div className="mt-3 flex flex-wrap justify-center gap-3 text-xs">
            {[{ icon:Lock, text:"No personal data shown" },{ icon:Shield, text:"POCSO Act 2012 compliant" },{ icon:HelpCircle, text:"Helpline: 1098" }].map(b => (
              <span key={b.text} className="flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-muted-foreground">
                <b.icon className="h-3.5 w-3.5 text-[hsl(var(--primary))]" /> {b.text}
              </span>
            ))}
          </div>
        </div>

        {/* Search box */}
        <div className="mx-auto max-w-2xl px-4">
          <motion.div initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} className="rounded-2xl border border-border bg-card shadow-md p-6">
            <p className="text-sm font-semibold text-foreground mb-3">Enter Case Number</p>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <input value={query} onChange={e => setQuery(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleSearch()}
                  placeholder="e.g. SAKSHI/2024/001842"
                  className="w-full h-11 rounded-xl border border-border bg-background pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))] dark:bg-slate-900 dark:text-white" />
              </div>
              <button onClick={handleSearch} disabled={loading}
                className="h-11 rounded-xl bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))]/90 px-6 text-sm font-bold text-white transition-colors disabled:opacity-60 whitespace-nowrap">
                {loading ? "Searching…" : "Track Case"}
              </button>
            </div>
            {error && (
              <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }}
                className="mt-3 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-900 p-3">
                <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                <p className="text-xs text-amber-700 dark:text-amber-400">{error}</p>
              </motion.div>
            )}
            <p className="text-2xs text-muted-foreground mt-3">Try: SAKSHI/2024/001842 · SAKSHI/2024/001839 · SAKSHI/2024/001841</p>
          </motion.div>
        </div>

        {/* Results */}
        <AnimatePresence>
          {result && (
            <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }} transition={{ duration:0.3 }}
              className="mx-auto max-w-2xl px-4 mt-6 space-y-4">
              {/* Status card */}
              <div className="rounded-2xl border border-border bg-card shadow-sm p-6 space-y-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-mono text-sm font-bold text-[hsl(var(--primary))]">{result.caseNumber}</p>
                      <StatusBadge variant={STATUS_CONFIG[result.status].badge} size="sm" dot>
                        {STATUS_CONFIG[result.status].label}
                      </StatusBadge>
                    </div>
                    <p className="text-base font-bold text-foreground mt-1">Case Status Overview</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Last updated: {result.lastUpdated}</p>
                  </div>
                  <div className="text-center shrink-0">
                    <p className="text-3xl font-extrabold text-[hsl(var(--primary))]">{pct}%</p>
                    <p className="text-2xs text-muted-foreground">Complete</p>
                  </div>
                </div>
                <ProgressBar value={pct} color={pct === 100 ? "success" : "primary"} size="md" showValue />
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                  <InfoBox label="Current Stage"    value={result.currentStage}  />
                  <InfoBox label="Stages Completed" value={`${result.stageOrder} of ${result.totalStages}`} />
                  <InfoBox label="Next Step"        value={result.estimatedNext} highlight />
                </div>
              </div>

              {/* Timeline */}
              <div className="rounded-2xl border border-border bg-card shadow-sm p-6">
                <p className="text-sm font-semibold text-foreground mb-5">Investigation Timeline</p>
                <div className="relative pl-4">
                  <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-border" />
                  <div className="space-y-2">
                    {result.timeline.map((step, i) => (
                      <motion.div key={i} initial={{ opacity:0, x:-8 }} animate={{ opacity:1, x:0 }} transition={{ delay: i*0.06 }}
                        className="flex items-center gap-3">
                        <div className={cn(
                          "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 z-10 bg-card",
                          step.done   && "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40",
                          step.active && "border-[hsl(var(--primary))] bg-[hsl(var(--primary))]/10",
                          !step.done && !step.active && "border-border",
                        )}>
                          {step.done   ? <CheckCircle2 className="h-4 w-4 text-emerald-600" /> :
                           step.active ? <Clock className="h-4 w-4 text-[hsl(var(--primary))] animate-pulse" /> :
                           <Circle className="h-4 w-4 text-muted-foreground/30" />}
                        </div>
                        <div className="flex-1 flex items-center justify-between py-2 border-b border-border last:border-0">
                          <p className={cn("text-sm",
                            step.done   ? "text-foreground" :
                            step.active ? "text-[hsl(var(--primary))] font-semibold" :
                            "text-muted-foreground")}>
                            {step.stage}
                            {step.active && <span className="ml-2 text-2xs rounded-full bg-[hsl(var(--primary))]/10 text-[hsl(var(--primary))] px-2 py-0.5 font-medium">Current</span>}
                          </p>
                          {step.date && <p className="text-2xs text-muted-foreground shrink-0">{step.date}</p>}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Helpline */}
              <div className="rounded-2xl border border-[hsl(var(--primary))]/20 bg-[hsl(var(--primary))]/5 p-5">
                <div className="flex items-start gap-3">
                  <Phone className="h-5 w-5 text-[hsl(var(--primary))] shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-foreground">Need Assistance?</p>
                    <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                      For more information about this case, contact your assigned helpline officer and provide the reference: <strong className="font-mono text-foreground">{result.helplineRef}</strong>
                    </p>
                    <div className="flex flex-wrap gap-3 mt-3">
                      <span className="rounded-full border border-[hsl(var(--primary))]/20 bg-white dark:bg-slate-800 px-3 py-1 text-xs font-semibold text-[hsl(var(--primary))]">📞 Helpline: 1098</span>
                      <span className="rounded-full border border-[hsl(var(--primary))]/20 bg-white dark:bg-slate-800 px-3 py-1 text-xs font-semibold text-[hsl(var(--primary))]">🌐 CHILDLINE: www.childlineindia.org</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PublicLayout>
  );
}

function InfoBox({ label, value, highlight }: { label:string; value:string; highlight?:boolean }) {
  return (
    <div className={cn("rounded-xl p-3 text-center", highlight ? "bg-[hsl(var(--primary))]/10 border border-[hsl(var(--primary))]/20" : "bg-muted/50")}>
      <p className="text-2xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className={cn("text-sm font-bold mt-1", highlight ? "text-[hsl(var(--primary))]" : "text-foreground")}>{value}</p>
    </div>
  );
}
