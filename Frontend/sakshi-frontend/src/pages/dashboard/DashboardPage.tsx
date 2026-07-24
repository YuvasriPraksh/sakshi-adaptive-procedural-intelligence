import { useState } from "react";
import { motion } from "framer-motion";
import {
  FolderOpen, Clock, CheckCircle2, AlertTriangle, TrendingUp,
  TrendingDown, ArrowRight, Bell, Plus, Search, Filter,
  MoreHorizontal, Eye, Calendar, Users, Activity,
} from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { AreaChart } from "@/components/ui/charts/AreaChart";
import { BarChart } from "@/components/ui/charts/BarChart";
import { PieChart } from "@/components/ui/charts/PieChart";
import { StatusBadge } from "@/components/ui/feedback/StatusBadge";
import { Avatar } from "@/components/ui/feedback/Avatar";
import { cn } from "@/lib/utils";
import { formatRelativeTime } from "@/utils/format";

// ─── Mock data ────────────────────────────────────────────────────────────────
const STATS = [
  { label: "Total Cases",      value: "1,284", change: +12, icon: FolderOpen,    color: "text-royal-600",   bg: "bg-royal-50 dark:bg-royal-950/40"    },
  { label: "Pending Action",   value: "47",    change: -8,  icon: Clock,         color: "text-amber-600",   bg: "bg-amber-50 dark:bg-amber-950/40"    },
  { label: "Resolved (30d)",   value: "312",   change: +23, icon: CheckCircle2,  color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-950/40"},
  { label: "Escalated",        value: "9",     change: -3,  icon: AlertTriangle, color: "text-red-600",     bg: "bg-red-50 dark:bg-red-950/40"        },
];

const MONTHLY_CASES = [
  { month: "Jan", cases: 89,  resolved: 72 },
  { month: "Feb", cases: 102, resolved: 88 },
  { month: "Mar", cases: 95,  resolved: 79 },
  { month: "Apr", cases: 118, resolved: 104},
  { month: "May", cases: 134, resolved: 119},
  { month: "Jun", cases: 128, resolved: 115},
  { month: "Jul", cases: 142, resolved: 128},
];

const AGENCY_DATA = [
  { agency: "Police",   count: 348 },
  { agency: "Hospital", count: 214 },
  { agency: "FSL",      count: 189 },
  { agency: "CWC",      count: 156 },
  { agency: "Other",    count: 89  },
];

const STATUS_PIE = [
  { label: "In Progress", value: 412, color: "#3b82f6" },
  { label: "Pending",     value: 287, color: "#f59e0b" },
  { label: "Resolved",    value: 523, color: "#10b981" },
  { label: "Escalated",   value: 62,  color: "#ef4444" },
];

const RECENT_CASES = [
  { id: "SAKSHI/2024/001842", victim: "Minor (F, 12)",  district: "South Delhi",   status: "in_progress", assigned: "SI Rajan K.", updated: new Date(Date.now() - 3600000 * 2) },
  { id: "SAKSHI/2024/001841", victim: "Minor (M, 9)",   district: "East Mumbai",   status: "pending",     assigned: "SI Priya S.", updated: new Date(Date.now() - 3600000 * 5) },
  { id: "SAKSHI/2024/001839", victim: "Minor (F, 15)",  district: "Bengaluru Sth", status: "resolved",    assigned: "SI Amit V.",  updated: new Date(Date.now() - 86400000) },
  { id: "SAKSHI/2024/001837", victim: "Minor (F, 11)",  district: "Chennai Cntrl", status: "escalated",   assigned: "DSP Kumar R.",updated: new Date(Date.now() - 86400000 * 2) },
  { id: "SAKSHI/2024/001835", victim: "Minor (M, 14)",  district: "Hyderabad W.",  status: "in_progress", assigned: "SI Deepa M.", updated: new Date(Date.now() - 86400000 * 2) },
];

const ACTIVITY = [
  { user: "SI Rajan Kumar",  action: "Updated medical examination report",    case: "#001842", time: new Date(Date.now() - 1800000),   avatar: "RK" },
  { user: "Dr. Priya Singh", action: "Submitted FSL evidence package",        case: "#001840", time: new Date(Date.now() - 3600000),   avatar: "PS" },
  { user: "CWC Officer",     action: "Completed child counselling session",   case: "#001838", time: new Date(Date.now() - 7200000),   avatar: "CO" },
  { user: "DSP Kumar Rao",   action: "Escalated case for judicial review",    case: "#001837", time: new Date(Date.now() - 10800000),  avatar: "KR" },
  { user: "SI Deepa Menon",  action: "Filed FIR and initiated investigation", case: "#001835", time: new Date(Date.now() - 18000000),  avatar: "DM" },
];

const QUICK_ACTIONS = [
  { label: "New Case",        icon: Plus,     color: "bg-royal-500 hover:bg-royal-600 text-white"          },
  { label: "Search Cases",    icon: Search,   color: "bg-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-700 text-foreground border border-border" },
  { label: "View Reports",    icon: Activity, color: "bg-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-700 text-foreground border border-border" },
  { label: "Schedule Audit",  icon: Calendar, color: "bg-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-700 text-foreground border border-border" },
];

const STATUS_STYLES: Record<string, string> = {
  in_progress: "success",
  pending:     "warning",
  resolved:    "muted",
  escalated:   "danger",
};
const STATUS_LABELS: Record<string, string> = {
  in_progress: "In Progress",
  pending:     "Pending",
  resolved:    "Resolved",
  escalated:   "Escalated",
};

export default function DashboardPage() {
  const [_search, _setSearch] = useState("");

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* ── Header ── */}
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Welcome back. Here's what's happening today.</p>
          </div>
          <div className="flex items-center gap-2">
            <button className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-xs font-medium text-muted-foreground hover:bg-muted transition-colors">
              <Filter className="h-3.5 w-3.5" /> Filter
            </button>
            <button className="inline-flex items-center gap-2 rounded-lg bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))]/90 px-4 py-2 text-xs font-semibold text-white transition-colors shadow-sm">
              <Plus className="h-3.5 w-3.5" /> New Case
            </button>
          </div>
        </div>

        {/* ── Stats ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {STATS.map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
              className="rounded-xl border border-border bg-card p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{s.label}</p>
                  <p className="mt-1.5 text-2xl font-bold text-foreground">{s.value}</p>
                  <div className={cn("mt-1.5 inline-flex items-center gap-1 text-xs font-medium", s.change >= 0 ? "text-emerald-600" : "text-red-500")}>
                    {s.change >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                    {Math.abs(s.change)}% vs last month
                  </div>
                </div>
                <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl", s.bg)}>
                  <s.icon className={cn("h-5 w-5", s.color)} />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* ── Charts row ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 rounded-xl border border-border bg-card p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm font-semibold text-foreground">Cases Overview</p>
                <p className="text-xs text-muted-foreground">Registered vs resolved — last 7 months</p>
              </div>
              <span className="text-xs text-muted-foreground bg-muted rounded-full px-2 py-0.5">2024</span>
            </div>
            <AreaChart
              data={MONTHLY_CASES}
              xKey="month"
              series={[
                { key: "cases",    label: "Registered", color: "#3b82f6" },
                { key: "resolved", label: "Resolved",   color: "#10b981" },
              ]}
              height={200}
              legend
            />
          </div>

          <div className="rounded-xl border border-border bg-card p-5">
            <div className="mb-4">
              <p className="text-sm font-semibold text-foreground">Case Status</p>
              <p className="text-xs text-muted-foreground">Distribution by status</p>
            </div>
            <PieChart data={STATUS_PIE} donut height={200} legend />
          </div>
        </div>

        {/* ── Bottom grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Recent cases */}
          <div className="lg:col-span-2 rounded-xl border border-border bg-card overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <p className="text-sm font-semibold text-foreground">Recent Cases</p>
              <button className="text-xs text-[hsl(var(--primary))] hover:underline flex items-center gap-1">
                View all <ArrowRight className="h-3 w-3" />
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="px-5 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Case ID</th>
                    <th className="px-3 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">District</th>
                    <th className="px-3 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                    <th className="px-3 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Updated</th>
                    <th className="px-3 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {RECENT_CASES.map((c, i) => (
                    <motion.tr key={c.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 + i * 0.05 }}
                      className="border-b border-border last:border-0 hover:bg-muted/40 transition-colors cursor-pointer">
                      <td className="px-5 py-3.5">
                        <p className="text-xs font-mono font-semibold text-[hsl(var(--primary))]">{c.id}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{c.victim}</p>
                      </td>
                      <td className="px-3 py-3.5 text-xs text-foreground">{c.district}</td>
                      <td className="px-3 py-3.5">
                        <StatusBadge variant={STATUS_STYLES[c.status] as "success" | "warning" | "danger" | "muted"} size="xs" dot>
                          {STATUS_LABELS[c.status]}
                        </StatusBadge>
                      </td>
                      <td className="px-3 py-3.5 text-xs text-muted-foreground">{formatRelativeTime(c.updated)}</td>
                      <td className="px-3 py-3.5">
                        <button className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
                          <Eye className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Right column */}
          <div className="space-y-4">
            {/* Quick actions */}
            <div className="rounded-xl border border-border bg-card p-4">
              <p className="text-sm font-semibold text-foreground mb-3">Quick Actions</p>
              <div className="grid grid-cols-2 gap-2">
                {QUICK_ACTIONS.map(a => (
                  <button key={a.label} className={cn("flex flex-col items-center gap-2 rounded-xl p-3 text-xs font-medium transition-all", a.color)}>
                    <a.icon className="h-4 w-4" /> {a.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Activity feed */}
            <div className="rounded-xl border border-border bg-card p-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-semibold text-foreground">Recent Activity</p>
                <Bell className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="space-y-3">
                {ACTIVITY.map((a, i) => (
                  <div key={i} className="flex items-start gap-2.5">
                    <Avatar name={a.avatar} size="sm" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-foreground leading-tight truncate">{a.user}</p>
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{a.action}</p>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className="text-2xs font-mono text-[hsl(var(--primary))]">{a.case}</span>
                        <span className="text-2xs text-muted-foreground/60">·</span>
                        <span className="text-2xs text-muted-foreground/60">{formatRelativeTime(a.time)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── Bar chart + users ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="rounded-xl border border-border bg-card p-5">
            <div className="mb-4">
              <p className="text-sm font-semibold text-foreground">Cases by Agency</p>
              <p className="text-xs text-muted-foreground">Total cases handled per agency this year</p>
            </div>
            <BarChart data={AGENCY_DATA} xKey="agency" series={[{ key: "count", label: "Cases", color: "#1d4ed8" }]} height={200} />
          </div>

          <div className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm font-semibold text-foreground">Active Officers</p>
                <p className="text-xs text-muted-foreground">Currently handling cases</p>
              </div>
              <button className="text-xs text-[hsl(var(--primary))] hover:underline flex items-center gap-1">
                View all <ArrowRight className="h-3 w-3" />
              </button>
            </div>
            <div className="space-y-3">
              {[
                { name: "SI Rajan Kumar",  role: "Police",   cases: 8, online: true  },
                { name: "Dr. Priya Singh", role: "Hospital", cases: 5, online: true  },
                { name: "Adv. Sunita Rao", role: "CWC",      cases: 6, online: true  },
                { name: "Dr. Amit Verma",  role: "FSL",      cases: 4, online: false },
                { name: "DSP Kumar Rao",   role: "Supervisor",cases:12, online: true },
              ].map(u => (
                <div key={u.name} className="flex items-center gap-3">
                  <Avatar name={u.name} size="sm" online={u.online} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-foreground truncate">{u.name}</p>
                    <p className="text-xs text-muted-foreground">{u.role}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-semibold text-foreground">{u.cases}</p>
                    <p className="text-2xs text-muted-foreground">cases</p>
                  </div>
                  <button className="p-1 rounded hover:bg-muted text-muted-foreground transition-colors">
                    <MoreHorizontal className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-3 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5"><Users className="h-3.5 w-3.5" /> 47 officers total</span>
              <span className="text-emerald-500 font-medium">34 online</span>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
