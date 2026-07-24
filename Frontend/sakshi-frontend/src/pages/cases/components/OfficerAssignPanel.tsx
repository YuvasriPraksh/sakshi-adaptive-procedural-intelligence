import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, Search, CheckCircle2, Activity } from "lucide-react";
import { cn } from "@/lib/utils";
import { OFFICERS } from "@/data/officers.data";
import { Avatar } from "@/components/ui/feedback/Avatar";
import type { Officer } from "@/types/case.types";

interface Props {
  open:             boolean;
  onClose:          () => void;
  currentOfficerId: string;
  onAssign:         (officer: Officer) => void;
}

const DEPT_COLORS: Record<string, string> = {
  police:   "bg-royal-100 text-royal-700 dark:bg-royal-950/40 dark:text-royal-300",
  hospital: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300",
  fsl:      "bg-purple-100 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300",
  cwc:      "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300",
  supervisor:"bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
};

export function OfficerAssignPanel({ open, onClose, currentOfficerId, onAssign }: Props) {
  const [search,   setSearch]   = useState("");
  const [selected, setSelected] = useState(currentOfficerId);
  const [dept,     setDept]     = useState<string>("");

  const filtered = OFFICERS.filter(o => {
    if (dept && o.department !== dept) return false;
    if (search && !o.name.toLowerCase().includes(search.toLowerCase()) && !o.station.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div className="absolute inset-0 bg-black/40 backdrop-blur-sm" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }} onClick={onClose} />
          <motion.div initial={{ opacity:0, scale:0.96, y:12 }} animate={{ opacity:1, scale:1, y:0 }} exit={{ opacity:0, scale:0.96, y:12 }} transition={{ duration:0.2 }}
            className="relative z-10 w-full max-w-lg max-h-[90vh] flex flex-col rounded-2xl bg-card border border-border shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <div><h2 className="text-base font-semibold text-foreground">Assign Officer</h2><p className="text-xs text-muted-foreground mt-0.5">Select an officer to assign this case</p></div>
              <button onClick={onClose} className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"><X className="h-4 w-4" /></button>
            </div>

            {/* Filters */}
            <div className="px-5 py-3 border-b border-border space-y-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search officer or station…"
                  className="w-full h-9 rounded-lg border border-border bg-background pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))] dark:bg-slate-900 dark:text-white" />
              </div>
              <div className="flex flex-wrap gap-1.5">
                {["","police","hospital","fsl","cwc","supervisor"].map(d => (
                  <button key={d} onClick={() => setDept(d)}
                    className={cn("rounded-full px-3 py-0.5 text-xs font-medium transition-colors capitalize",
                      dept === d ? "bg-[hsl(var(--primary))] text-white" : "bg-muted text-muted-foreground hover:bg-muted/80")}>
                    {d || "All"}
                  </button>
                ))}
              </div>
            </div>

            {/* Officer list */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {filtered.map(officer => (
                <motion.button key={officer.id} onClick={() => setSelected(officer.id)} layout
                  className={cn("w-full flex items-center gap-3 rounded-xl border p-3.5 text-left transition-all",
                    selected === officer.id ? "border-[hsl(var(--primary))] bg-[hsl(var(--primary))]/5" : "border-border hover:border-[hsl(var(--primary))]/30 hover:bg-muted/40")}>
                  <Avatar name={officer.name} size="md" online={officer.activeCases < 8} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-semibold text-foreground">{officer.name}</p>
                      <span className={cn("rounded-full px-2 py-0.5 text-2xs font-medium capitalize", DEPT_COLORS[officer.department])}>{officer.department}</span>
                      {currentOfficerId === officer.id && <span className="text-2xs text-muted-foreground">(current)</span>}
                    </div>
                    <p className="text-xs text-muted-foreground">{officer.designation} · {officer.station}</p>
                    <div className="flex items-center gap-1 mt-1 text-2xs text-muted-foreground">
                      <Activity className="h-3 w-3" />
                      <span>{officer.activeCases} active cases</span>
                      {officer.activeCases >= 10 && <span className="text-amber-600 font-medium">(High load)</span>}
                    </div>
                  </div>
                  {selected === officer.id && <CheckCircle2 className="h-5 w-5 text-[hsl(var(--primary))] shrink-0" />}
                </motion.button>
              ))}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 border-t border-border px-5 py-4">
              <button onClick={onClose} className="rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium hover:bg-muted transition-colors">Cancel</button>
              <button disabled={selected === currentOfficerId}
                onClick={() => { const o = OFFICERS.find(x => x.id === selected); if (o) onAssign(o); }}
                className="rounded-lg bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))]/90 px-5 py-2 text-sm font-bold text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
                Assign Officer
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
