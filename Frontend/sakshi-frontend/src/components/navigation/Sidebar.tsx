import { useState, type ReactNode } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUser } from "@/context/UserContext";
import { Tooltip } from "@/components/ui/feedback/Tooltip";
import { StatusBadge } from "@/components/ui/feedback/StatusBadge";
import { ICON_MAP } from "@/constants/icons";
import { ROUTES } from "@/router/routes";
import type { NavItem } from "@/types/navigation.types";

// ─── Navigation items ──────────────────────────────────────────────────────────
export const MAIN_NAV: NavItem[] = [
  { label: "Dashboard",     href: ROUTES.DASHBOARD,      icon: "dashboard"     },
  { label: "Cases",         href: ROUTES.CASES,          icon: "cases"         },
  { label: "Timeline",      href: ROUTES.TIMELINE,       icon: "timeline"      },
  { label: "Proc. Graph",   href: ROUTES.GRAPH,          icon: "graph"         },
  { label: "AI Assistant",  href: ROUTES.AI_ASSISTANT,   icon: "ai"            },
  { label: "Analytics",     href: ROUTES.ANALYTICS,      icon: "analytics"     },
  { label: "Reports",       href: ROUTES.REPORTS,        icon: "reports"       },
  { label: "Documents",     href: ROUTES.DOCUMENTS,      icon: "documents"     },
  { label: "Audit Trail",   href: ROUTES.AUDIT,          icon: "audit"         },
  { label: "Evidence",      href: ROUTES.EVIDENCE,        icon: "evidence"      },
  { label: "Notifications", href: ROUTES.NOTIFICATIONS,   icon: "notifications", badge: true },
];

export const SETTINGS_NAV: NavItem[] = [
  { label: "Settings", href: ROUTES.SETTINGS, icon: "settings"    },
  { label: "Profile",  href: ROUTES.PROFILE,  icon: "supervisor"  },
];

// ─── Single nav item ───────────────────────────────────────────────────────────
interface SidebarItemProps {
  item:     NavItem;
  collapsed: boolean;
  unread?:  number;
}

function SidebarItem({ item, collapsed, unread }: SidebarItemProps) {
  const IconComp = ICON_MAP[item.icon] ?? ICON_MAP.dashboard;
  const location = useLocation();
  const isActive = location.pathname === item.href ||
    (item.href !== "/" && location.pathname.startsWith(item.href));

  const inner = (
    <NavLink
      to={item.href}
      className={cn(
        "nav-item group relative",
        isActive ? "nav-item-active" : "nav-item-inactive",
        collapsed && "justify-center px-0",
      )}
      aria-label={item.label}
      aria-current={isActive ? "page" : undefined}
    >
      {/* Active indicator bar */}
      {isActive && (
        <motion.span
          layoutId="active-nav-bar"
          className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 rounded-r-full bg-sky-400 shadow-sm shadow-sky-400/50"
          transition={{ duration: 0.2 }}
        />
      )}

      <IconComp
        className={cn(
          "h-[18px] w-[18px] shrink-0 transition-colors",
          isActive
            ? "text-white"
            : "text-sidebar-foreground/60 group-hover:text-sidebar-foreground",
        )}
      />

      {!collapsed && (
        <>
          <span className="flex-1 truncate text-xs font-medium">{item.label}</span>
          {item.badge && unread !== undefined && unread > 0 && (
            <StatusBadge variant="danger" size="xs">
              {unread > 99 ? "99+" : unread}
            </StatusBadge>
          )}
        </>
      )}
    </NavLink>
  );

  return collapsed ? (
    <Tooltip content={item.label} side="right">{inner}</Tooltip>
  ) : inner;
}

// ─── Nav group ─────────────────────────────────────────────────────────────────
interface NavGroupProps {
  label:        string;
  children:     ReactNode;
  collapsed:    boolean;
  collapsible?: boolean;
}

function NavGroup({ label, children, collapsed, collapsible = false }: NavGroupProps) {
  const [open, setOpen] = useState(true);

  return (
    <div className="space-y-0.5">
      {!collapsed && (
        <button
          onClick={collapsible ? () => setOpen(v => !v) : undefined}
          className={cn(
            "flex w-full items-center justify-between px-3 py-1",
            collapsible && "cursor-pointer",
          )}
          aria-expanded={collapsible ? open : undefined}
        >
          <span className="text-2xs font-bold uppercase tracking-widest text-sidebar-foreground/35 select-none">
            {label}
          </span>
          {collapsible && (
            <ChevronDown
              className={cn(
                "h-3 w-3 text-sidebar-foreground/35 transition-transform duration-200",
                !open && "-rotate-90",
              )}
            />
          )}
        </button>
      )}

      <AnimatePresence initial={false}>
        {(!collapsible || open) && (
          <motion.div
            initial={collapsible ? { height: 0, opacity: 0 } : false}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="overflow-hidden space-y-0.5"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Main Sidebar ──────────────────────────────────────────────────────────────
export interface SidebarProps {
  unreadNotifications?: number;
}

export function Sidebar({ unreadNotifications = 0 }: SidebarProps) {
  const { preferences, toggleSidebar } = useUser();
  const collapsed = preferences.sidebarCollapsed;

  return (
    <motion.aside
      animate={{ width: collapsed ? 64 : 260 }}
      transition={{ duration: 0.22, ease: "easeInOut" }}
      className={cn(
        "flex flex-col h-full shrink-0 overflow-hidden",
        "bg-[hsl(var(--sidebar-bg))] border-r border-[hsl(var(--sidebar-border))]",
      )}
      aria-label="Main navigation"
    >
      {/* ── Logo ── */}
      <div
        className={cn(
          "flex items-center border-b border-[hsl(var(--sidebar-border))] shrink-0",
          collapsed ? "justify-center h-[60px]" : "px-4 h-[60px] gap-3",
        )}
      >
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-sky-600 border border-sky-400/30 text-white font-black text-sm select-none shadow-md shadow-sky-950/50">
          S
        </div>
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="min-w-0"
          >
            <p className="text-sm font-bold text-slate-100 leading-tight truncate tracking-tight">SAKSHI</p>
            <p className="text-2xs text-sky-400/80 font-medium truncate tracking-wide uppercase">Procedural Intelligence</p>
          </motion.div>
        )}
      </div>

      {/* ── Navigation ── */}
      <nav
        className="flex-1 overflow-y-auto overflow-x-hidden px-2 py-3 space-y-4 no-scrollbar"
        role="navigation"
        aria-label="Main menu"
      >
        <NavGroup label="Main" collapsed={collapsed}>
          {MAIN_NAV.map(item => (
            <SidebarItem
              key={item.href}
              item={item}
              collapsed={collapsed}
              unread={item.badge ? unreadNotifications : undefined}
            />
          ))}
        </NavGroup>

        <div className="mx-3 border-t border-sidebar-border/40" />

        <NavGroup label="Account" collapsed={collapsed}>
          {SETTINGS_NAV.map(item => (
            <SidebarItem key={item.href} item={item} collapsed={collapsed} />
          ))}
        </NavGroup>
      </nav>

      {/* ── Collapse toggle ── */}
      <div className="border-t border-[hsl(var(--sidebar-border))] p-2 shrink-0">
        <Tooltip content={collapsed ? "Expand sidebar" : "Collapse sidebar"} side="right">
          <button
            onClick={toggleSidebar}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className={cn(
              "flex w-full items-center rounded-md px-2 py-2",
              "text-sidebar-foreground/50 hover:text-sidebar-foreground",
              "hover:bg-sidebar-accent/50 transition-colors",
              collapsed ? "justify-center" : "gap-2",
            )}
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <>
                <ChevronLeft className="h-4 w-4" />
                <span className="text-xs">Collapse</span>
              </>
            )}
          </button>
        </Tooltip>
      </div>
    </motion.aside>
  );
}
