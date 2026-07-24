import { useState } from "react";
import { motion } from "framer-motion";
import { Share2, Plus, CheckCircle2, XCircle, Eye, Download, Lock } from "lucide-react";
import { StatusBadge } from "@/components/ui/feedback/StatusBadge";
import { cn } from "@/lib/utils";
import { AGENCY_LABEL, AGENCY_COLOR } from "@/utils/evidence.utils";
import { formatDateTime } from "@/utils/format";
import type { EvidenceItem, AgencyType, AccessLevel } from "@/types/evidence.types";
import { useNotifications } from "@/context/NotificationContext";

const AGENCIES: AgencyType[] = ["police","hospital","fsl","cwc","court"];
const ACCESS_LEVELS: AccessLevel[] = ["read","download","full","restricted"];

const ACCESS_ICONS: Record<AccessLevel, React.ElementType> = {
  read: Eye, download: Download, full: CheckCircle2, restricted: Lock,
};

export function EvidenceSharing({ evidence }: { evidence: EvidenceItem }) {
  const { toast } = useNotifications();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ agency:"police" as AgencyType, officer:"", purpose:"", accessLevel:"read" as AccessLevel });

  const handleShare = () => {
    if (!form.officer.trim()) { toast({ title:"Officer name required", variant:"warning" }); return; }
    toast({ title:"Sharing request sent", message:`Evidence access granted to ${AGENCY_LABEL[form.agency]}`, variant:"success" });
    setShowForm(false);
    setForm({ agency:"police", officer:"", purpose:"", accessLevel:"read" });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-foreground">Secure Sharing</p>
        <button onClick={() => setShowForm(v=>!v)}
          className="inline-flex items-center gap-1.5 rounded-lg bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))]/90 px-3 py-2 text-xs font-bold text-white transition-colors">
          <Plus className="h-3.5 w-3.5" /> Share Evidence
        </button>
      </div>

      {showForm && (
        <motion.div initial={{ opacity:0, y:-8 }} animate={{ opacity:1, y:0 }}
          className="rounded-xl border border-[hsl(var(--primary))]/30 bg-[hsl(var(--primary))]/5 p-5 space-y-4">
          <p className="text-sm font-semibold text-foreground">New Share Request</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { label:"Receiving Agency", el:
                <select value={form.agency} onChange={e=>setForm(f=>({...f, agency:e.target.value as AgencyType}))}
                  className="h-9 w-full rounded-lg border border-border bg-background px-3 text-xs focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))] dark:bg-slate-900 dark:text-white appearance-none">
                  {AGENCIES.map(a => <option key={a} value={a}>{AGENCY_LABEL[a]}</option>)}
                </select>
              },
              { label:"Receiving Officer", el:
                <input value={form.officer} onChange={e=>setForm(f=>({...f, officer:e.target.value}))} placeholder="Officer name"
                  className="h-9 w-full rounded-lg border border-border bg-background px-3 text-xs focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))] dark:bg-slate-900 dark:text-white" />
              },
              { label:"Access Level", el:
                <select value={form.accessLevel} onChange={e=>setForm(f=>({...f, accessLevel:e.target.value as AccessLevel}))}
                  className="h-9 w-full rounded-lg border border-border bg-background px-3 text-xs focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))] dark:bg-slate-900 dark:text-white appearance-none">
                  {ACCESS_LEVELS.map(a => <option key={a} value={a}>{a.charAt(0).toUpperCase()+a.slice(1)}</option>)}
                </select>
              },
              { label:"Purpose", el:
                <input value={form.purpose} onChange={e=>setForm(f=>({...f, purpose:e.target.value}))} placeholder="Purpose of sharing"
                  className="h-9 w-full rounded-lg border border-border bg-background px-3 text-xs focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))] dark:bg-slate-900 dark:text-white" />
              },
            ].map(f => (
              <div key={f.label} className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-foreground">{f.label}</label>
                {f.el}
              </div>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handleShare} className="rounded-lg bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))]/90 px-4 py-2 text-xs font-bold text-white transition-colors">Share Evidence</button>
            <button onClick={() => setShowForm(false)} className="rounded-lg border border-border px-4 py-2 text-xs font-medium hover:bg-muted transition-colors">Cancel</button>
          </div>
        </motion.div>
      )}

      <div className="space-y-2">
        {evidence.shares.length === 0 ? (
          <div className="rounded-xl border border-border bg-card py-10 text-center">
            <Share2 className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No sharing records yet.</p>
          </div>
        ) : evidence.shares.map((s, i) => {
          const from = AGENCY_COLOR[s.sharedByAgency];
          const to   = AGENCY_COLOR[s.sharedWithAgency];
          const Icon = ACCESS_ICONS[s.accessLevel];
          return (
            <motion.div key={s.id} initial={{ opacity:0, y:6 }} animate={{ opacity:1, y:0 }} transition={{ delay:i*0.06 }}
              className="rounded-xl border border-border bg-card p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={cn("rounded-full border px-2 py-0.5 text-2xs font-semibold", from.bg, from.text, from.border)}>{AGENCY_LABEL[s.sharedByAgency]}</span>
                  <span className="text-muted-foreground text-xs">→</span>
                  <span className={cn("rounded-full border px-2 py-0.5 text-2xs font-semibold", to.bg, to.text, to.border)}>{AGENCY_LABEL[s.sharedWithAgency]}</span>
                  <span className="flex items-center gap-1 text-2xs text-muted-foreground">
                    <Icon className="h-3 w-3" /> {s.accessLevel}
                  </span>
                  {s.isActive
                    ? <StatusBadge variant="success" size="xs" dot>Active</StatusBadge>
                    : <StatusBadge variant="muted" size="xs">Expired</StatusBadge>}
                </div>
                <p className="text-2xs text-muted-foreground">{formatDateTime(s.sharedAt)}</p>
              </div>
              <div className="mt-2 text-xs text-muted-foreground">
                <span className="font-medium text-foreground">{s.sharedBy}</span> → <span className="font-medium text-foreground">{s.sharedWith}</span>
                {s.purpose && <span className="ml-2 text-muted-foreground">· {s.purpose}</span>}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
