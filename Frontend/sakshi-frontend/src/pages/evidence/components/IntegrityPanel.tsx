import { useState } from "react";
import { motion } from "framer-motion";
import { ShieldCheck, ShieldAlert, RefreshCw, CheckCircle2, AlertTriangle, Fingerprint } from "lucide-react";
import { StatusBadge } from "@/components/ui/feedback/StatusBadge";
import { cn } from "@/lib/utils";
import { evidenceService } from "@/services/evidenceService";
import { formatDateTime } from "@/utils/format";
import type { EvidenceItem } from "@/types/evidence.types";

interface Props {
  evidence:   EvidenceItem;
  onUpdated:  (e: EvidenceItem) => void;
}

export function IntegrityPanel({ evidence, onUpdated }: Props) {
  const [verifying,  setVerifying]  = useState(false);
  const [result, setResult] = useState<{ status: "verified"|"failed"; hashMatch: boolean; details: string } | null>(null);

  const verify = async () => {
    setVerifying(true);
    setResult(null);
    try {
      const res = await evidenceService.verifyIntegrity(evidence.id);
      setResult(res.data);
      onUpdated({ ...evidence, verificationStatus: res.data.status, lastVerified: new Date().toISOString() });
    } finally {
      setVerifying(false);
    }
  };

  const match = evidence.initialHash === evidence.currentHash;

  return (
    <div className="space-y-4">
      {/* Current status */}
      <div className={cn(
        "rounded-xl border p-6 text-center space-y-4",
        match ? "border-emerald-200 bg-emerald-50 dark:bg-emerald-950/20 dark:border-emerald-900/60"
              : "border-red-200 bg-red-50 dark:bg-red-950/20 dark:border-red-900/60",
      )}>
        {match
          ? <ShieldCheck className="h-14 w-14 text-emerald-500 mx-auto" strokeWidth={1.5} />
          : <ShieldAlert className="h-14 w-14 text-red-500 mx-auto" strokeWidth={1.5} />}
        <div>
          <p className={cn("text-xl font-extrabold", match ? "text-emerald-700 dark:text-emerald-400" : "text-red-700 dark:text-red-400")}>
            {match ? "Evidence Integrity Confirmed" : "INTEGRITY FAILURE DETECTED"}
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            {match ? "SHA-256 hash values match. Evidence has not been tampered with."
                   : "SHA-256 hashes do not match. This evidence may have been tampered with."}
          </p>
        </div>
        <button onClick={verify} disabled={verifying}
          className={cn(
            "inline-flex items-center gap-2 rounded-xl px-8 py-3 text-sm font-bold text-white transition-all shadow-md disabled:opacity-60",
            match ? "bg-emerald-600 hover:bg-emerald-700" : "bg-red-600 hover:bg-red-700",
          )}>
          {verifying
            ? <><span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" /> Verifying…</>
            : <><RefreshCw className="h-4 w-4" /> Verify Integrity Now</>}
        </button>
      </div>

      {/* Verification result */}
      {result && (
        <motion.div initial={{ opacity:0, scale:0.97 }} animate={{ opacity:1, scale:1 }}
          className={cn("rounded-xl border p-4 flex items-start gap-3",
            result.hashMatch ? "border-emerald-200 bg-emerald-50 dark:bg-emerald-950/20" : "border-red-200 bg-red-50 dark:bg-red-950/20")}>
          {result.hashMatch
            ? <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
            : <AlertTriangle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />}
          <div>
            <p className="text-sm font-semibold text-foreground">Verification Complete</p>
            <p className="text-xs text-muted-foreground mt-0.5">{result.details}</p>
          </div>
        </motion.div>
      )}

      {/* Hash details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          { label:"Original SHA-256 Hash", hash:evidence.initialHash, sublabel:"Recorded at registration" },
          { label:"Current SHA-256 Hash",  hash:evidence.currentHash,  sublabel:"Latest computed value" },
        ].map(h => (
          <div key={h.label} className="rounded-xl border border-border bg-card p-4 space-y-2">
            <div className="flex items-center gap-2">
              <Fingerprint className="h-4 w-4 text-muted-foreground" />
              <p className="text-xs font-semibold text-foreground">{h.label}</p>
            </div>
            <p className="text-2xs text-muted-foreground">{h.sublabel}</p>
            <p className="font-mono text-2xs text-foreground bg-muted/60 rounded-lg px-3 py-2.5 break-all leading-relaxed">
              {h.hash}
            </p>
          </div>
        ))}
      </div>

      {/* Hash comparison */}
      <div className="rounded-xl border border-border bg-card p-4">
        <p className="text-xs font-semibold text-foreground mb-3">Hash Comparison Analysis</p>
        <div className="space-y-2">
          {[
            { label:"Algorithm",        value:"SHA-256 (256-bit)"         },
            { label:"Encoding",         value:"Hexadecimal"                },
            { label:"Match Result",     value:match ? "✅ MATCH" : "❌ MISMATCH" },
            { label:"Last Verified",    value:evidence.lastVerified ? formatDateTime(evidence.lastVerified) : "Never" },
            { label:"Verification Status", value:<StatusBadge variant={match?"success":"danger"} size="xs">{evidence.verificationStatus}</StatusBadge> },
          ].map(row => (
            <div key={row.label} className="flex items-center justify-between text-xs border-b border-border last:border-0 py-2">
              <span className="text-muted-foreground">{row.label}</span>
              <span className="font-medium text-foreground">{row.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Integrity history */}
      <div className="rounded-xl border border-border bg-card p-4">
        <p className="text-xs font-semibold text-foreground mb-3">Integrity Check History</p>
        <div className="space-y-2">
          {evidence.chain.filter(e => e.action === "hash_verified" || e.action === "registered").map((e,i) => (
            <div key={i} className="flex items-center gap-3 text-xs">
              <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
              <div className="flex-1">
                <span className="font-medium text-foreground">{e.officer}</span>
                <span className="text-muted-foreground"> · {e.agency.toUpperCase()} · {formatDateTime(e.timestamp)}</span>
              </div>
              <StatusBadge variant="success" size="xs">Passed</StatusBadge>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
