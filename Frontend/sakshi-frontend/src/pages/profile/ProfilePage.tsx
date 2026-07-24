import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Edit, Phone, Mail, MapPin, Shield, FolderOpen,
  CheckCircle2, Clock, AlertTriangle, Activity,
} from "lucide-react";
import { DashboardLayout }  from "@/components/layout/DashboardLayout";
import { Avatar }           from "@/components/ui/feedback/Avatar";
import { StatusBadge }      from "@/components/ui/feedback/StatusBadge";
import { ProgressBar }      from "@/components/ui/feedback/ProgressBar";
import { cn }               from "@/lib/utils";
import { CASES }            from "@/data/cases.data";
import { OFFICERS }         from "@/data/officers.data";
import { ROUTES }           from "@/router/routes";
import { formatRelativeTime } from "@/utils/format";
import { CRIME_LABEL, STATUS_BADGE, STATUS_LABEL, PRIORITY_BADGE, PRIORITY_LABEL } from "@/utils/case.utils";

// Mock "current user" — first officer
const CURRENT_OFFICER = OFFICERS[0];

const ACTIVITY_STATS = [
  { label:"Total Cases",    value:8,   icon:FolderOpen,    color:"text-royal-600",   bg:"bg-royal-50  dark:bg-royal-950/40"  },
  { label:"Completed",      value:5,   icon:CheckCircle2,  color:"text-emerald-600", bg:"bg-emerald-50 dark:bg-emerald-950/40"},
  { label:"In Progress",    value:2,   icon:Clock,         color:"text-amber-600",   bg:"bg-amber-50   dark:bg-amber-950/40"  },
  { label:"Escalated",      value:1,   icon:AlertTriangle, color:"text-red-600",     bg:"bg-red-50     dark:bg-red-950/40"    },
];

const RECENT_ACTIVITY = [
  { action:"Uploaded Medical Examination Report",  case:"001842", time:new Date(Date.now()-3600000*2)  },
  { action:"Completed FIR Registration",           case:"001832", time:new Date(Date.now()-3600000*6)  },
  { action:"Updated Case Remarks",                 case:"001820", time:new Date(Date.now()-86400000)   },
  { action:"Workflow stage marked complete",        case:"001842", time:new Date(Date.now()-86400000*2) },
  { action:"Officer assignment accepted",          case:"001830", time:new Date(Date.now()-86400000*3) },
];

export default function ProfilePage() {
  const navigate = useNavigate();
  const myCases  = CASES.filter(c => c.assignedOfficerId === CURRENT_OFFICER.id);
  const completion = Math.round((myCases.filter(c => c.status==="completed"||c.status==="closed").length / Math.max(myCases.length, 1)) * 100);

  return (
    <DashboardLayout>
      <div className="max-w-5xl space-y-5">
        {/* ── Profile header ── */}
        <motion.div initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }}
          className="rounded-2xl border border-border bg-card overflow-hidden">
          {/* Banner */}
          <div className="h-24 bg-gradient-to-r from-navy-800 to-royal-700 relative">
            <div className="absolute inset-0 opacity-10"
              style={{ backgroundImage:"linear-gradient(45deg, #ffffff 25%, transparent 25%),linear-gradient(-45deg, #ffffff 25%, transparent 25%)", backgroundSize:"20px 20px" }} />
          </div>
          {/* Info */}
          <div className="px-6 pb-5">
            <div className="flex flex-wrap items-end justify-between gap-4 -mt-10">
              <div className="flex items-end gap-4">
                <div className="ring-4 ring-card rounded-2xl">
                  <Avatar name={CURRENT_OFFICER.name} size="2xl" online />
                </div>
                <div className="pb-1">
                  <h1 className="text-xl font-extrabold text-foreground">{CURRENT_OFFICER.name}</h1>
                  <p className="text-sm text-muted-foreground">{CURRENT_OFFICER.designation}</p>
                  <div className="flex flex-wrap items-center gap-2 mt-1.5">
                    <StatusBadge variant="primary" size="xs" dot className="capitalize">{CURRENT_OFFICER.department}</StatusBadge>
                    <StatusBadge variant="success" size="xs" dot>Active</StatusBadge>
                    <span className="text-2xs text-muted-foreground font-mono">{CURRENT_OFFICER.badge}</span>
                  </div>
                </div>
              </div>
              <button onClick={() => navigate(ROUTES.SETTINGS)}
                className="flex items-center gap-2 rounded-xl border border-border bg-card hover:bg-muted px-4 py-2 text-sm font-medium transition-colors mb-1">
                <Edit className="h-4 w-4" /> Edit Profile
              </button>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* ── Left column ── */}
          <div className="space-y-4">
            {/* Contact */}
            <motion.div initial={{ opacity:0, x:-8 }} animate={{ opacity:1, x:0 }} transition={{ delay:0.1 }}
              className="rounded-xl border border-border bg-card p-5">
              <p className="text-sm font-semibold text-foreground mb-4">Contact Information</p>
              <div className="space-y-3">
                {[
                  { icon:Mail,   value:CURRENT_OFFICER.email   },
                  { icon:Phone,  value:CURRENT_OFFICER.phone   },
                  { icon:MapPin, value:CURRENT_OFFICER.station },
                  { icon:Shield, value:`Badge: ${CURRENT_OFFICER.badge}` },
                  { icon:Shield, value:"Department: Police" },
                ].map((item,i) => (
                  <div key={i} className="flex items-start gap-3">
                    <item.icon className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                    <span className="text-sm text-foreground break-all">{item.value}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Performance */}
            <motion.div initial={{ opacity:0, x:-8 }} animate={{ opacity:1, x:0 }} transition={{ delay:0.15 }}
              className="rounded-xl border border-border bg-card p-5">
              <p className="text-sm font-semibold text-foreground mb-4">Performance</p>
              <div className="space-y-3">
                {[
                  { label:"Case Completion",    value:completion,  color:"primary" as const },
                  { label:"SLA Compliance",     value:82,          color:"success" as const },
                  { label:"On-time Submissions",value:76,          color:"warning" as const },
                  { label:"Document Accuracy",  value:94,          color:"success" as const },
                ].map(m => (
                  <div key={m.label} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">{m.label}</span>
                      <span className={cn("font-bold", m.value >= 80 ? "text-emerald-600" : m.value >= 60 ? "text-amber-600" : "text-red-500")}>{m.value}%</span>
                    </div>
                    <ProgressBar value={m.value} color={m.color} size="xs" />
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* ── Right column ── */}
          <div className="lg:col-span-2 space-y-4">
            {/* Activity stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {ACTIVITY_STATS.map((s, i) => (
                <motion.div key={s.label} initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.05*i }}
                  className="rounded-xl border border-border bg-card p-4 text-center">
                  <div className={cn("flex h-9 w-9 mx-auto items-center justify-center rounded-xl mb-2", s.bg)}>
                    <s.icon className={cn("h-4 w-4", s.color)} />
                  </div>
                  <p className="text-2xl font-extrabold text-foreground">{s.value}</p>
                  <p className="text-2xs text-muted-foreground">{s.label}</p>
                </motion.div>
              ))}
            </div>

            {/* Assigned cases */}
            <motion.div initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.2 }}
              className="rounded-xl border border-border bg-card overflow-hidden">
              <div className="flex items-center justify-between border-b border-border px-5 py-3.5">
                <p className="text-sm font-semibold text-foreground">Assigned Cases</p>
                <span className="text-xs text-muted-foreground">{myCases.length} cases</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border bg-muted/30">
                      <th className="px-5 py-2.5 text-left text-2xs font-semibold uppercase tracking-wider text-muted-foreground">Case #</th>
                      <th className="px-3 py-2.5 text-left text-2xs font-semibold uppercase tracking-wider text-muted-foreground">Crime Type</th>
                      <th className="px-3 py-2.5 text-left text-2xs font-semibold uppercase tracking-wider text-muted-foreground">Stage</th>
                      <th className="px-3 py-2.5 text-left text-2xs font-semibold uppercase tracking-wider text-muted-foreground">Priority</th>
                      <th className="px-3 py-2.5 text-left text-2xs font-semibold uppercase tracking-wider text-muted-foreground">Status</th>
                      <th className="px-3 py-2.5 text-left text-2xs font-semibold uppercase tracking-wider text-muted-foreground">Updated</th>
                    </tr>
                  </thead>
                  <tbody>
                    {myCases.length === 0 ? (
                      <tr><td colSpan={6} className="py-8 text-center text-sm text-muted-foreground">No cases assigned.</td></tr>
                    ) : myCases.map((c, i) => (
                      <motion.tr key={c.id} initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.04*i }}
                        onClick={() => navigate(`/cases/${c.id}`)}
                        className="border-b border-border last:border-0 hover:bg-muted/40 transition-colors cursor-pointer">
                        <td className="px-5 py-3"><p className="text-xs font-mono font-semibold text-[hsl(var(--primary))]">{c.caseNumber.split("/").pop()}</p></td>
                        <td className="px-3 py-3 text-xs text-foreground whitespace-nowrap">{CRIME_LABEL[c.crimeType]}</td>
                        <td className="px-3 py-3">
                          <div className="space-y-0.5">
                            <div className="w-14 h-1.5 rounded-full bg-muted overflow-hidden">
                              <div className="h-full rounded-full bg-[hsl(var(--primary))]" style={{ width:`${(c.currentStageOrder/c.totalStages)*100}%` }} />
                            </div>
                            <p className="text-2xs text-muted-foreground">{c.currentStageOrder}/{c.totalStages}</p>
                          </div>
                        </td>
                        <td className="px-3 py-3"><StatusBadge variant={PRIORITY_BADGE[c.priority]} size="xs">{PRIORITY_LABEL[c.priority]}</StatusBadge></td>
                        <td className="px-3 py-3"><StatusBadge variant={STATUS_BADGE[c.status]} size="xs" dot>{STATUS_LABEL[c.status]}</StatusBadge></td>
                        <td className="px-3 py-3 text-xs text-muted-foreground whitespace-nowrap">{formatRelativeTime(c.updatedAt)}</td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>

            {/* Recent activity */}
            <motion.div initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.25 }}
              className="rounded-xl border border-border bg-card p-5">
              <p className="text-sm font-semibold text-foreground mb-4">Recent Activity</p>
              <div className="space-y-3">
                {RECENT_ACTIVITY.map((item, i) => (
                  <motion.div key={i} initial={{ opacity:0, x:-8 }} animate={{ opacity:1, x:0 }} transition={{ delay:0.05*i }}
                    className="flex items-start gap-3">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-muted mt-0.5">
                      <Activity className="h-3.5 w-3.5 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-foreground">{item.action}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-2xs font-mono text-[hsl(var(--primary))]">#{item.case}</span>
                        <span className="text-2xs text-muted-foreground">·</span>
                        <span className="text-2xs text-muted-foreground">{formatRelativeTime(item.time)}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
