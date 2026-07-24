import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, ShieldCheck, CheckCircle2 } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/router/routes";
import { AGENCY_LABEL, AGENCY_COLOR } from "@/utils/evidence.utils";
import { EVIDENCE_ITEMS } from "@/data/evidence.items";
import { OFFICERS } from "@/data/officers.data";
import { useNotifications } from "@/context/NotificationContext";
import type { AgencyType } from "@/types/evidence.types";

const AGENCIES: AgencyType[] = ["police","hospital","fsl","cwc","court"];
const cls = (err?:boolean) => cn("w-full h-9 rounded-lg border px-3 text-sm bg-background dark:bg-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))] transition-colors appearance-none", err?"border-red-400":"border-border");

export default function EvidenceTransferPage() {
  const { evidenceId } = useParams<{ evidenceId: string }>();
  const navigate = useNavigate();
  const { toast } = useNotifications();
  const evidence = EVIDENCE_ITEMS.find(e => e.id === evidenceId) ?? EVIDENCE_ITEMS[0];
  const [form, setForm] = useState({ toAgency:"hospital" as AgencyType, officer:"", purpose:"", notes:"" });
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async () => {
    if (!form.officer.trim() || !form.purpose.trim()) {
      toast({ title:"Missing fields", message:"Officer and purpose are required.", variant:"warning" }); return;
    }
    setSubmitting(true);
    await new Promise(r => setTimeout(r, 1200));
    setDone(true);
    toast({ title:"Transfer initiated", message:`Evidence ${evidence.evidenceId} transfer to ${AGENCY_LABEL[form.toAgency]} initiated.`, variant:"success" });
    setTimeout(() => navigate(ROUTES.EVIDENCE_DETAIL.replace(":evidenceId", evidence.id)), 2000);
  };

  const fromCol = AGENCY_COLOR[evidence.currentCustody];
  const toCol   = AGENCY_COLOR[form.toAgency];

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto space-y-5">
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2.5">
          <ArrowRight className="h-5 w-5 text-[hsl(var(--primary))]" /> Transfer Evidence
        </h1>

        {done ? (
          <motion.div initial={{ opacity:0, scale:0.96 }} animate={{ opacity:1, scale:1 }}
            className="rounded-2xl border border-emerald-200 bg-emerald-50 dark:bg-emerald-950/20 p-8 text-center space-y-3">
            <CheckCircle2 className="h-14 w-14 text-emerald-500 mx-auto" />
            <p className="text-lg font-bold text-foreground">Transfer Initiated</p>
            <p className="text-sm text-muted-foreground">Evidence {evidence.evidenceId} is being transferred to {AGENCY_LABEL[form.toAgency]}. Chain of custody updated.</p>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {/* Evidence card */}
            <div className="rounded-xl border border-border bg-card p-4 flex items-center gap-4">
              <ShieldCheck className="h-8 w-8 text-[hsl(var(--primary))] shrink-0" />
              <div>
                <p className="text-sm font-bold text-foreground">{evidence.evidenceId}</p>
                <p className="text-xs text-muted-foreground">{evidence.description.slice(0,80)}…</p>
              </div>
            </div>

            {/* Transfer visual */}
            <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-4">
              <div className="flex-1 text-center">
                <p className="text-2xs text-muted-foreground mb-1">From</p>
                <span className={cn("rounded-full border px-3 py-1 text-sm font-bold", fromCol.bg, fromCol.text, fromCol.border)}>
                  {AGENCY_LABEL[evidence.currentCustody]}
                </span>
              </div>
              <ArrowRight className="h-5 w-5 text-muted-foreground shrink-0" />
              <div className="flex-1 text-center">
                <p className="text-2xs text-muted-foreground mb-1">To</p>
                <span className={cn("rounded-full border px-3 py-1 text-sm font-bold", toCol.bg, toCol.text, toCol.border)}>
                  {AGENCY_LABEL[form.toAgency]}
                </span>
              </div>
            </div>

            {/* Form */}
            <div className="rounded-xl border border-border bg-card p-5 space-y-4">
              <p className="text-sm font-semibold text-foreground">Transfer Details</p>
              {[
                { label:"Receiving Agency", el:<select value={form.toAgency} onChange={e=>setForm(f=>({...f,toAgency:e.target.value as AgencyType}))} className={cls()}>
                  {AGENCIES.filter(a=>a!==evidence.currentCustody).map(a=><option key={a} value={a}>{AGENCY_LABEL[a]}</option>)}</select> },
                { label:"Receiving Officer", el:<select value={form.officer} onChange={e=>setForm(f=>({...f,officer:e.target.value}))} className={cls()}>
                  <option value="">Select officer</option>
                  {OFFICERS.map(o=><option key={o.id} value={o.name}>{o.name} — {o.station}</option>)}</select> },
                { label:"Purpose of Transfer", el:<input value={form.purpose} onChange={e=>setForm(f=>({...f,purpose:e.target.value}))} placeholder="e.g. Forensic DNA analysis" className={cls()} /> },
                { label:"Notes (optional)", el:<textarea value={form.notes} onChange={e=>setForm(f=>({...f,notes:e.target.value}))} rows={2} placeholder="Additional instructions…" className={cn(cls(),"h-auto resize-none py-2")} /> },
              ].map(f=>(
                <div key={f.label} className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-foreground">{f.label}</label>
                  {f.el}
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <button onClick={() => navigate(-1)} className="rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-muted transition-colors">Cancel</button>
              <button onClick={handleSubmit} disabled={submitting}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))]/90 px-5 py-2 text-sm font-bold text-white transition-colors disabled:opacity-60">
                {submitting ? <><span className="h-3.5 w-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />Transferring…</> : <><ArrowRight className="h-4 w-4" />Initiate Secure Transfer</>}
              </button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
