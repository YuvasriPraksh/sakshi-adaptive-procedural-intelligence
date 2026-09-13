import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AnimatePresence, motion } from "framer-motion";
import { X, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { OFFICERS } from "@/data/officers.data";
import { CRIME_TYPES } from "@/utils/case.utils";
import { useState } from "react";

const schema = z.object({
  caseNumber:    z.string().min(3, "Required"),
  firNumber:     z.string().min(3, "Required"),
  crimeType:     z.string().min(1, "Select crime type"),
  victimCode:    z.string().min(3, "Required"),
  incidentDate:  z.string().min(1, "Required"),
  officerId:     z.string().min(1, "Assign an officer"),
  priority:      z.enum(["critical","high","medium","low"]),
  remarks:       z.string().optional(),
});
type FormData = z.infer<typeof schema>;

interface Props { open: boolean; onClose: () => void; }

export function CaseFormModal({ open, onClose }: Props) {
  const [submitted, setSubmitted] = useState(false);
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { priority: "medium" },
  });

  useEffect(() => { if (!open) { reset(); setSubmitted(false); } }, [open, reset]);

  const onSubmit = async (_data: FormData) => {
    await new Promise(r => setTimeout(r, 1000));
    setSubmitted(true);
    setTimeout(() => onClose(), 1500);
  };

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div className="absolute inset-0 bg-black/50 backdrop-blur-sm" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }} onClick={onClose} />
          <motion.div initial={{ opacity:0, scale:0.96, y:12 }} animate={{ opacity:1, scale:1, y:0 }} exit={{ opacity:0, scale:0.96, y:12 }} transition={{ duration:0.2 }}
            className="relative z-10 w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl bg-card border border-border shadow-2xl">
            <div className="flex items-center justify-between border-b border-border px-6 py-4">
              <div><h2 className="text-base font-semibold text-foreground">Register New Case</h2><p className="text-xs text-muted-foreground mt-0.5">All fields marked * are mandatory</p></div>
              <button onClick={onClose} className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"><X className="h-4 w-4" /></button>
            </div>

            {submitted ? (
              <div className="flex flex-col items-center justify-center py-16 gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-950/40">
                  <CheckCircle2 className="h-8 w-8 text-emerald-500" />
                </div>
                <p className="text-base font-semibold text-foreground">Case Registered Successfully</p>
                <p className="text-sm text-muted-foreground">The case has been added to the system.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col overflow-hidden">
                <div className="overflow-y-auto px-6 py-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="Case Number *" error={errors.caseNumber?.message}>
                    <input {...register("caseNumber")} placeholder="SAKSHI/2024/XXXXXX" className={inputCls(!!errors.caseNumber)} />
                  </Field>
                  <Field label="FIR Number *" error={errors.firNumber?.message}>
                    <input {...register("firNumber")} placeholder="FIR/XX/2024/XXXXX" className={inputCls(!!errors.firNumber)} />
                  </Field>
                  <Field label="Crime Type *" error={errors.crimeType?.message}>
                    <select {...register("crimeType")} className={inputCls(!!errors.crimeType)}>
                      <option value="">Select crime type</option>
                      {CRIME_TYPES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                    </select>
                  </Field>
                  <Field label="Victim Code *" error={errors.victimCode?.message}>
                    <input {...register("victimCode")} placeholder="VIC-XX-2024-XXXXX" className={inputCls(!!errors.victimCode)} />
                  </Field>
                  <Field label="Incident Date *" error={errors.incidentDate?.message}>
                    <input {...register("incidentDate")} type="date" className={inputCls(!!errors.incidentDate)} />
                  </Field>
                  <Field label="Assign Officer *" error={errors.officerId?.message}>
                    <select {...register("officerId")} className={inputCls(!!errors.officerId)}>
                      <option value="">Select officer</option>
                      {OFFICERS.map(o => <option key={o.id} value={o.id}>{o.name} — {o.station}</option>)}
                    </select>
                  </Field>
                  <Field label="Priority *" error={errors.priority?.message}>
                    <select {...register("priority")} className={inputCls(!!errors.priority)}>
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="critical">Critical</option>
                    </select>
                  </Field>
                  <Field label="Remarks" error={errors.remarks?.message} className="sm:col-span-2">
                    <textarea {...register("remarks")} rows={3} placeholder="Additional notes…" className={cn(inputCls(!!errors.remarks), "resize-none")} />
                  </Field>
                </div>
                <div className="flex items-center justify-end gap-3 border-t border-border px-6 py-4">
                  <button type="button" onClick={onClose} className="rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground hover:bg-muted transition-colors">Cancel</button>
                  <button type="submit" disabled={isSubmitting}
                    className="inline-flex items-center gap-2 rounded-lg bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))]/90 px-5 py-2 text-sm font-bold text-white transition-colors disabled:opacity-60">
                    {isSubmitting ? <><span className="h-3.5 w-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" /> Registering…</> : "Register Case"}
                  </button>
                </div>
              </form>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

function inputCls(err: boolean) {
  return cn("w-full h-9 rounded-lg border px-3 text-sm bg-background dark:bg-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))] transition-colors",
    err ? "border-red-400" : "border-border");
}
function Field({ label, error, children, className }: { label:string; error?:string; children:React.ReactNode; className?:string }) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label className="text-xs font-medium text-foreground">{label}</label>
      {children}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
