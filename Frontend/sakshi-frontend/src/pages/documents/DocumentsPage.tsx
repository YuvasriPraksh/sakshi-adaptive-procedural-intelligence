import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FileText, Search, Filter, ChevronDown, Trash2, ExternalLink } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatusBadge }     from "@/components/ui/feedback/StatusBadge";
import { CASES }           from "@/data/cases.data";
import { formatDate }      from "@/utils/format";
import type { CaseDocument } from "@/types/case.types";

interface DocWithCase extends CaseDocument { caseNumber: string; caseId: string; }

const TYPE_COLORS: Record<string, string> = {
  fir:               "primary", medical_report: "success",
  fsl_report:        "info",    witness_statement: "warning",
  evidence:          "danger",  other: "muted",
};
const TYPE_LABELS: Record<string, string> = {
  fir:"FIR", medical_report:"Medical", fsl_report:"FSL",
  witness_statement:"Witness", evidence:"Evidence", other:"Other",
};

export default function DocumentsPage() {
  const navigate = useNavigate();
  const [search,   setSearch]  = useState("");
  const [typeFilter,setTypeFilter]= useState("");
  const [docs, setDocs]        = useState<DocWithCase[]>(() =>
    CASES.flatMap(c => c.documents.map(d => ({ ...d, caseNumber: c.caseNumber, caseId: c.id }))),
  );

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return docs.filter(d => {
      if (typeFilter && d.type !== typeFilter) return false;
      if (q && !d.name.toLowerCase().includes(q) && !d.caseNumber.toLowerCase().includes(q) && !d.uploadedBy.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [docs, search, typeFilter]);

  const handleDelete = (id: string) => setDocs(prev => prev.filter(d => d.id !== id));

  return (
    <DashboardLayout>
      <div className="space-y-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Documents</h1>
            <p className="text-sm text-muted-foreground mt-0.5">All case documents across the platform · {docs.length} total</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {Object.entries(TYPE_LABELS).map(([type, label]) => {
            const count = docs.filter(d => d.type === type).length;
            return (
              <div key={type} className="rounded-xl border border-border bg-card px-4 py-3 text-center">
                <p className="text-xl font-bold text-foreground">{count}</p>
                <p className="text-2xs text-muted-foreground">{label}</p>
              </div>
            );
          })}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search documents, cases, officers…"
              className="w-full h-9 rounded-lg border border-border bg-card pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))] dark:bg-slate-900 dark:text-white" />
          </div>
          <div className="relative flex items-center">
            <Filter className="pointer-events-none absolute left-2.5 h-3.5 w-3.5 text-muted-foreground" />
            <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}
              className="h-9 rounded-lg border border-border bg-card pl-8 pr-7 text-xs focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))] appearance-none dark:bg-slate-900 dark:text-white">
              <option value="">All Types</option>
              {Object.entries(TYPE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2 h-3 w-3 text-muted-foreground" />
          </div>
          <span className="text-xs text-muted-foreground">{filtered.length} documents</span>
        </div>

        {/* Table */}
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  {["Document Name","Type","Case #","Uploaded By","Date","Size",""].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-2xs font-semibold uppercase tracking-wider text-muted-foreground whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={7} className="py-12 text-center text-sm text-muted-foreground">No documents found.</td></tr>
                ) : (
                  filtered.map((doc, i) => (
                    <motion.tr key={doc.id} initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay: i*0.02 }}
                      className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors group">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                          <p className="text-sm font-medium text-foreground">{doc.name}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge variant={TYPE_COLORS[doc.type] as "primary"|"success"|"info"|"warning"|"danger"|"muted"} size="xs">
                          {TYPE_LABELS[doc.type]}
                        </StatusBadge>
                      </td>
                      <td className="px-4 py-3 text-xs font-mono text-[hsl(var(--primary))] whitespace-nowrap">{doc.caseNumber.split("/").pop()}</td>
                      <td className="px-4 py-3 text-xs text-foreground whitespace-nowrap">{doc.uploadedBy}</td>
                      <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">{formatDate(doc.uploadedAt)}</td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{doc.size}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => navigate(`/cases/${doc.caseId}`)} className="inline-flex items-center gap-1 rounded border border-border px-2 py-1 text-2xs font-semibold text-muted-foreground hover:bg-muted hover:text-foreground transition-colors" title="Open case">
                            <ExternalLink className="h-3 w-3" /> Case
                          </button>
                          <button onClick={() => handleDelete(doc.id)} className="p-1.5 rounded hover:bg-red-50 dark:hover:bg-red-950/30 text-muted-foreground hover:text-red-500 transition-colors" title="Delete"><Trash2 className="h-3.5 w-3.5" /></button>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
