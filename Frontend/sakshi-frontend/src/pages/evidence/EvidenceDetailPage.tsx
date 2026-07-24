import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft, ShieldCheck, ChevronRight, AlertTriangle,
  CheckCircle2, Clock, RotateCcw, Share2, Download, Fingerprint,
} from "lucide-react";
import { DashboardLayout }  from "@/components/layout/DashboardLayout";
import { StatusBadge }       from "@/components/ui/feedback/StatusBadge";
import { Spinner }           from "@/components/ui/feedback/Spinner";
import { cn }                from "@/lib/utils";
import { ROUTES }            from "@/router/routes";
import { evidenceService }   from "@/services/evidenceService";
import { EVIDENCE_STATUS_LABEL, EVIDENCE_STATUS_BADGE, AGENCY_LABEL, AGENCY_COLOR, ACTION_LABEL, VERIFICATION_BADGE, truncateHash } from "@/utils/evidence.utils";
import { formatDate, formatDateTime } from "@/utils/format";
import type { EvidenceItem } from "@/types/evidence.types";
import { ChainOfCustody } from "./components/ChainOfCustody";
import { IntegrityPanel }  from "./components/IntegrityPanel";
import { EvidenceSharing } from "./components/EvidenceSharing";
import { VersionHistory }  from "./components/VersionHistory";
import { EvidenceAuditLog } from "./components/EvidenceAuditLog";

const TABS = ["Overview","Chain of Custody","Integrity","Sharing","History","Audit Log"] as const;
type Tab = typeof TABS[number];

export default function EvidenceDetailPage() {
  const { evidenceId } = useParams<{ evidenceId: string }>();
  const navigate = useNavigate();
  const [evidence, setEvidence] = useState<EvidenceItem | null>(null);
  const [loading,  setLoading]  = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>("Overview");

  useEffect(() => {
    if (!evidenceId) return;
    evidenceService.getById(evidenceId)
      .then(r => { setEvidence(r.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [evidenceId]);

  if (loading) return <DashboardLayout><div className="flex h-64 items-center justify-center"><Spinner size="lg" /></div></DashboardLayout>;
  if (!evidence) return (
    <DashboardLayout>
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <AlertTriangle className="h-12 w-12 text-amber-400" />
        <p className="text-lg font-semibold text-foreground">Evidence not found</p>
        <button onClick={() => navigate(ROUTES.EVIDENCE)}
          className="text-sm text-[hsl(var(--primary))] hover:underline">← Back to Evidence</button>
      </div>
    </DashboardLayout>
  );

  const agCol = AGENCY_COLOR[evidence.currentCustody];

  return (
    <DashboardLayout>
      <div className="space-y-5">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <button onClick={() => navigate(ROUTES.EVIDENCE)} className="hover:text-foreground flex items-center gap-1 transition-colors">
            <ArrowLeft className="h-3.5 w-3.5" /> Evidence
          </button>
          <ChevronRight className="h-3 w-3" />
          <span className="font-mono font-semibold text-foreground">{evidence.evidenceId}</span>
        </div>

        {/* Header */}
        <motion.div initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }}
          className="rounded-xl border border-border bg-card p-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-sm font-bold text-[hsl(var(--primary))]">{evidence.evidenceId}</span>
                <StatusBadge variant={EVIDENCE_STATUS_BADGE[evidence.status]} size="xs" dot>{EVIDENCE_STATUS_LABEL[evidence.status]}</StatusBadge>
                <StatusBadge variant={VERIFICATION_BADGE[evidence.verificationStatus]} size="xs">
                  {evidence.verificationStatus === "verified" ? "✓ Hash Verified" : "Verification Pending"}
                </StatusBadge>
              </div>
              <h1 className="text-xl font-bold text-foreground capitalize">{evidence.type.replace(/_/g," ")} Evidence</h1>
              <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                <span>Case: <span className="font-mono text-[hsl(var(--primary))]">{evidence.caseNumber}</span></span>
                <span>Seal: <span className="font-mono text-foreground">{evidence.sealNumber}</span></span>
                <span>Token: <span className="font-mono text-foreground">{evidence.evidenceToken}</span></span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => navigate(ROUTES.EVIDENCE_DETAIL.replace(":evidenceId", evidenceId!) + "/transfer")}
                className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card hover:bg-muted px-3 py-2 text-xs font-medium transition-colors">
                <Share2 className="h-3.5 w-3.5" /> Transfer
              </button>
              <button className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card hover:bg-muted px-3 py-2 text-xs font-medium transition-colors">
                <Download className="h-3.5 w-3.5" /> Export
              </button>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label:"Current Custody", value:<span className={cn("rounded-full border px-2 py-0.5 text-xs font-semibold", agCol.bg, agCol.text, agCol.border)}>{AGENCY_LABEL[evidence.currentCustody]}</span> },
              { label:"Officer", value:<span className="text-sm font-medium text-foreground">{evidence.currentOfficer}</span> },
              { label:"Collected", value:<span className="text-sm text-foreground">{formatDate(evidence.collectionDate)}</span> },
              { label:"Chain Events", value:<span className="text-2xl font-bold text-[hsl(var(--primary))]">{evidence.chain.length}</span> },
            ].map(item => (
              <div key={item.label} className="rounded-lg bg-muted/40 px-3 py-2.5">
                <p className="text-2xs text-muted-foreground mb-1">{item.label}</p>
                {item.value}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="flex items-center gap-0 overflow-x-auto no-scrollbar border-b border-border">
          {TABS.map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={cn("flex items-center gap-1.5 whitespace-nowrap px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px",
                activeTab === tab ? "border-[hsl(var(--primary))] text-[hsl(var(--primary))]" : "border-transparent text-muted-foreground hover:text-foreground")}>
              {tab}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <motion.div key={activeTab} initial={{ opacity:0, y:6 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.2 }}>
          {activeTab === "Overview"          && <OverviewTab evidence={evidence} />}
          {activeTab === "Chain of Custody"  && <ChainOfCustody events={evidence.chain} />}
          {activeTab === "Integrity"         && <IntegrityPanel evidence={evidence} onUpdated={setEvidence} />}
          {activeTab === "Sharing"           && <EvidenceSharing evidence={evidence} />}
          {activeTab === "History"           && <VersionHistory versions={evidence.versions} />}
          {activeTab === "Audit Log"         && <EvidenceAuditLog logs={evidence.auditLogs} />}
        </motion.div>
      </div>
    </DashboardLayout>
  );
}

function OverviewTab({ evidence }: { evidence: EvidenceItem }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div className="lg:col-span-2 space-y-4">
        <div className="rounded-xl border border-border bg-card p-5">
          <p className="text-sm font-semibold text-foreground mb-4">Evidence Information</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6">
            {[
              { label:"Evidence ID",     value:evidence.evidenceId },
              { label:"Type",            value:evidence.type.replace(/_/g," ") },
              { label:"Case Number",     value:evidence.caseNumber },
              { label:"Collected By",    value:`${evidence.collectedBy} (${evidence.collectedByRole})` },
              { label:"Agency",          value:AGENCY_LABEL[evidence.agency] },
              { label:"Collection Date", value:formatDate(evidence.collectionDate) },
              { label:"Collection Time", value:evidence.collectionTime },
              { label:"GPS Location",    value:evidence.gpsLocation },
              { label:"Seal Number",     value:evidence.sealNumber },
              { label:"Photographs",     value:`${evidence.photographs} photos` },
              { label:"Weight",          value:evidence.weight ?? "—" },
              { label:"Dimensions",      value:evidence.dimensions ?? "—" },
            ].map(item => (
              <div key={item.label}>
                <p className="text-2xs font-semibold uppercase tracking-widest text-muted-foreground mb-0.5">{item.label}</p>
                <p className="text-sm font-medium text-foreground capitalize">{item.value}</p>
              </div>
            ))}
          </div>
          {evidence.notes && (
            <div className="mt-4 pt-4 border-t border-border">
              <p className="text-2xs font-semibold uppercase tracking-widest text-muted-foreground mb-1">Notes</p>
              <p className="text-sm text-foreground">{evidence.notes}</p>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <div className="rounded-xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50 dark:bg-emerald-950/20 p-5">
          <div className="flex items-center gap-2 mb-3">
            <Fingerprint className="h-4 w-4 text-emerald-600" />
            <p className="text-sm font-semibold text-foreground">Hash Verification</p>
          </div>
          <div className="space-y-3 text-xs">
            <div>
              <p className="text-muted-foreground mb-1">Original SHA-256</p>
              <p className="font-mono text-2xs bg-muted/60 rounded px-2 py-1.5 break-all text-foreground">{truncateHash(evidence.initialHash, 32)}</p>
            </div>
            <div>
              <p className="text-muted-foreground mb-1">Current Hash</p>
              <p className="font-mono text-2xs bg-muted/60 rounded px-2 py-1.5 break-all text-foreground">{truncateHash(evidence.currentHash, 32)}</p>
            </div>
            <div className="flex items-center gap-2 pt-1">
              {evidence.initialHash === evidence.currentHash
                ? <><CheckCircle2 className="h-4 w-4 text-emerald-500" /><span className="text-emerald-600 font-semibold">Hashes Match — Integrity Confirmed</span></>
                : <><AlertTriangle className="h-4 w-4 text-red-500" /><span className="text-red-600 font-semibold">Hash Mismatch — Evidence Compromised</span></>}
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-5">
          <p className="text-sm font-semibold text-foreground mb-3">QR / Token</p>
          <div className="flex flex-col items-center gap-3">
            <div className="h-24 w-24 rounded-xl bg-muted/50 border border-border flex items-center justify-center">
              <div className="grid grid-cols-5 gap-0.5">
                {Array.from({length:25}).map((_,i) => (
                  <div key={i} className={cn("h-4 w-4 rounded-sm", Math.random()>0.5?"bg-foreground":"bg-transparent")} />
                ))}
              </div>
            </div>
            <p className="text-2xs font-mono text-center text-muted-foreground break-all">{evidence.evidenceToken}</p>
            <p className="text-2xs text-muted-foreground text-center">Scan to access evidence record</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function EvidenceDetailPage() {
  const { evidenceId } = useParams<{ evidenceId: string }>();
  const navigate = useNavigate();
  const [evidence, setEvidence] = useState<EvidenceItem|null>(null);
  const [loading,  setLoading]  = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>("Overview");

  useEffect(() => {
    if (!evidenceId) return;
    evidenceService.getById(evidenceId)
      .then(r => { setEvidence(r.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [evidenceId]);

  if (loading) return <DashboardLayout><div className="flex h-64 items-center justify-center"><Spinner size="lg" /></div></DashboardLayout>;
  if (!evidence) return (
    <DashboardLayout>
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <AlertTriangle className="h-12 w-12 text-amber-400" />
        <p className="text-lg font-semibold">Evidence not found</p>
        <button onClick={() => navigate(ROUTES.EVIDENCE)} className="text-sm text-[hsl(var(--primary))] hover:underline">← Back</button>
      </div>
    </DashboardLayout>
  );

  const agCol = AGENCY_COLOR[evidence.currentCustody];

  return (
    <DashboardLayout>
      <div className="space-y-5">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <button onClick={() => navigate(ROUTES.EVIDENCE)} className="hover:text-foreground flex items-center gap-1">
            <ArrowLeft className="h-3.5 w-3.5" /> Evidence
          </button>
          <ChevronRight className="h-3 w-3" />
          <span className="font-mono font-semibold text-foreground">{evidence.evidenceId}</span>
        </div>

        {/* Header card */}
        <motion.div initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }}
          className="rounded-xl border border-border bg-card p-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-sm font-bold text-[hsl(var(--primary))]">{evidence.evidenceId}</span>
                <StatusBadge variant={EVIDENCE_STATUS_BADGE[evidence.status]} size="xs" dot>{EVIDENCE_STATUS_LABEL[evidence.status]}</StatusBadge>
                <StatusBadge variant={VERIFICATION_BADGE[evidence.verificationStatus]} size="xs">
                  {evidence.verificationStatus === "verified" ? "✓ Verified" : "Pending"}
                </StatusBadge>
              </div>
              <h1 className="text-xl font-bold text-foreground capitalize">{evidence.type.replace(/_/g," ")} Evidence</h1>
              <p className="text-xs text-muted-foreground">Case: <span className="font-mono text-[hsl(var(--primary))]">{evidence.caseNumber}</span> · Seal: <span className="font-mono text-foreground">{evidence.sealNumber}</span></p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <button onClick={() => navigate(ROUTES.EVIDENCE_TRANSFER.replace(":evidenceId", evidenceId!))}
                className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card hover:bg-muted px-3 py-2 text-xs font-medium transition-colors">
                <Share2 className="h-3.5 w-3.5" /> Transfer
              </button>
              <button className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card hover:bg-muted px-3 py-2 text-xs font-medium transition-colors">
                <Download className="h-3.5 w-3.5" /> Export
              </button>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="rounded-lg bg-muted/40 px-3 py-2.5">
              <p className="text-2xs text-muted-foreground mb-1">Current Custody</p>
              <span className={cn("rounded-full border px-2 py-0.5 text-xs font-semibold", agCol.bg, agCol.text, agCol.border)}>{AGENCY_LABEL[evidence.currentCustody]}</span>
            </div>
            <div className="rounded-lg bg-muted/40 px-3 py-2.5">
              <p className="text-2xs text-muted-foreground mb-1">Officer</p>
              <p className="text-sm font-medium text-foreground truncate">{evidence.currentOfficer}</p>
            </div>
            <div className="rounded-lg bg-muted/40 px-3 py-2.5">
              <p className="text-2xs text-muted-foreground mb-1">Collected</p>
              <p className="text-sm text-foreground">{formatDate(evidence.collectionDate)}</p>
            </div>
            <div className="rounded-lg bg-muted/40 px-3 py-2.5">
              <p className="text-2xs text-muted-foreground mb-1">Chain Events</p>
              <p className="text-2xl font-bold text-[hsl(var(--primary))]">{evidence.chain.length}</p>
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="flex items-center overflow-x-auto no-scrollbar border-b border-border">
          {TABS.map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={cn("whitespace-nowrap px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px",
                activeTab===tab?"border-[hsl(var(--primary))] text-[hsl(var(--primary))]":"border-transparent text-muted-foreground hover:text-foreground")}>
              {tab}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <motion.div key={activeTab} initial={{ opacity:0, y:6 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.2 }}>
          {activeTab==="Overview"         && <OverviewTab evidence={evidence} />}
          {activeTab==="Chain of Custody" && <ChainOfCustody events={evidence.chain} />}
          {activeTab==="Integrity"        && <IntegrityPanel evidence={evidence} onUpdated={setEvidence} />}
          {activeTab==="Sharing"          && <EvidenceSharing evidence={evidence} />}
          {activeTab==="History"          && <VersionHistory versions={evidence.versions} />}
          {activeTab==="Audit Log"        && <EvidenceAuditLog logs={evidence.auditLogs} />}
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
