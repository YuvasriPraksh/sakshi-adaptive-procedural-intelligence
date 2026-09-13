import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { ShieldCheck, CheckCircle2, Hash } from "lucide-react";
import { DashboardLayout }  from "@/components/layout/DashboardLayout";
import { cn }                from "@/lib/utils";
import { ROUTES }            from "@/router/routes";
import { evidenceService }   from "@/services/evidenceService";
import { EVIDENCE_TYPE_LABEL } from "@/utils/evidence.utils";
import { generateMockHash }  from "@/utils/evidence.utils";
import { CASES }             from "@/data/cases.data";
import { OFFICERS }          from "@/data/officers.data";
import { useNotifications }  from "@/context/NotificationContext";
import type { EvidenceType, AgencyType } from "@/types/evidence.types";

const schema = z.object({
  caseId:          z.string().min(1,"Case is required"),
  type:            z.string().min(1,"Type is required"),
  description:     z.string().min(10,"Description must be at least 10 characters"),
  collectedBy:     z.string().min(1,"Officer name required"),
  agency:          z.string().min(1,"Agency required"),
  collectionDate:  z.string().min(1,"Date required"),
  collectionTime:  z.string().min(1,"Time required"),
  gpsLocation:     z.string().min(3,"Location required"),
  photographs:     z.string().optional(),
  weight:          z.string().optional(),
  dimensions:      z.string().optional(),
  notes:           z.string().optional(),
});
type FormData = z.infer<typeof schema>;

const AGENCIES: { value: AgencyType; label: string }[] = [
  { value:"police",  label:"Police"   },
  { value:"hospital",label:"Hospital" },
  { value:"fsl",     label:"FSL"      },
  { value:"cwc",     label:"CWC"      },
];

function Field({ label, error, children, required, className }: { label:string; error?:string; children:React.ReactNode; required?:boolean; className?:string }) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label className="text-xs font-medium text-foreground">{label}{required && <span className="text-red-500 ml-0.5">*</span>}</label>
      {children}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
const cls = (err?:boolean) => cn("w-full h-9 rounded-lg border px-3 text-sm bg-background dark:bg-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))] transition-colors", err?"border-red-400":"border-border");

export default function EvidenceRegisterPage() {
  const navigate = useNavigate();
  const { toast } = useNotifications();
  const [success, setSuccess] = useState(false);
  const [generatedEvidenceId] = useState(() => `EVD-${new Date().getFullYear()}-${Math.floor(Math.random()*900000)+100000}`);
  const [generatedEvidenceToken] = useState(() => `TKN-${Math.random().toString(36).slice(2,8).toUpperCase()}-${Math.floor(Math.random()*9000)+1000}`);
  const [generatedHash] = useState(() => generateMockHash());
  const [generatedTimestamp] = useState(() => new Date().toISOString());
  const { register, handleSubmit, formState:{ errors, isSubmitting } } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    const selectedCase = CASES.find(c => c.id === data.caseId);
    const newItem = await evidenceService.create({
      ...data,
      type: data.type as EvidenceType,
      agency: data.agency as AgencyType,
      caseNumber: selectedCase?.caseNumber ?? "",
      evidenceId: generatedEvidenceId,
      evidenceToken: generatedEvidenceToken,
      initialHash: generatedHash,
      currentHash: generatedHash,
      status: "registered",
      currentCustody: data.agency as AgencyType,
      currentOfficer: data.collectedBy,
      sealNumber: `SL-${data.agency.toUpperCase().slice(0,2)}-${Date.now()}`,
      photographs: Number(data.photographs || 0),
      weight: data.weight,
      dimensions: data.dimensions,
      verificationStatus: "pending",
      createdAt: generatedTimestamp,
      updatedAt: generatedTimestamp,
      notes: data.notes ?? "",
    });
    setSuccess(true);
    toast({ title:"Evidence registered", message:`Evidence ${newItem.data.evidenceId} created with secure token.`, variant:"success" });
    setTimeout(() => navigate(ROUTES.EVIDENCE), 2000);
  };

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto space-y-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[hsl(var(--primary))]/10 text-[hsl(var(--primary))]">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Register Evidence</h1>
            <p className="text-sm text-muted-foreground">Create a new evidence record with SHA-256 hash</p>
          </div>
        </div>

        {success ? (
          <motion.div initial={{ opacity:0, scale:0.96 }} animate={{ opacity:1, scale:1 }}
            className="rounded-2xl border border-emerald-200 bg-emerald-50 dark:bg-emerald-950/20 p-8 text-center space-y-4">
            <CheckCircle2 className="h-16 w-16 text-emerald-500 mx-auto" />
            <p className="text-lg font-bold text-foreground">Evidence Registered</p>
            <div className="rounded-lg bg-white dark:bg-black/20 p-4 text-left">
              <p className="text-xs font-semibold text-muted-foreground mb-1">Generated SHA-256 Hash</p>
              <p className="font-mono text-xs text-foreground break-all">{generatedHash}</p>
            </div>
            <p className="text-sm text-muted-foreground">Redirecting to Evidence Dashboard…</p>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="border-b border-border px-6 py-4 bg-muted/30">
              <p className="text-sm font-semibold text-foreground">Evidence Details</p>
              <p className="text-xs text-muted-foreground">All fields marked * are mandatory under POCSO evidence protocol</p>
            </div>
            <div className="px-6 py-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Case" required error={errors.caseId?.message}>
                <select {...register("caseId")} className={cls(!!errors.caseId)}>
                  <option value="">Select case</option>
                  {CASES.map(c => <option key={c.id} value={c.id}>{c.caseNumber.split("/").pop()} — {c.district}</option>)}
                </select>
              </Field>
              <Field label="Evidence Type" required error={errors.type?.message}>
                <select {...register("type")} className={cls(!!errors.type)}>
                  <option value="">Select type</option>
                  {Object.entries(EVIDENCE_TYPE_LABEL).map(([v,l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              </Field>
              <Field label="Collected By" required error={errors.collectedBy?.message}>
                <select {...register("collectedBy")} className={cls(!!errors.collectedBy)}>
                  <option value="">Select officer</option>
                  {OFFICERS.map(o => <option key={o.id} value={o.name}>{o.name} — {o.station}</option>)}
                </select>
              </Field>
              <Field label="Agency" required error={errors.agency?.message}>
                <select {...register("agency")} className={cls(!!errors.agency)}>
                  <option value="">Select agency</option>
                  {AGENCIES.map(a => <option key={a.value} value={a.value}>{a.label}</option>)}
                </select>
              </Field>
              <Field label="Collection Date" required error={errors.collectionDate?.message}>
                <input {...register("collectionDate")} type="date" className={cls(!!errors.collectionDate)} />
              </Field>
              <Field label="Collection Time" required error={errors.collectionTime?.message}>
                <input {...register("collectionTime")} type="time" className={cls(!!errors.collectionTime)} />
              </Field>
              <Field label="GPS Location" required error={errors.gpsLocation?.message}>
                <input {...register("gpsLocation")} placeholder="e.g. Lajpat Nagar, South Delhi" className={cls(!!errors.gpsLocation)} />
              </Field>
              <Field label="Description" required error={errors.description?.message} className="sm:col-span-2">
                <textarea {...register("description")} rows={3} placeholder="Detailed description of the evidence…"
                  className={cn(cls(!!errors.description), "h-auto resize-none py-2")} />
              </Field>
              <Field label="Additional Notes" className="sm:col-span-2">
                <textarea {...register("notes")} rows={2} placeholder="Any additional notes or instructions…"
                  className={cn(cls(), "h-auto resize-none py-2")} />
              </Field>

              {/* Hash preview */}
              <div className="sm:col-span-2 rounded-xl border border-[hsl(var(--primary))]/20 bg-[hsl(var(--primary))]/5 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Hash className="h-4 w-4 text-[hsl(var(--primary))]" />
                  <p className="text-xs font-semibold text-foreground">SHA-256 Hash Generation</p>
                </div>
                <p className="text-xs text-muted-foreground">A unique SHA-256 hash will be automatically generated and recorded when this evidence is registered. This hash ensures tamper-evident chain of custody.</p>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 border-t border-border px-6 py-4">
              <button type="button" onClick={() => navigate(ROUTES.EVIDENCE)}
                className="rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-muted transition-colors">Cancel</button>
              <button type="submit" disabled={isSubmitting}
                className="inline-flex items-center gap-2 rounded-lg bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))]/90 px-5 py-2 text-sm font-bold text-white transition-colors disabled:opacity-60">
                {isSubmitting
                  ? <><span className="h-3.5 w-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" /> Registering…</>
                  : <><ShieldCheck className="h-4 w-4" /> Register &amp; Generate Hash</>}
              </button>
            </div>
          </form>
        )}
      </div>
    </DashboardLayout>
  );
}
