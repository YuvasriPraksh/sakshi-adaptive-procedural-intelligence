import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell, CheckCheck, Trash2, Filter, ChevronDown,
  FolderOpen, AlertTriangle, Clock, BrainCircuit,
  GitBranch, FileText, ArrowUpCircle, Info,
  ExternalLink,
} from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatusBadge } from "@/components/ui/feedback/StatusBadge";
import { cn } from "@/lib/utils";
import { formatRelativeTime } from "@/utils/format";
import { APP_NOTIFICATIONS } from "@/data/ai.data";
import type { AppNotification } from "@/types/ai.types";

const TYPE_CONFIG = {
  case_assigned:     { icon: FolderOpen,     color: "text-royal-600",   bg: "bg-royal-50   dark:bg-royal-950/30",   label: "Case Assigned"     },
  workflow_updated:  { icon: GitBranch,      color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-950/30", label: "Workflow Update"   },
  high_risk:         { icon: AlertTriangle,  color: "text-red-600",     bg: "bg-red-50     dark:bg-red-950/30",     label: "Risk Alert"        },
  deadline:          { icon: Clock,          color: "text-amber-600",   bg: "bg-amber-50   dark:bg-amber-950/30",   label: "Deadline"          },
  ai_recommendation: { icon: BrainCircuit,   color: "text-purple-600",  bg: "bg-purple-50  dark:bg-purple-950/30",  label: "AI Insight"        },
  document_uploaded: { icon: FileText,       color: "text-blue-600",    bg: "bg-blue-50    dark:bg-blue-950/30",    label: "Document"          },
  escalation:        { icon: ArrowUpCircle,  color: "text-red-600",     bg: "bg-red-50     dark:bg-red-950/30",     label: "Escalation"        },
  general:           { icon: Info,           color: "text-slate-600",   bg: "bg-slate-50   dark:bg-slate-800/50",   label: "General"           },
} as const;

const PRIORITY_BADGE = {
  critical: "danger"  as const,
  high:     "warning" as const,
  medium:   "primary" as const,
  low:      "muted"   as const,
};

const FILTER_TYPES = [
  { value: "",                label: "All Types"       },
  { value: "high_risk",       label: "Risk Alerts"     },
  { value: "deadline",        label: "Deadlines"       },
  { value: "case_assigned",   label: "Case Assigned"   },
  { value: "workflow_updated",label: "Workflow"        },
  { value: "ai_recommendation",label:"AI Insights"     },
  { value: "escalation",      label: "Escalations"     },
  { value: "document_uploaded",label:"Documents"       },
];

export default function NotificationsPage() {
  const navigate = useNavigate();
  const [notifs, setNotifs] = useState<AppNotification[]>(APP_NOTIFICATIONS);
  const [filterRead, setFilterRead] = useState<"all"|"unread"|"read">("all");
  const [filterType, setFilterType] = useState("");

  const filtered = notifs.filter(n => {
    if (filterRead === "unread" && n.read)        return false;
    if (filterRead === "read"   && !n.read)       return false;
    if (filterType && n.type !== filterType)      return false;
    return true;
  });

  const unreadCount = notifs.filter(n => !n.read).length;

  const markRead  = (id: string) => setNotifs(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  const markAllRead = ()          => setNotifs(prev => prev.map(n => ({ ...n, read: true })));
  const deleteNotif = (id: string) => setNotifs(prev => prev.filter(n => n.id !== id));
  const clearAll  = ()             => setNotifs([]);

  return (
    <DashboardLayout>
      <div className="space-y-5 max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Notification Center</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {unreadCount > 0 ? `${unreadCount} unread notifications` : "All caught up!"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button onClick={markAllRead}
                className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-xs font-medium text-muted-foreground hover:bg-muted transition-colors">
                <CheckCheck className="h-3.5 w-3.5" /> Mark all read
              </button>
            )}
            {notifs.length > 0 && (
              <button onClick={clearAll}
                className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-100 transition-colors dark:border-red-900 dark:bg-red-950/20">
                <Trash2 className="h-3.5 w-3.5" /> Clear all
              </button>
            )}
          </div>
        </div>

        {/* Stats strip */}
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: "Total",    value: notifs.length,                      color: "text-foreground" },
            { label: "Unread",   value: notifs.filter(n=>!n.read).length,   color: "text-royal-600" },
            { label: "Critical", value: notifs.filter(n=>n.priority==="critical").length, color: "text-red-600" },
            { label: "AI Alerts",value: notifs.filter(n=>n.type==="ai_recommendation"||n.type==="high_risk").length, color: "text-purple-600" },
          ].map(s => (
            <div key={s.label} className="rounded-xl border border-border bg-card px-4 py-3 text-center">
              <p className={cn("text-2xl font-bold", s.color)}>{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Filter bar */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center rounded-lg border border-border overflow-hidden text-xs">
            {(["all","unread","read"] as const).map(v => (
              <button key={v} onClick={() => setFilterRead(v)}
                className={cn("px-4 py-2 font-medium transition-colors capitalize",
                  filterRead === v ? "bg-[hsl(var(--primary))] text-white" : "bg-card text-muted-foreground hover:bg-muted")}>
                {v}
              </button>
            ))}
          </div>
          <div className="relative">
            <select value={filterType} onChange={e => setFilterType(e.target.value)}
              className="h-9 rounded-lg border border-border bg-card pl-8 pr-3 text-xs focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))] appearance-none dark:bg-slate-900 dark:text-white">
              {FILTER_TYPES.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
            </select>
            <Filter className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
          </div>
          <span className="text-xs text-muted-foreground">{filtered.length} notifications</span>
        </div>

        {/* Notification list */}
        <div className="space-y-2">
          <AnimatePresence mode="popLayout">
            {filtered.length === 0 ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="rounded-xl border border-border bg-card py-16 text-center">
                <Bell className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-sm font-medium text-foreground">No notifications</p>
                <p className="text-xs text-muted-foreground mt-1">You're all caught up!</p>
              </motion.div>
            ) : (
              filtered.map((notif, i) => (
                <NotificationItem key={notif.id} notif={notif} index={i}
                  onMarkRead={markRead} onDelete={deleteNotif}
                  onAction={url => { markRead(notif.id); navigate(url); }} />
              ))
            )}
          </AnimatePresence>
        </div>
      </div>
    </DashboardLayout>
  );
}

// ─── Single notification item ──────────────────────────────────────────────────
function NotificationItem({
  notif, index, onMarkRead, onDelete, onAction,
}: {
  notif:       AppNotification;
  index:       number;
  onMarkRead:  (id: string) => void;
  onDelete:    (id: string) => void;
  onAction:    (url: string) => void;
}) {
  const config = TYPE_CONFIG[notif.type];
  const IconComp = config.icon;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ delay: index * 0.03 }}
      className={cn(
        "rounded-xl border bg-card p-4 flex items-start gap-4 transition-all group",
        !notif.read ? "border-[hsl(var(--primary))]/20 bg-[hsl(var(--primary))]/[0.02]" : "border-border",
        notif.priority === "critical" && !notif.read && "border-red-200 bg-red-50/30 dark:border-red-900/50 dark:bg-red-950/10",
      )}
    >
      {/* Icon */}
      <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border", config.bg)}>
        <IconComp className={cn("h-5 w-5", config.color)} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2 flex-wrap">
            <p className={cn("text-sm font-semibold text-foreground", !notif.read && "text-foreground")}>{notif.title}</p>
            <StatusBadge variant={PRIORITY_BADGE[notif.priority]} size="xs" dot>
              {notif.priority.charAt(0).toUpperCase() + notif.priority.slice(1)}
            </StatusBadge>
            {!notif.read && (
              <span className="h-1.5 w-1.5 rounded-full bg-[hsl(var(--primary))] shrink-0" />
            )}
          </div>
          <span className="text-2xs text-muted-foreground shrink-0">{formatRelativeTime(notif.createdAt)}</span>
        </div>

        <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{notif.message}</p>

        {notif.caseNumber && (
          <p className="mt-1.5 text-2xs font-mono text-[hsl(var(--primary))]">{notif.caseNumber}</p>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2 mt-2.5">
          {notif.actionUrl && (
            <button onClick={() => onAction(notif.actionUrl!)}
              className="inline-flex items-center gap-1.5 rounded-md bg-[hsl(var(--primary))]/10 hover:bg-[hsl(var(--primary))]/20 px-3 py-1 text-2xs font-semibold text-[hsl(var(--primary))] transition-colors">
              <ExternalLink className="h-3 w-3" /> View
            </button>
          )}
          {!notif.read && (
            <button onClick={() => onMarkRead(notif.id)}
              className="inline-flex items-center gap-1.5 rounded-md bg-muted hover:bg-muted/80 px-3 py-1 text-2xs font-medium text-muted-foreground hover:text-foreground transition-colors">
              <CheckCheck className="h-3 w-3" /> Mark read
            </button>
          )}
          <button onClick={() => onDelete(notif.id)}
            className="ml-auto inline-flex items-center gap-1.5 rounded-md p-1 text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors opacity-0 group-hover:opacity-100">
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
