import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText, Download, Eye, RefreshCw, CheckCircle2,
  Clock, FolderOpen, Shield, Target, ClipboardList,
  Clipboard, X, Calendar, Database,
} from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatusBadge }    from "@/components/ui/feedback/StatusBadge";
import { cn }             from "@/lib/utils";
import { formatDate, formatRelativeTime } from "@/utils/format";
import { REPORTS, type ReportCard } from "@/data/reports.data";

const ICON_MAP: Record<string, React.ElementType> = {
  folder:        FolderOpen,
  "git-branch":  Clock,
  shield:        Shield,
  target:        Target,
  "clipboard-list": ClipboardList,
  clipboard:     Clipboard,
};

const CATEGORY_LABELS: Record<string, string> = {
  case: "Case", investigation: "Investigation", risk: "Risk",
  readiness: "Readiness", workflow: "Workflow", audit: "Audit",
};

const STATUS_BADGE = {
  ready:      { variant: "success" as const, label: "Ready",      icon: CheckCircle2 },
  generating: { variant: "warning" as const, label: "Generating", icon: Clock },
  scheduled:  { variant: "primary" as const, label: "Scheduled",  icon: Calendar },
};

// ─── Report Preview Modal ─────────────────────────────────────────────────────
function ReportPreviewModal({ report, onClose }: { report: ReportCard; onClose: () => void }) {
  const Icon = ICON_MAP[report.icon] ?? FileText;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <motion.div className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
          onClick={onClose} />
        <motion.div initial={{ opacity:0, scale:0.96, y:12 }} animate={{ opacity:1, scale:1, y:0 }} exit={{ opacity:0, scale:0.96 }}
          transition={{ duration:0.2 }}
          className="relative z-10 w-full max-w-3xl max-h-[90vh] flex flex-col rounded-2xl bg-card border border-border shadow-2xl">
          {/* Header */}
          <div className="flex items-start justify-between border-b border-border px-6 py-4 shrink-0">
            <div className="flex items-center gap-3">
              <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl border", report.color)}>
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-foreground">{report.title}</h2>
                <p className="text-xs text-muted-foreground">{report.period} · {report.recordCount} records</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="inline-flex items-center gap-1.5 rounded-lg bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))]/90 px-4 py-2 text-xs font-bold text-white transition-colors">
                <Download className="h-3.5 w-3.5" /> Download PDF
              </button>
              <button onClick={onClose} className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Meta info */}
          <div className="border-b border-border px-6 py-3 flex flex-wrap items-center gap-4 text-xs text-muted-foreground shrink-0">
            <span className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" />Generated: {formatDate(report.generatedAt)}</span>
            <span className="flex items-center gap-1.5"><Database className="h-3.5 w-3.5" />{report.recordCount} records</span>
            <StatusBadge variant={STATUS_BADGE[report.status].variant} size="xs" dot>{STATUS_BADGE[report.status].label}</StatusBadge>
            <span className="rounded-full border border-border bg-muted px-2 py-0.5 capitalize">{CATEGORY_LABELS[report.category]}</span>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
            <div>
              <p className="text-sm font-medium text-foreground mb-1.5">Description</p>
              <p className="text-sm text-muted-foreground leading-relaxed">{report.description}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-foreground mb-3">Data Preview (Top 5 records)</p>
              <div className="rounded-xl border border-border overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead className="bg-muted/50 border-b border-border">
                      <tr>
                        {report.previewHeaders.map(h => (
                          <th key={h} className="px-4 py-2.5 text-left font-semibold uppercase tracking-wider text-muted-foreground whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {report.previewRows.map((row, ri) => (
                        <tr key={ri} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                          {row.map((cell, ci) => (
                            <td key={ci} className="px-4 py-2.5 whitespace-nowrap text-foreground">{cell}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <p className="text-2xs text-muted-foreground mt-2 text-center">
                Showing 5 of {report.recordCount} records. Download for full report.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

// ─── Report Card ──────────────────────────────────────────────────────────────
function ReportCardItem({ report, onPreview, index }: { report:ReportCard; onPreview:(r:ReportCard)=>void; index:number }) {
  const [downloading, setDownloading] = useState(false);
  const Icon    = ICON_MAP[report.icon] ?? FileText;
  const sb      = STATUS_BADGE[report.status];
  const SIcon   = sb.icon;

  const handleDownload = async () => {
    setDownloading(true);
    await new Promise(r => setTimeout(r, 1500));
    setDownloading(false);
  };

  return (
    <motion.div
      initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay: index*0.07 }}
      whileHover={{ y:-3, transition:{ duration:0.15 } }}
      className="rounded-xl border border-border bg-card p-5 flex flex-col gap-4 hover:shadow-md hover:border-[hsl(var(--primary))]/20 transition-all">
      {/* Top */}
      <div className="flex items-start justify-between gap-3">
        <div className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border", report.color)}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground leading-tight">{report.title}</p>
          <div className="flex items-center gap-1.5 mt-1">
            <SIcon className="h-3 w-3 text-muted-foreground" />
            <StatusBadge variant={sb.variant} size="xs">{sb.label}</StatusBadge>
          </div>
        </div>
      </div>

      {/* Description */}
      <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">{report.description}</p>

      {/* Meta */}
      <div className="grid grid-cols-2 gap-2 text-2xs">
        <div><p className="text-muted-foreground">Period</p><p className="font-medium text-foreground">{report.period}</p></div>
        <div><p className="text-muted-foreground">Records</p><p className="font-medium text-foreground">{report.recordCount.toLocaleString()}</p></div>
        <div><p className="text-muted-foreground">Generated</p><p className="font-medium text-foreground">{formatRelativeTime(report.generatedAt)}</p></div>
        <div><p className="text-muted-foreground">Category</p><p className="font-medium text-foreground capitalize">{CATEGORY_LABELS[report.category]}</p></div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 pt-1 border-t border-border">
        <button onClick={() => onPreview(report)}
          className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg border border-border bg-card hover:bg-muted px-3 py-2 text-xs font-medium text-foreground transition-colors">
          <Eye className="h-3.5 w-3.5" /> Preview
        </button>
        <button onClick={handleDownload} disabled={downloading || report.status !== "ready"}
          className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))]/90 px-3 py-2 text-xs font-bold text-white transition-colors disabled:opacity-50">
          {downloading
            ? <><span className="h-3 w-3 rounded-full border-2 border-white/30 border-t-white animate-spin" /> Downloading…</>
            : <><Download className="h-3.5 w-3.5" /> Download</>}
        </button>
      </div>
    </motion.div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────
export default function ReportsPage() {
  const [preview, setPreview]       = useState<ReportCard | null>(null);
  const [activeFilter, setFilter]   = useState("all");
  const [refreshing, setRefreshing] = useState(false);

  const filterOptions = [
    { value:"all",           label:"All Reports"   },
    { value:"case",          label:"Case"          },
    { value:"investigation", label:"Investigation" },
    { value:"risk",          label:"Risk"          },
    { value:"readiness",     label:"Readiness"     },
    { value:"workflow",      label:"Workflow"      },
    { value:"audit",         label:"Audit"         },
  ];

  const filtered = activeFilter === "all" ? REPORTS : REPORTS.filter(r => r.category === activeFilter);

  const handleRefresh = async () => {
    setRefreshing(true);
    await new Promise(r => setTimeout(r, 1200));
    setRefreshing(false);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Reports</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Download and preview investigation reports · {REPORTS.length} reports available
            </p>
          </div>
          <button onClick={handleRefresh} disabled={refreshing}
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-xs font-medium hover:bg-muted transition-colors disabled:opacity-60">
            <RefreshCw className={cn("h-3.5 w-3.5", refreshing && "animate-spin")} />
            {refreshing ? "Refreshing…" : "Refresh"}
          </button>
        </div>

        {/* Stats strip */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {[
            { label:"Total",      value:REPORTS.length                             },
            { label:"Ready",      value:REPORTS.filter(r=>r.status==="ready").length     },
            { label:"Case",       value:REPORTS.filter(r=>r.category==="case").length    },
            { label:"Risk",       value:REPORTS.filter(r=>r.category==="risk").length    },
            { label:"Workflow",   value:REPORTS.filter(r=>r.category==="workflow").length},
            { label:"Audit",      value:REPORTS.filter(r=>r.category==="audit").length   },
          ].map(s => (
            <div key={s.label} className="rounded-xl border border-border bg-card px-4 py-3 text-center">
              <p className="text-2xl font-bold text-foreground">{s.value}</p>
              <p className="text-2xs text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Filter chips */}
        <div className="flex flex-wrap items-center gap-2">
          {filterOptions.map(f => (
            <button key={f.value} onClick={() => setFilter(f.value)}
              className={cn("rounded-full px-4 py-1.5 text-xs font-medium transition-colors",
                activeFilter === f.value
                  ? "bg-[hsl(var(--primary))] text-white shadow-sm"
                  : "border border-border bg-card text-muted-foreground hover:bg-muted")}>
              {f.label}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((report, i) => (
            <ReportCardItem key={report.id} report={report} index={i} onPreview={setPreview} />
          ))}
        </div>
      </div>

      {preview && <ReportPreviewModal report={preview} onClose={() => setPreview(null)} />}
    </DashboardLayout>
  );
}
