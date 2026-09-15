import { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Shield, Search, Filter, ChevronDown,
  CheckCircle2, AlertTriangle, XCircle, Info,
  FolderOpen, GitBranch, FileText, BrainCircuit,
  Lock, Users, BarChart3, Bell, Settings,
} from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatusBadge }    from "@/components/ui/feedback/StatusBadge";
import { Avatar }         from "@/components/ui/feedback/Avatar";
import { Pagination }     from "@/components/ui/feedback/Pagination";
import { cn }             from "@/lib/utils";
import { formatDateTime, formatRelativeTime } from "@/utils/format";
import { type AuditModule, type AuditStatus } from "@/data/audit.data";
import { auditService, type ChainVerificationResult } from "@/services/auditService";
import type { AuditEntry } from "@/data/audit.data";

const MODULE_CONFIG: Record<AuditModule, { icon: React.ElementType; color: string; bg: string }> = {
  cases:         { icon: FolderOpen,    color:"text-royal-600",   bg:"bg-royal-50   dark:bg-royal-950/30"   },
  workflow:      { icon: GitBranch,     color:"text-emerald-600", bg:"bg-emerald-50 dark:bg-emerald-950/30" },
  documents:     { icon: FileText,      color:"text-purple-600",  bg:"bg-purple-50  dark:bg-purple-950/30"  },
  ai:            { icon: BrainCircuit,  color:"text-indigo-600",  bg:"bg-indigo-50  dark:bg-indigo-950/30"  },
  auth:          { icon: Lock,          color:"text-amber-600",   bg:"bg-amber-50   dark:bg-amber-950/30"   },
  users:         { icon: Users,         color:"text-blue-600",    bg:"bg-blue-50    dark:bg-blue-950/30"    },
  reports:       { icon: BarChart3,     color:"text-teal-600",    bg:"bg-teal-50    dark:bg-teal-950/30"    },
  notifications: { icon: Bell,          color:"text-orange-600",  bg:"bg-orange-50  dark:bg-orange-950/30"  },
  settings:      { icon: Settings,      color:"text-slate-600",   bg:"bg-slate-100  dark:bg-slate-800/50"   },
};

const STATUS_CONFIG: Record<AuditStatus, { icon: React.ElementType; badge: "success"|"warning"|"danger"|"info"; label: string }> = {
  success: { icon: CheckCircle2,   badge:"success", label:"Success" },
  warning: { icon: AlertTriangle,  badge:"warning", label:"Warning" },
  error:   { icon: XCircle,        badge:"danger",  label:"Error"   },
  info:    { icon: Info,            badge:"info",    label:"Info"    },
};

const PAGE_SIZE = 10;

export default function AuditPage() {
  const [search,         setSearch]         = useState("");
  const [moduleFilter,   setModuleFilter]   = useState<AuditModule | "">("");
  const [statusFilter,   setStatusFilter]   = useState<AuditStatus | "">("");
  const [userFilter,     setUserFilter]     = useState("");
  const [page,           setPage]           = useState(1);
  const [viewMode,       setViewMode]       = useState<"timeline"|"table">("timeline");
  
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [verificationResult, setVerificationResult] = useState<ChainVerificationResult | null>(null);
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    const fetchAuditLogs = async () => {
      setLoading(true);
      try {
        const response = await auditService.list({ 
          page, 
          pageSize: PAGE_SIZE,
          module: moduleFilter || undefined,
          status: statusFilter || undefined,
          // Could add search or userFilter to the API later
        });
        if (response.success) {
          setEntries(response.data);
          // Normally we'd use response.pagination here, but for now we'll just set entries
        }
      } catch (error) {
        console.error("Failed to fetch audit logs", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAuditLogs();
  }, [page, moduleFilter, statusFilter, userFilter, search]);

  const handleVerifyChain = async () => {
    setVerifying(true);
    try {
      const response = await auditService.verifyChain("system");
      if (response.success) {
        setVerificationResult(response.data);
      }
    } catch (error) {
      console.error("Failed to verify audit chain", error);
    } finally {
      setVerifying(false);
    }
  };

  const users = useMemo(() => [...new Set(entries.map(e => e.user))].sort(), [entries]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return entries.filter(e => {
      if (q && !e.action.toLowerCase().includes(q) && !e.user.toLowerCase().includes(q) && !e.details.toLowerCase().includes(q)) return false;
      if (moduleFilter && e.module !== moduleFilter) return false;
      if (statusFilter && e.status !== statusFilter) return false;
      if (userFilter   && e.user  !== userFilter)   return false;
      return true;
    });
  }, [search, moduleFilter, statusFilter, userFilter, entries]);

  const stats = {
    total:   entries.length,
    success: entries.filter(e=>e.status==="success").length,
    warning: entries.filter(e=>e.status==="warning").length,
    error:   entries.filter(e=>e.status==="error").length,
  };

  return (
    <DashboardLayout>
      <div className="space-y-5">
        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Audit Trail</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Traceable activity log · {stats.total} total events
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center rounded-lg border border-border overflow-hidden">
              {(["timeline","table"] as const).map(v => (
                <button key={v} onClick={() => setViewMode(v)}
                  className={cn("px-3 py-1.5 text-xs font-medium transition-colors capitalize",
                    viewMode===v ? "bg-[hsl(var(--primary))] text-white" : "bg-card text-muted-foreground hover:bg-muted")}>
                  {v}
                </button>
              ))}
            </div>
            <button 
              onClick={handleVerifyChain}
              disabled={verifying}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium hover:bg-muted transition-colors"
            >
              <Shield className="h-3.5 w-3.5" /> {verifying ? "Verifying..." : "Verify Chain"}
            </button>
          </div>
        </div>

        {verificationResult && (
          <div className={cn("p-4 rounded-lg border", verificationResult.valid ? "bg-emerald-50 border-emerald-200 text-emerald-800" : "bg-red-50 border-red-200 text-red-800")}>
            <div className="flex items-center gap-2 mb-2">
              {verificationResult.valid ? <CheckCircle2 className="h-5 w-5" /> : <XCircle className="h-5 w-5" />}
              <h3 className="font-bold">{verificationResult.valid ? "VERIFIED" : "TAMPER DETECTED"}</h3>
            </div>
            <p className="text-sm">{verificationResult.message}</p>
            <div className="mt-2 text-xs flex gap-4">
              <span>Verified Events: {verificationResult.verified_events}</span>
              <span>Total Chain Length: {verificationResult.chain_length}</span>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-4 gap-3">
          {[
            { label:"Total Events",  value:stats.total,   color:"text-foreground"  },
            { label:"Successful",    value:stats.success, color:"text-emerald-600" },
            { label:"Warnings",      value:stats.warning, color:"text-amber-600"   },
            { label:"Errors",        value:stats.error,   color:"text-red-600"     },
          ].map(s => (
            <div key={s.label} className="rounded-xl border border-border bg-card px-4 py-3 text-center">
              <p className={cn("text-2xl font-bold", s.color)}>{s.value}</p>
              <p className="text-2xs text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search actions, users, details…"
              className="w-full h-9 rounded-lg border border-border bg-card pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))] dark:bg-slate-900 dark:text-white" />
          </div>
          <FilterSel label="Module" value={moduleFilter} onChange={v => { setModuleFilter(v as AuditModule|""); setPage(1); }}
            options={[{value:"",label:"All Modules"}, ...Object.keys(MODULE_CONFIG).map(m=>({value:m,label:m.charAt(0).toUpperCase()+m.slice(1)}))]} />
          <FilterSel label="Status" value={statusFilter} onChange={v => { setStatusFilter(v as AuditStatus|""); setPage(1); }}
            options={[{value:"",label:"All Status"},{value:"success",label:"Success"},{value:"warning",label:"Warning"},{value:"error",label:"Error"},{value:"info",label:"Info"}]} />
          <FilterSel label="User" value={userFilter} onChange={v => { setUserFilter(v); setPage(1); }}
            options={[{value:"",label:"All Users"}, ...users.map(u=>({value:u,label:u}))]} />
          <span className="text-xs text-muted-foreground">{filtered.length} events</span>
        </div>

        {/* Content */}
        {loading ? (
           <div className="py-20 text-center"><p className="text-muted-foreground">Loading audit logs...</p></div>
        ) : viewMode === "timeline" ? (
          <TimelineView entries={filtered} />
        ) : (
          <TableView entries={filtered} />
        )}

        {/* Pagination */}
        {filtered.length > PAGE_SIZE && (
          <Pagination page={page} totalPages={Math.ceil(filtered.length/PAGE_SIZE)} onPageChange={setPage}
            total={filtered.length} pageSize={PAGE_SIZE} showInfo />
        )}
      </div>
    </DashboardLayout>
  );
}

// ─── Timeline View ─────────────────────────────────────────────────────────────
function TimelineView({ entries }: { entries: AuditEntry[] }) {
  if (entries.length === 0) return (
    <div className="rounded-xl border border-border bg-card py-16 text-center">
      <Shield className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
      <p className="text-sm text-muted-foreground">No audit events match your filters.</p>
    </div>
  );

  return (
    <div className="relative">
      <div className="absolute left-[31px] top-0 bottom-0 w-0.5 bg-border" />
      <div className="space-y-1">
        {entries.map((entry, i) => {
          const mod = MODULE_CONFIG[entry.module as AuditModule] ?? MODULE_CONFIG.cases;
          const st  = STATUS_CONFIG[entry.status];
          const ModIcon = mod.icon;
          return (
            <motion.div key={entry.id} initial={{ opacity:0, x:-12 }} animate={{ opacity:1, x:0 }} transition={{ delay: i*0.04 }}
              className="relative flex gap-4 pl-4 group">
              {/* Dot */}
              <div className={cn("flex h-[40px] w-[40px] shrink-0 items-center justify-center rounded-xl border z-10 bg-card", mod.bg)}>
                <ModIcon className={cn("h-4 w-4", mod.color)} />
              </div>
              {/* Card */}
              <div className="flex-1 rounded-xl border border-border bg-card px-4 py-3 hover:shadow-sm hover:border-[hsl(var(--primary))]/20 transition-all mb-2">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-semibold text-foreground">{entry.action}</p>
                      <StatusBadge variant={st.badge} size="xs">{st.label}</StatusBadge>
                      <span className="rounded-full border border-border bg-muted px-2 py-0.5 text-2xs capitalize text-muted-foreground">{entry.module}</span>
                      {entry.caseNumber && (
                        <span className="font-mono text-2xs text-[hsl(var(--primary))]">#{entry.caseNumber}</span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{entry.details}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-2xs text-muted-foreground">{formatRelativeTime(entry.timestamp)}</p>
                    <p className="text-2xs text-muted-foreground/60">{formatDateTime(entry.timestamp)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 mt-2 pt-2 border-t border-border">
                  <div className="flex items-center gap-2">
                    <Avatar name={entry.user} size="xs" />
                    <span className="text-xs font-medium text-foreground">{entry.user}</span>
                    <span className="text-2xs text-muted-foreground">({entry.userRole})</span>
                  </div>
                  <span className="text-2xs text-muted-foreground/60 ml-auto font-mono">{entry.ipAddress}</span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Table View ────────────────────────────────────────────────────────────────
function TableView({ entries }: { entries: AuditEntry[] }) {
  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/40">
              {["Timestamp","User / Role","Action","Module","Details","Status","IP"].map(h => (
                <th key={h} className="px-4 py-3 text-left text-2xs font-semibold uppercase tracking-wider text-muted-foreground whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {entries.length === 0 ? (
              <tr><td colSpan={7} className="py-16 text-center text-sm text-muted-foreground">No events match your filters.</td></tr>
            ) : (
              entries.map((entry, i) => {
                const st = STATUS_CONFIG[entry.status];
                const mod = MODULE_CONFIG[entry.module as AuditModule] ?? MODULE_CONFIG.cases;
                const ModIcon = mod.icon;
                return (
                  <motion.tr key={entry.id} initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:i*0.03 }}
                    className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 text-2xs text-muted-foreground whitespace-nowrap">{formatDateTime(entry.timestamp)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Avatar name={entry.user} size="xs" />
                        <div><p className="text-xs font-medium text-foreground whitespace-nowrap">{entry.user}</p><p className="text-2xs text-muted-foreground">{entry.userRole}</p></div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs font-medium text-foreground whitespace-nowrap">{entry.action}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <div className={cn("flex h-5 w-5 items-center justify-center rounded", mod.bg)}>
                          <ModIcon className={cn("h-3 w-3", mod.color)} />
                        </div>
                        <span className="text-xs capitalize text-foreground">{entry.module}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground max-w-[260px] truncate">{entry.details}</td>
                    <td className="px-4 py-3"><StatusBadge variant={st.badge} size="xs">{st.label}</StatusBadge></td>
                    <td className="px-4 py-3 text-2xs font-mono text-muted-foreground whitespace-nowrap">{entry.ipAddress}</td>
                  </motion.tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function FilterSel({ label, value, onChange, options }: { label:string; value:string; onChange:(v:string)=>void; options:{value:string;label:string}[] }) {
  return (
    <div className="relative flex items-center">
      <Filter className="pointer-events-none absolute left-2.5 h-3.5 w-3.5 text-muted-foreground" />
      <select value={value} onChange={e => onChange(e.target.value)}
        className="h-9 rounded-lg border border-border bg-card pl-8 pr-7 text-xs focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))] appearance-none dark:bg-slate-900 dark:text-white" aria-label={label}>
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2 h-3 w-3 text-muted-foreground" />
    </div>
  );
}
