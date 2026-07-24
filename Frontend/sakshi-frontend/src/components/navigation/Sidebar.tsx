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

// ─── Nav data ─────────────────────────────────────────────────────────────────
export const MAIN_NAV: NavItem[] = [
  { label: "Dashboard",    href: ROUTES.DASHBOARD,          icon: "dashboard" },
  { label: "Cases",        href: ROUTES.CASES,              icon: "cases" },
  { label: "Timeline",     href: ROUTES.TIMELINE,           icon: "timeline" },
  { label: "Proc. Graph",  href: ROUTES.GRAPH,              icon: "graph" },
  { label: "AI Assistant", href: ROUTES.AI_ASSISTANT,       icon: "ai" },
  { label: "Analytics",    href: ROUTES.ANALYTICS,          icon: "analytics" },
  { label: "Documents",    href: ROUTES.DOCUMENTS,          icon: "documents" },
  { label: "Audit Trail",  href: ROUTES.AUDIT,              icon: "audit" },
  { label: "Notifications",href: ROUTES.NOTIFICATIONS,      icon: "notifications", badge: true },
];

export const SETTINGS_NAV: NavItem[] = [
  { label: "Settings",     href: ROUTES.SETTINGS,           icon: "settings" },
  { label: "Profile",      href: ROUTES.PROFILE,            icon: "supervisor" },
];

// ─── Single item ──────────────────────────────────────────────────────────────
interface NavItemProps {
  item:       NavItem;
  collapsed:  boolean;
  unread?:    number;
}

function SidebarItem({ item, collapsed, unread }: NavItemProps) {
  const IconComp = ICON_MAP[item.icon] ?? ICON_MAP.dashboard;
  const location = useLocation();
  const isActive = location.pathname === item.href ||
    (item.href !== "/" && location.pathname.startsWith(item.href));

  const inner = (
    <NavLink
      to={item.href}
      className={cn(
        "nav-item group",
        isActive ? "nav-item-active" : "nav-item-inactive",
        collapsed && "justify-center px-0",
      )}
      aria-label={item.label}
    >
      <IconComp className={cn("h-[18px] w-[18px] shrink-0", isActive ? "text-white" : "text-sidebar-foreground/70 group-hover:text-sidebar-foreground")} />
      {!collapsed && (
        <>
          <span className="flex-1 truncate text-xs">{item.label}</span>
          {item.badge && unread !== undefined && unread > 0 && (
            <StatusBadge variant="danger" size="xs">{unread > 99 ? "99+" : unread}</StatusBadge>
          )}
        </>
      )}
    </NavLink>
  );

  return collapsed ? (
    <Tooltip content={item.label} side="right">{inner}</Tooltip>
  ) : inner;
}

// ─── Group ────────────────────────────────────────────────────────────────────
interface NavGroupProps {
  label:      string;
  children:   ReactNode;
  collapsed:  boolean;
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
            "flex w-full items-center justify-between px-3 py-1.5",
            collapsible && "cursor-pointer hover:text-sidebar-foreground",
          )}
          aria-expanded={collapsible ? open : undefined}
        >
          <span className="text-2xs font-semibold uppercase tracking-widest text-sidebar-foreground/40">
            {label}
          </span>
          {collapsible && (
            <ChevronDown className={cn("h-3 w-3 text-sidebar-foreground/40 transition-transform", !open && "-rotate-90")} />
          )}
        </button>
      )}
      <AnimatePresence initial={false}>
        {(!collapsible || open) && (
          <motion.div
            initial={collapsible ? { height: 0, opacity: 0 } : false}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="overflow-hidden space-y-0.5"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Main Sidebar ─────────────────────────────────────────────────────────────
export interface SidebarProps {
  unreadNotifications?: number;
}

export function Sidebar({ unreadNotifications = 0 }: SidebarProps) {
  const { preferences, toggleSidebar } = useUser();
  const collapsed = preferences.sidebarCollapsed;

  return (
    <motion.aside
      animate={{ width: collapsed ? 64 : 260 }}
      transition={{ duration: 0.2, ease: "easeInOut" }}
      className="flex flex-col h-full bg-[hsl(var(--sidebar-bg))] border-r border-[hsl(var(--sidebar-border))] overflow-hidden shrink-0"
      aria-label="Main navigation"
    >
      {/* Logo */}
      <div className={cn(
        "flex items-center border-b border-[hsl(var(--sidebar-border))]",
        collapsed ? "justify-center h-[60px]" : "px-4 h-[60px] gap-3",
      )}>
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[hsl(var(--primary))] text-white font-bold text-sm select-none">
          S
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <p className="text-sm font-bold text-white truncate">SAKSHI</p>
            <p className="text-2xs text-sidebar-foreground/50 truncate">Intelligence Platform</p>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-2 py-4 space-y-4 no-scrollbar">
        <NavGroup label="Main" collapsed={collapsed}>
          {MAIN_NAV.map(item => (
            <SidebarItem key={item.href} item={item} collapsed={collapsed} unread={item.badge ? unreadNotifications : undefined} />
          ))}
        </NavGroup>

        <div className="divider !my-2 !border-sidebar-border/60" />

        <NavGroup label="Account" collapsed={collapsed}>
          {SETTINGS_NAV.map(item => (
            <SidebarItem key={item.href} item={item} collapsed={collapsed} />
          ))}
        </NavGroup>
      </nav>

      {/* Collapse toggle */}
      <div className="border-t border-[hsl(var(--sidebar-border))] p-2">
        <Tooltip content={collapsed ? "Expand sidebar" : "Collapse sidebar"} side="right">
          <button
            onClick={toggleSidebar}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className={cn(
              "flex w-full items-center rounded-md px-2 py-2 text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/60 transition-colors",
              collapsed ? "justify-center" : "gap-2",
            )}
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : (
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
