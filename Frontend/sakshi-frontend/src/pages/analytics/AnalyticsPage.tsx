import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  FolderOpen, Activity, CheckCircle2, AlertTriangle,
  Clock, BarChart3, TrendingUp, TrendingDown, ChevronDown,
  BrainCircuit, Shield, Target,
} from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { AreaChart }   from "@/components/ui/charts/AreaChart";
import { BarChart }    from "@/components/ui/charts/BarChart";
import { PieChart }    from "@/components/ui/charts/PieChart";
import { LineChart }   from "@/components/ui/charts/LineChart";
import { ProgressBar } from "@/components/ui/feedback/ProgressBar";
import { StatusBadge } from "@/components/ui/feedback/StatusBadge";
import { Avatar }      from "@/components/ui/feedback/Avatar";
import { cn }          from "@/lib/utils";
import {
  MONTHLY_TREND, CRIME_TYPE_DATA, STATUS_DIST, RISK_DIST,
  READINESS_DIST, OFFICER_PERF, DEPT_CASES, KPI_STATS,
} from "@/data/analytics.data";
import { CASES } from "@/data/cases.data";
import { OFFICERS } from "@/data/officers.data";

const fade = { initial:{ opacity:0, y:10 }, animate:{ opacity:1, y:0 } };

// ─── KPI card ─────────────────────────────────────────────────────────────────
interface KpiCardProps {
  label:    string;
  value:    string | number;
  sub?:     string;
  icon:     React.ElementType;
  iconBg:   string;
  iconColor:string;
  trend?:   { value: number; positive: boolean };
  delay?:   number;
}
function KpiCard({ label, value, sub, icon: Icon, iconBg, iconColor, trend, delay=0 }: KpiCardProps) {
  return (
    <motion.div {...fade} transition={{ delay }} whileHover={{ y:-2, transition:{ duration:0.15 } }}
      className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
          <p className="mt-1.5 text-3xl font-extrabold text-foreground">{value}</p>
          {sub && <p className="mt-0.5 text-xs text-muted-foreground">{sub}</p>}
          {trend && (
            <div className={cn("mt-2 inline-flex items-center gap-1 text-xs font-semibold",
              trend.positive ? "text-emerald-600" : "text-red-500")}>
              {trend.positive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              {Math.abs(trend.value)}% vs last month
            </div>
          )}
        </div>
        <div className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-xl", iconBg)}>
          <Icon className={cn("h-5 w-5", iconColor)} />
        </div>
      </div>
    </motion.div>
  );
}

// ─── Section title ─────────────────────────────────────────────────────────────
function SectionTitle({ title, sub }: { title: string; sub?: string }) {
  return (
    <div className="mb-4">
      <h2 className="text-base font-semibold text-foreground">{title}</h2>
      {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
    </div>
  );
}

// ─── Filter bar ────────────────────────────────────────────────────────────────
function FilterSelect({ label, options, value, onChange }: { label:string; options:{value:string;label:string}[]; value:string; onChange:(v:string)=>void }) {
  return (
    <div className="relative flex items-center">
      <select value={value} onChange={e => onChange(e.target.value)}
        className="h-8 rounded-lg border border-border bg-card px-3 pr-7 text-xs focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))] appearance-none dark:bg-slate-900 dark:text-white"
        aria-label={label}>
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2 h-3 w-3 text-muted-foreground" />
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────
export default function AnalyticsPage() {
  const [periodFilter,  setPeriodFilter]  = useState("all");
  const [statusFilter,  setStatusFilter]  = useState("all");
  const [officerFilter, setOfficerFilter] = useState("all");
  const [deptFilter,    setDeptFilter]    = useState("all");

  const officerOptions = useMemo(() =>
    [{ value:"all", label:"All Officers" }, ...OFFICERS.map(o => ({ value:o.id, label:o.name }))], []);

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* ── Header ── */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Analytics Dashboard</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Real-time POCSO investigation analytics · Data updated Feb 20, 2024
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <FilterSelect label="Period" value={periodFilter} onChange={setPeriodFilter}
              options={[{value:"all",label:"All Time"},{value:"7d",label:"Last 7 days"},{value:"30d",label:"Last 30 days"},{value:"90d",label:"Last 90 days"}]} />
            <FilterSelect label="Status" value={statusFilter} onChange={setStatusFilter}
              options={[{value:"all",label:"All Status"},{value:"in_progress",label:"In Progress"},{value:"pending",label:"Pending"},{value:"escalated",label:"Escalated"},{value:"completed",label:"Completed"}]} />
            <FilterSelect label="Officer" value={officerFilter} onChange={setOfficerFilter} options={officerOptions} />
            <FilterSelect label="Department" value={deptFilter} onChange={setDeptFilter}
              options={[{value:"all",label:"All Depts"},{value:"police",label:"Police"},{value:"hospital",label:"Hospital"},{value:"fsl",label:"FSL"},{value:"cwc",label:"CWC"}]} />
          </div>
        </div>

        {/* ── KPI strip ── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-4">
          <KpiCard label="Total Cases"     value={KPI_STATS.totalCases}        sub="All time"               icon={FolderOpen}     iconBg="bg-royal-50 dark:bg-royal-950/40"   iconColor="text-royal-600"   trend={{ value:12, positive:true  }} delay={0.04} />
          <KpiCard label="Active Cases"    value={KPI_STATS.activeCases}       sub="Currently open"         icon={Activity}       iconBg="bg-blue-50 dark:bg-blue-950/40"     iconColor="text-blue-600"    trend={{ value:5,  positive:true  }} delay={0.07} />
          <KpiCard label="Closed Cases"    value={KPI_STATS.closedCases}       sub="Resolved + closed"      icon={CheckCircle2}   iconBg="bg-emerald-50 dark:bg-emerald-950/40" iconColor="text-emerald-600" trend={{ value:18, positive:true  }} delay={0.10} />
          <KpiCard label="High Risk"       value={KPI_STATS.highRiskCases}     sub="Critical + high"        icon={AlertTriangle}  iconBg="bg-red-50 dark:bg-red-950/40"       iconColor="text-red-600"     trend={{ value:3,  positive:false }} delay={0.13} />
          <KpiCard label="Avg Days"        value={`${KPI_STATS.avgInvestigationDays}d`} sub="Investigation time" icon={Clock}     iconBg="bg-amber-50 dark:bg-amber-950/40"   iconColor="text-amber-600"   trend={{ value:8,  positive:true  }} delay={0.16} />
          <KpiCard label="SLA Compliance"  value={`${KPI_STATS.slaCompliance}%`} sub="Target: 90%"          icon={BarChart3}      iconBg="bg-purple-50 dark:bg-purple-950/40" iconColor="text-purple-600"  trend={{ value:4,  positive:true  }} delay={0.19} />
        </div>

        {/* ── Row 1: Monthly trend + Status distribution ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 rounded-xl border border-border bg-card p-5">
            <SectionTitle title="Monthly Case Trends" sub="Cases registered vs resolved over the last 7 months" />
            <AreaChart data={MONTHLY_TREND} xKey="month" height={240} legend
              series={[
                { key:"registered", label:"Registered", color:"#3b82f6" },
                { key:"resolved",   label:"Resolved",   color:"#10b981" },
                { key:"escalated",  label:"Escalated",  color:"#ef4444" },
              ]} />
          </div>
          <div className="rounded-xl border border-border bg-card p-5">
            <SectionTitle title="Case Status Distribution" sub="Current status breakdown" />
            <PieChart data={STATUS_DIST} donut height={200} legend />
            <div className="mt-4 space-y-2">
              {STATUS_DIST.map(s => (
                <div key={s.label} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
                    <span className="text-muted-foreground">{s.label}</span>
                  </div>
                  <span className="font-semibold text-foreground">{s.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Row 2: Crime type + Risk distribution ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="rounded-xl border border-border bg-card p-5">
            <SectionTitle title="Cases by Crime Type" sub="Distribution across POCSO offence categories" />
            <BarChart data={CRIME_TYPE_DATA} xKey="name" height={240}
              series={[{ key:"value", label:"Cases", color:"#1d4ed8" }]} />
          </div>
          <div className="rounded-xl border border-border bg-card p-5">
            <SectionTitle title="Risk Distribution" sub="AI-assessed risk level across all cases" />
            <PieChart data={RISK_DIST} donut height={200} legend />
            <div className="mt-4 grid grid-cols-2 gap-2">
              {RISK_DIST.map(r => (
                <div key={r.label} className="flex items-center gap-2 rounded-lg bg-muted/40 px-3 py-2">
                  <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: r.color }} />
                  <div>
                    <p className="text-xs font-semibold text-foreground">{r.value}%</p>
                    <p className="text-2xs text-muted-foreground">{r.label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Row 3: Officer performance ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 rounded-xl border border-border bg-card p-5">
            <SectionTitle title="Officer Performance" sub="Active cases, resolutions, and average investigation days" />
            <BarChart data={OFFICER_PERF} xKey="name" height={220} legend
              series={[
                { key:"cases",    label:"Active Cases",  color:"#3b82f6" },
                { key:"resolved", label:"Resolved",      color:"#10b981" },
              ]} />
          </div>
          <div className="rounded-xl border border-border bg-card p-5">
            <SectionTitle title="Avg. Days per Officer" sub="Investigation time efficiency" />
            <div className="space-y-3 mt-2">
              {OFFICER_PERF.map(o => (
                <div key={o.name} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-foreground font-medium truncate max-w-[130px]">{o.name}</span>
                    <span className={cn("font-bold", o.avgDays <= 16 ? "text-emerald-600" : o.avgDays <= 20 ? "text-amber-600" : "text-red-500")}>
                      {o.avgDays}d
                    </span>
                  </div>
                  <ProgressBar value={100 - ((o.avgDays - 14) / 10) * 100}
                    color={o.avgDays <= 16 ? "success" : o.avgDays <= 20 ? "warning" : "danger"} size="xs" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Row 4: Department cases + Readiness distribution + SLA ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="rounded-xl border border-border bg-card p-5">
            <SectionTitle title="Cases by Department" sub="Investigation responsibility distribution" />
            <BarChart data={DEPT_CASES} xKey="dept" height={200}
              series={[{ key:"cases", label:"Cases", color:"#7c3aed" }]} />
          </div>
          <div className="rounded-xl border border-border bg-card p-5">
            <SectionTitle title="Investigation Readiness" sub="Court readiness distribution" />
            <PieChart data={READINESS_DIST} donut height={200} legend />
          </div>
          <div className="rounded-xl border border-border bg-card p-5">
            <SectionTitle title="SLA Compliance Overview" sub="Target: 90% compliance" />
            <div className="space-y-4 mt-2">
              {[
                { label:"Medical Exam (72hr)",  pct:62, color:"danger"  as const },
                { label:"FIR Registration (24hr)",pct:91,color:"success" as const },
                { label:"Victim Statement (48hr)",pct:78,color:"warning" as const },
                { label:"FSL Submission (7d)",   pct:83, color:"warning" as const },
                { label:"Charge Sheet (60d)",    pct:94, color:"success" as const },
                { label:"Overall SLA",           pct:78, color:"warning" as const },
              ].map(item => (
                <div key={item.label} className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">{item.label}</span>
                    <span className={cn("font-bold", item.pct >= 90 ? "text-emerald-600" : item.pct >= 70 ? "text-amber-600" : "text-red-500")}>{item.pct}%</span>
                  </div>
                  <ProgressBar value={item.pct} color={item.color} size="xs" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Row 5: Recent alerts strip ── */}
        <div className="rounded-xl border border-border bg-card p-5">
          <SectionTitle title="Recent High-Priority Cases" sub="Requiring immediate attention" />
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  {["Case #","Crime Type","Stage","Risk","Priority","Status","Officer","Updated"].map(h => (
                    <th key={h} className="px-4 py-2.5 text-left text-2xs font-semibold uppercase tracking-wider text-muted-foreground whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {CASES.filter(c => c.priority === "critical" || c.status === "escalated").slice(0,6).map(c => (
                  <tr key={c.id} className="border-b border-border last:border-0 hover:bg-muted/40 transition-colors">
                    <td className="px-4 py-3 text-xs font-mono font-semibold text-[hsl(var(--primary))] whitespace-nowrap">{c.caseNumber.split("/").pop()}</td>
                    <td className="px-4 py-3 text-xs text-foreground whitespace-nowrap">{c.crimeType.replace("_"," ")}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">{c.currentStage}</td>
                    <td className="px-4 py-3"><StatusBadge variant="danger" size="xs">Critical</StatusBadge></td>
                    <td className="px-4 py-3"><StatusBadge variant="danger" size="xs" dot>{c.priority}</StatusBadge></td>
                    <td className="px-4 py-3"><StatusBadge variant={c.status==="escalated"?"danger":"warning"} size="xs" dot>{c.status.replace("_"," ")}</StatusBadge></td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2"><Avatar name={c.assignedOfficer} size="xs" /><span className="text-xs whitespace-nowrap">{c.assignedOfficer}</span></div>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">{new Date(c.updatedAt).toLocaleDateString("en-IN")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── Row 6: Monthly line + quick stats ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="rounded-xl border border-border bg-card p-5">
            <SectionTitle title="Escalation Trends" sub="Monthly escalated cases trend" />
            <LineChart data={MONTHLY_TREND} xKey="month" height={200}
              series={[{ key:"escalated", label:"Escalated", color:"#ef4444" }]} />
          </div>
          <div className="rounded-xl border border-border bg-card p-5">
            <SectionTitle title="Key Metrics Summary" />
            <div className="grid grid-cols-2 gap-3 mt-2">
              {[
                { icon:BrainCircuit, label:"AI Analyses Run",  value:"487",  color:"text-purple-600", bg:"bg-purple-50 dark:bg-purple-950/40" },
                { icon:Shield,       label:"Procedures Checked",value:"2,341",color:"text-royal-600",  bg:"bg-royal-50 dark:bg-royal-950/40"  },
                { icon:Target,       label:"Court-Ready Cases", value:"28",   color:"text-emerald-600",bg:"bg-emerald-50 dark:bg-emerald-950/40"},
                { icon:AlertTriangle,label:"Pending Stages",    value:`${KPI_STATS.pendingStages}`,color:"text-amber-600",bg:"bg-amber-50 dark:bg-amber-950/40"},
              ].map(m => (
                <div key={m.label} className="flex items-center gap-3 rounded-xl bg-muted/30 p-3.5">
                  <div className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-lg", m.bg)}>
                    <m.icon className={cn("h-4 w-4", m.color)} />
                  </div>
                  <div>
                    <p className="text-lg font-extrabold text-foreground">{m.value}</p>
                    <p className="text-2xs text-muted-foreground leading-tight">{m.label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
