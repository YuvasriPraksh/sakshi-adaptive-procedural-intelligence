import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText, Download, Trash2, Eye, Upload, File,
  FileImage, FileSpreadsheet, Search, Plus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDate } from "@/utils/format";
import type { CaseDocument } from "@/types/case.types";
import { useNotifications } from "@/context/NotificationContext";

interface Props { documents: CaseDocument[] }

const TYPE_LABELS: Record<string, string> = {
  fir:               "FIR",
  medical_report:    "Medical Report",
  fsl_report:        "FSL Report",
  witness_statement: "Witness Statement",
  evidence:          "Evidence",
  other:             "Other",
};

const TYPE_COLORS: Record<string, string> = {
  fir:               "bg-royal-50 text-royal-700 border-royal-200 dark:bg-royal-950/30 dark:text-royal-300",
  medical_report:    "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-300",
  fsl_report:        "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/30 dark:text-purple-300",
  witness_statement: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-300",
  evidence:          "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/30 dark:text-red-300",
  other:             "bg-muted text-muted-foreground border-border",
};

function DocIcon({ name }: { name: string }) {
  if (name.endsWith(".pdf"))   return <FileText className="h-5 w-5 text-red-500" />;
  if (name.endsWith(".zip"))   return <File className="h-5 w-5 text-orange-500" />;
  if (name.match(/\.(jpg|png|jpeg)/)) return <FileImage className="h-5 w-5 text-blue-500" />;
  if (name.match(/\.(xlsx|csv)/))     return <FileSpreadsheet className="h-5 w-5 text-green-500" />;
  return <FileText className="h-5 w-5 text-slate-400" />;
}

export function DocumentsTab({ documents: initialDocs }: Props) {
  const [docs, setDocs]   = useState<CaseDocument[]>(initialDocs);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("");
  const { toast } = useNotifications();

  const filtered = docs.filter(d => {
    if (search && !d.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (filter && d.type !== filter) return false;
    return true;
  });

  const handleDelete = (id: string) => {
    setDocs(prev => prev.filter(d => d.id !== id));
    toast({ title: "Document deleted", variant: "success" });
  };

  const handleUpload = () => {
    const fake: CaseDocument = {
      id:         `d-${Date.now()}`,
      name:       "New Document.pdf",
      type:       "other",
      uploadedBy: "Current User",
      uploadedAt: new Date().toISOString(),
      size:       "125 KB",
    };
    setDocs(prev => [fake, ...prev]);
    toast({ title: "Document uploaded", message: "New Document.pdf added successfully.", variant: "success" });
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-40">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search documents…"
            className="w-full h-9 rounded-lg border border-border bg-card pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))] dark:bg-slate-900 dark:text-white" />
        </div>
        <select value={filter} onChange={e => setFilter(e.target.value)}
          className="h-9 rounded-lg border border-border bg-card px-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))] dark:bg-slate-900 dark:text-white">
          <option value="">All types</option>
          {Object.entries(TYPE_LABELS).map(([v,l]) => <option key={v} value={v}>{l}</option>)}
        </select>
        <button onClick={handleUpload}
          className="inline-flex items-center gap-2 rounded-lg bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))]/90 px-4 py-2 text-xs font-bold text-white transition-colors shadow-sm">
          <Upload className="h-3.5 w-3.5" /> Upload Document
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {Object.entries(TYPE_LABELS).slice(0, 4).map(([type, label]) => {
          const count = docs.filter(d => d.type === type).length;
          return (
            <div key={type} className="rounded-lg border border-border bg-card px-4 py-3 text-center">
              <p className="text-lg font-bold text-foreground">{count}</p>
              <p className="text-xs text-muted-foreground">{label}</p>
            </div>
          );
        })}
      </div>

      {/* Upload zone */}
      <div onClick={handleUpload}
        className="rounded-xl border-2 border-dashed border-border hover:border-[hsl(var(--primary))]/50 bg-muted/30 hover:bg-[hsl(var(--primary))]/5 p-6 text-center cursor-pointer transition-all group">
        <Plus className="h-6 w-6 text-muted-foreground group-hover:text-[hsl(var(--primary))] mx-auto mb-2 transition-colors" />
        <p className="text-sm font-medium text-foreground">Click to upload a document</p>
        <p className="text-xs text-muted-foreground mt-0.5">PDF, DOCX, XLSX, Images, ZIP up to 50MB</p>
      </div>

      {/* Document list */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="border-b border-border bg-muted/40 px-5 py-3 flex items-center justify-between">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{filtered.length} Documents</p>
        </div>
        {filtered.length === 0 ? (
          <div className="py-12 text-center text-sm text-muted-foreground">No documents found.</div>
        ) : (
          <AnimatePresence mode="popLayout">
            {filtered.map((doc, i) => (
              <motion.div key={doc.id} initial={{ opacity:0, y:4 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, scale:0.98 }} transition={{ delay: i*0.04 }}
                className="flex items-center gap-4 border-b border-border last:border-0 px-5 py-3.5 hover:bg-muted/30 transition-colors group">
                <DocIcon name={doc.name} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{doc.name}</p>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className={cn("text-2xs rounded-full border px-2 py-0.5 font-medium", TYPE_COLORS[doc.type])}>
                      {TYPE_LABELS[doc.type]}
                    </span>
                    <span className="text-2xs text-muted-foreground">{doc.size}</span>
                    <span className="text-2xs text-muted-foreground">{doc.uploadedBy}</span>
                    <span className="text-2xs text-muted-foreground">{formatDate(doc.uploadedAt)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors" title="Preview"><Eye className="h-3.5 w-3.5" /></button>
                  <button className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors" title="Download"><Download className="h-3.5 w-3.5" /></button>
                  <button onClick={() => handleDelete(doc.id)} className="p-1.5 rounded-md hover:bg-red-50 dark:hover:bg-red-950/30 text-muted-foreground hover:text-red-600 transition-colors" title="Delete"><Trash2 className="h-3.5 w-3.5" /></button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
