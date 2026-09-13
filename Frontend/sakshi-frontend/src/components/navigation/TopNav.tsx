import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, Search, Sun, Moon, Monitor, Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useTheme } from "@/hooks/useTheme";
import { useNotifications } from "@/context/NotificationContext";
import { useUser } from "@/context/UserContext";
import { useAuth } from "@/context/AuthContext";
import { Avatar } from "@/components/ui/feedback/Avatar";
import { Tooltip } from "@/components/ui/feedback/Tooltip";
import { NotificationPanel } from "./NotificationPanel";
import { UserProfileDropdown } from "./UserProfileDropdown";
import { ROUTES } from "@/router/routes";

export interface TopNavProps {
  onMobileMenuToggle?: () => void;
  className?:          string;
}

const THEME_ICONS = { light: Sun, dark: Moon, system: Monitor } as const;

export function TopNav({ onMobileMenuToggle, className }: TopNavProps) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const { unreadCount }                    = useNotifications();
  const { currentUser }                    = useUser();
  const { user }                           = useAuth();
  const navigate                           = useNavigate();

  const [searchOpen,  setSearchOpen]  = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [notifOpen,   setNotifOpen]   = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const ThemeIcon  = THEME_ICONS[theme];
  const nextTheme  = resolvedTheme === "dark" ? "light" : "dark";
  const displayUser = currentUser ?? user;

  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigate(`${ROUTES.CASES}?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery("");
    }
  };

  const closeAll = () => { setNotifOpen(false); setProfileOpen(false); };

  return (
    <header
      className={cn(
        "h-[60px] flex items-center gap-2 px-3 sm:px-4 shrink-0",
        "border-b border-slate-800/80 bg-[#0d1527]/90 backdrop-blur-md shadow-sm",
        className,
      )}
      role="banner"
    >
      {/* Mobile hamburger */}
      <button
        onClick={onMobileMenuToggle}
        className="lg:hidden flex h-8 w-8 items-center justify-center rounded-md text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
        aria-label="Toggle navigation menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Page title slot — grows to fill */}
      <div className="flex-1 min-w-0 hidden sm:block">
        <div id="topnav-breadcrumb" />
      </div>

      {/* ── Right actions ── */}
      <div className="flex items-center gap-1.5 ml-auto">

        {/* Search */}
        <AnimatePresence mode="wait">
          {searchOpen ? (
            <motion.div
              key="search-open"
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 220, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="relative overflow-hidden"
            >
              <input
                autoFocus
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter") handleSearch(); if (e.key === "Escape") { setSearchOpen(false); setSearchQuery(""); } }}
                onBlur={() => { if (!searchQuery) setSearchOpen(false); }}
                placeholder="Search cases…"
                className="w-full h-8 rounded-lg border border-slate-700/80 bg-slate-900/90 pl-3 pr-8 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                aria-label="Search"
              />
              <button onClick={() => { setSearchOpen(false); setSearchQuery(""); }}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-100">
                <X className="h-3.5 w-3.5" />
              </button>
            </motion.div>
          ) : (
            <motion.div key="search-closed" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <Tooltip content="Search cases" side="bottom">
                <button
                  onClick={() => { closeAll(); setSearchOpen(true); }}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800/70 transition-colors"
                  aria-label="Search"
                >
                  <Search className="h-4 w-4" />
                </button>
              </Tooltip>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Theme toggle */}
        <Tooltip content={`Switch to ${nextTheme} mode`} side="bottom">
          <button
            onClick={() => setTheme(nextTheme)}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800/70 transition-colors"
            aria-label={`Switch to ${nextTheme} mode`}
          >
            <ThemeIcon className="h-4 w-4" />
          </button>
        </Tooltip>

        {/* Notifications */}
        <div className="relative">
          <Tooltip content="Notifications" side="bottom">
            <div className="relative">
              <button
                onClick={() => { setNotifOpen(v => !v); setProfileOpen(false); }}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800/70 transition-colors"
                aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ""}`}
                aria-expanded={notifOpen}
                aria-haspopup="true"
              >
                <Bell className="h-4 w-4" />
              </button>
              {unreadCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }} animate={{ scale: 1 }}
                  className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-white text-2xs font-bold pointer-events-none select-none shadow-sm shadow-rose-950/80"
                >
                  {unreadCount > 9 ? "9+" : unreadCount}
                </motion.span>
              )}
            </div>
          </Tooltip>
          <NotificationPanel open={notifOpen} onClose={() => setNotifOpen(false)} />
        </div>

        {/* Separator */}
        <div className="h-5 w-px bg-slate-800 mx-1" aria-hidden />

        {/* User profile */}
        <div className="relative">
          <button
            onClick={() => { setProfileOpen(v => !v); setNotifOpen(false); }}
            className="flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 border border-transparent hover:border-slate-800 hover:bg-slate-800/60 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
            aria-label="User menu"
            aria-expanded={profileOpen}
            aria-haspopup="true"
          >
            <Avatar
              name={displayUser?.name ?? "User"}
              src={displayUser?.avatarUrl}
              size="sm"
            />
            <div className="hidden md:block text-left min-w-0">
              <p className="text-xs font-semibold text-slate-100 truncate max-w-[120px] leading-tight">
                {displayUser?.name ?? "User"}
              </p>
              <p className="text-2xs text-sky-400 font-medium capitalize leading-tight">
                {displayUser?.role ?? "officer"}
              </p>
            </div>
          </button>
          <UserProfileDropdown open={profileOpen} onClose={() => setProfileOpen(false)} />
        </div>
      </div>
    </header>
  );
}
