import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, Filter, RefreshCw, Plus, LayoutGrid, List,
  ChevronDown, X, Eye, Clock, AlertTriangle,
} from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatusBadge } from "@/components/ui/feedback/StatusBadge";
import { Avatar } from "@/components/ui/feedback/Avatar";
import { Pagination } from "@/components/ui/feedback/Pagination";
import { cn } from "@/lib/utils";
import { CASES } from "@/data/cases.data";
import { ROUTES } from "@/router/routes";
import { STATUS_LABEL, STATUS_BADGE, PRIORITY_LABEL, PRIORITY_BADGE, CRIME_LABEL } from "@/utils/case.utils";
import { formatRelativeTime } from "@/utils/format";
import type { CaseStatus, CasePriority, InvestigationCase } from "@/types/case.types";
import { CaseFormModal } from "./components/CaseFormModal";

const PAGE_SIZE = 8;

const ALL_STATUSES: CaseStatus[] = ["registered","in_progress","under_review","completed","escalated","closed"];
const ALL_PRIORITIES: CasePriority[] = ["critical","high","medium","low"];

export default function CasesPage() {
  const navigate = useNavigate();
  const [search, setSearch]           = useState("");
  const [statusFilter, setStatusFilter]     = useState<CaseStatus | "">("");
  const [priorityFilter, setPriorityFilter] = useState<CasePriority | "">("");
  const [officerFilter, setOfficerFilter]   = useState("");
  const [view, setView]               = useState<"table"|"grid">("table");
  const [page, setPage]               = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [showNewCase, setShowNewCase] = useState(false);

  const officerOptions = useMemo(() => [...new Set(CASES.map(c => c.assignedOfficer))].sort(), []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return CASES.filter(c => {
      if (q && !c.caseNumber.toLowerCase().includes(q) && !c.victimCode.toLowerCase().includes(q) &&
          !c.assignedOfficer.toLowerCase().includes(q) && !c.district.toLowerCase().includes(q)) return false;
      if (statusFilter   && c.status   !== statusFilter)   return false;
      if (priorityFilter && c.priority !== priorityFilter) return false;
      if (officerFilter  && c.assignedOfficer !== officerFilter) return false;
      return true;
    });
  }, [search, statusFilter, priorityFilter, officerFilter]);

  const paginated = filtered.slice((page-1)*PAGE_SIZE, page*PAGE_SIZE);
  const activeFilters = [statusFilter, priorityFilter, officerFilter].filter(Boolean).length;

  const clearFilters = () => { setStatusFilter(""); setPriorityFilter(""); setOfficerFilter(""); setSearch(""); };

  return (
    <DashboardLayout>
      <div className="space-y-5">
        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Case Management</h1>
            <p className="text-sm text-muted-foreground mt-0.5">{filtered.length} cases found</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => {}} className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-xs font-medium text-muted-foreground hover:bg-muted transition-colors">
              <RefreshCw className="h-3.5 w-3.5" /> Refresh
            </button>
            <button onClick={() => setShowNewCase(true)} className="inline-flex items-center gap-2 rounded-lg bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))]/90 px-4 py-2 text-xs font-bold text-white transition-colors shadow-sm">
              <Plus className="h-3.5 w-3.5" /> New Case
            </button>
          </div>
        </div>

        {/* Search + filter bar */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search by case #, victim code, officer, district…"
              className="w-full h-9 rounded-lg border border-border bg-card pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))] dark:bg-slate-900 dark:text-white" />
          </div>
          <button onClick={() => setShowFilters(v => !v)}
            className={cn("inline-flex items-center gap-2 rounded-lg border px-3 h-9 text-xs font-medium transition-colors",
              showFilters || activeFilters > 0 ? "border-[hsl(var(--primary))] bg-[hsl(var(--primary))]/10 text-[hsl(var(--primary))]" : "border-border bg-card text-muted-foreground hover:bg-muted")}>
            <Filter className="h-3.5 w-3.5" /> Filters {activeFilters > 0 && <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[hsl(var(--primary))] text-white text-2xs">{activeFilters}</span>}
            <ChevronDown className={cn("h-3 w-3 transition-transform", showFilters && "rotate-180")} />
          </button>
          <div className="flex items-center rounded-lg border border-border overflow-hidden">
            <button onClick={() => setView("table")} className={cn("flex items-center px-3 h-9 transition-colors", view==="table" ? "bg-[hsl(var(--primary))] text-white" : "bg-card text-muted-foreground hover:bg-muted")}>
              <List className="h-4 w-4" />
            </button>
            <button onClick={() => setView("grid")} className={cn("flex items-center px-3 h-9 transition-colors", view==="grid" ? "bg-[hsl(var(--primary))] text-white" : "bg-card text-muted-foreground hover:bg-muted")}>
              <LayoutGrid className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Filter panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div initial={{ height:0, opacity:0 }} animate={{ height:"auto", opacity:1 }} exit={{ height:0, opacity:0 }} transition={{ duration:0.2 }} className="overflow-hidden">
              <div className="flex flex-wrap gap-3 rounded-xl border border-border bg-card p-4">
                <FilterSelect label="Status" value={statusFilter} onChange={v => { setStatusFilter(v as CaseStatus | ""); setPage(1); }}
                  options={ALL_STATUSES.map(s => ({ value:s, label: STATUS_LABEL[s] }))} />
                <FilterSelect label="Priority" value={priorityFilter} onChange={v => { setPriorityFilter(v as CasePriority | ""); setPage(1); }}
                  options={ALL_PRIORITIES.map(p => ({ value:p, label: PRIORITY_LABEL[p] }))} />
                <FilterSelect label="Officer" value={officerFilter} onChange={v => { setOfficerFilter(v); setPage(1); }}
                  options={officerOptions.map(o => ({ value:o, label:o }))} />
                {activeFilters > 0 && (
                  <button onClick={clearFilters} className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-100 transition-colors">
                    <X className="h-3 w-3" /> Clear All
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Content */}
        {view === "table" ? (
          <CaseTable cases={paginated} onOpen={id => navigate(ROUTES.CASE_DETAIL.replace(":caseId", id))} />
        ) : (
          <CaseGrid cases={paginated} onOpen={id => navigate(ROUTES.CASE_DETAIL.replace(":caseId", id))} />
        )}

        {/* Pagination */}
        {filtered.length > PAGE_SIZE && (
          <Pagination page={page} totalPages={Math.ceil(filtered.length/PAGE_SIZE)} onPageChange={setPage}
            total={filtered.length} pageSize={PAGE_SIZE} showInfo />
        )}
      </div>

      <CaseFormModal open={showNewCase} onClose={() => setShowNewCase(false)} />
    </DashboardLayout>
  );
}

// ─── Filter Select ────────────────────────────────────────────────────────────
function FilterSelect({ label, value, onChange, options }: { label:string; value:string; onChange:(v:string)=>void; options:{value:string;label:string}[] }) {
  return (
    <div className="flex flex-col gap-1 min-w-36">
      <label className="text-2xs font-semibold uppercase tracking-widest text-muted-foreground">{label}</label>
      <div className="relative">
        <select value={value} onChange={e => onChange(e.target.value)}
          className="w-full h-8 rounded-md border border-border bg-background px-2.5 pr-7 text-xs focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))] appearance-none dark:bg-slate-900 dark:text-white">
          <option value="">All</option>
          {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
      </div>
    </div>
  );
}

// ─── Table View ───────────────────────────────────────────────────────────────
function CaseTable({ cases, onOpen }: { cases:InvestigationCase[]; onOpen:(id:string)=>void }) {
  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/40">
              <th className="px-4 py-3 text-left text-2xs font-semibold uppercase tracking-wider text-muted-foreground">Case #</th>
              <th className="px-4 py-3 text-left text-2xs font-semibold uppercase tracking-wider text-muted-foreground">Crime Type</th>
              <th className="px-4 py-3 text-left text-2xs font-semibold uppercase tracking-wider text-muted-foreground">Current Stage</th>
              <th className="px-4 py-3 text-left text-2xs font-semibold uppercase tracking-wider text-muted-foreground">Officer</th>
              <th className="px-4 py-3 text-left text-2xs font-semibold uppercase tracking-wider text-muted-foreground">Priority</th>
              <th className="px-4 py-3 text-left text-2xs font-semibold uppercase tracking-wider text-muted-foreground">Status</th>
              <th className="px-4 py-3 text-left text-2xs font-semibold uppercase tracking-wider text-muted-foreground">Updated</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {cases.length === 0 ? (
              <tr><td colSpan={8} className="py-16 text-center text-sm text-muted-foreground">No cases match your filters.</td></tr>
            ) : cases.map((c, i) => (
              <motion.tr key={c.id} initial={{ opacity:0, y:6 }} animate={{ opacity:1, y:0 }} transition={{ delay: i*0.04 }}
                onClick={() => onOpen(c.id)}
                className="border-b border-border last:border-0 hover:bg-muted/40 transition-colors cursor-pointer group">
                <td className="px-4 py-3.5">
                  <p className="text-xs font-mono font-semibold text-[hsl(var(--primary))]">{c.caseNumber}</p>
                  <p className="text-2xs text-muted-foreground mt-0.5">{c.district}, {c.state}</p>
                </td>
                <td className="px-4 py-3.5">
                  <p className="text-xs font-medium text-foreground">{CRIME_LABEL[c.crimeType]}</p>
                  <p className="text-2xs text-muted-foreground">Victim: {c.victimCode.slice(-6)}</p>
                </td>
                <td className="px-4 py-3.5">
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-1.5 rounded-full bg-muted overflow-hidden">
                      <div className="h-full rounded-full bg-[hsl(var(--primary))] transition-all" style={{ width:`${(c.currentStageOrder/c.totalStages)*100}%` }} />
                    </div>
                    <span className="text-2xs text-muted-foreground">{c.currentStageOrder}/{c.totalStages}</span>
                  </div>
                  <p className="text-xs text-foreground mt-0.5 truncate max-w-[140px]">{c.currentStage}</p>
                </td>
                <td className="px-4 py-3.5">
                  <div className="flex items-center gap-2">
                    <Avatar name={c.assignedOfficer} size="xs" />
                    <p className="text-xs text-foreground truncate max-w-[120px]">{c.assignedOfficer}</p>
                  </div>
                </td>
                <td className="px-4 py-3.5">
                  <StatusBadge variant={PRIORITY_BADGE[c.priority]} size="xs" dot>{PRIORITY_LABEL[c.priority]}</StatusBadge>
                </td>
                <td className="px-4 py-3.5">
                  <StatusBadge variant={STATUS_BADGE[c.status]} size="xs" dot>{STATUS_LABEL[c.status]}</StatusBadge>
                </td>
                <td className="px-4 py-3.5 text-xs text-muted-foreground">{formatRelativeTime(c.updatedAt)}</td>
                <td className="px-4 py-3.5">
                  <button className="opacity-0 group-hover:opacity-100 p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-all">
                    <Eye className="h-3.5 w-3.5" />
                  </button>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Grid View ────────────────────────────────────────────────────────────────
function CaseGrid({ cases, onOpen }: { cases:InvestigationCase[]; onOpen:(id:string)=>void }) {
  if (cases.length === 0) return <div className="py-16 text-center text-sm text-muted-foreground">No cases match your filters.</div>;
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
      {cases.map((c, i) => (
        <motion.div key={c.id} initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay: i*0.06 }}
          whileHover={{ y:-3, transition:{ duration:0.15 } }}
          onClick={() => onOpen(c.id)}
          className="rounded-xl border border-border bg-card p-5 cursor-pointer hover:shadow-lg hover:border-[hsl(var(--primary))]/30 transition-all group">
          <div className="flex items-start justify-between gap-2 mb-3">
            <p className="text-xs font-mono font-semibold text-[hsl(var(--primary))] leading-tight">{c.caseNumber.split("/").slice(-1)[0]}</p>
            <div className="flex items-center gap-1.5">
              {c.priority === "critical" && <AlertTriangle className="h-3.5 w-3.5 text-red-500" />}
              <StatusBadge variant={STATUS_BADGE[c.status]} size="xs">{STATUS_LABEL[c.status]}</StatusBadge>
            </div>
          </div>
          <p className="text-sm font-semibold text-foreground mb-0.5">{CRIME_LABEL[c.crimeType]}</p>
          <p className="text-xs text-muted-foreground mb-3">{c.district}, {c.state}</p>
          <div className="space-y-2 mb-3">
            <div className="flex items-center justify-between text-2xs text-muted-foreground">
              <span>{c.currentStage}</span>
              <span>{c.currentStageOrder}/{c.totalStages}</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
              <div className="h-full rounded-full bg-[hsl(var(--primary))] transition-all" style={{ width:`${(c.currentStageOrder/c.totalStages)*100}%` }} />
            </div>
          </div>
          <div className="flex items-center justify-between pt-3 border-t border-border">
            <div className="flex items-center gap-1.5">
              <Avatar name={c.assignedOfficer} size="xs" />
              <p className="text-2xs text-muted-foreground truncate max-w-[100px]">{c.assignedOfficer}</p>
            </div>
            <div className="flex items-center gap-1 text-2xs text-muted-foreground">
              <Clock className="h-3 w-3" />{formatRelativeTime(c.updatedAt)}
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
