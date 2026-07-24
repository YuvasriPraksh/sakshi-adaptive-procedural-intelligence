import { useState } from "react";
import { Bell, Search, Sun, Moon, Monitor, Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/hooks/useTheme";
import { useNotifications } from "@/context/NotificationContext";
import { useUser } from "@/context/UserContext";
import { useAuth } from "@/context/AuthContext";
import { Button, IconButton } from "@/components/ui/buttons";
import { Avatar } from "@/components/ui/feedback/Avatar";
import { Tooltip } from "@/components/ui/feedback/Tooltip";
import { SearchBox } from "@/components/ui/forms/SearchBox";
import { NotificationPanel } from "./NotificationPanel";
import { UserProfileDropdown } from "./UserProfileDropdown";

export interface TopNavProps {
  onMobileMenuToggle?: () => void;
  className?:          string;
}

const themeIcons = { light: Sun, dark: Moon, system: Monitor } as const;

export function TopNav({ onMobileMenuToggle, className }: TopNavProps) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const { unreadCount }                    = useNotifications();
  const { currentUser }                    = useUser();
  const { user }                           = useAuth();

  const [searchOpen,      setSearchOpen]      = useState(false);
  const [searchQuery,     setSearchQuery]      = useState("");
  const [notifOpen,       setNotifOpen]       = useState(false);
  const [profileOpen,     setProfileOpen]     = useState(false);

  const ThemeIcon = themeIcons[theme];
  const nextTheme = resolvedTheme === "dark" ? "light" : "dark";
  const displayUser = currentUser ?? user;

  return (
    <header
      className={cn(
        "h-[60px] flex items-center gap-3 px-4 border-b border-border bg-card/80 backdrop-blur-sm",
        className,
      )}
    >
      {/* Mobile menu */}
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={onMobileMenuToggle}
        className="lg:hidden"
        aria-label="Toggle navigation menu"
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* Breadcrumb slot — filled by each page */}
      <div id="topnav-breadcrumb" className="flex-1 hidden sm:block" />

      {/* Search */}
      <div className={cn("transition-all duration-200", searchOpen ? "w-64" : "w-auto")}>
        {searchOpen ? (
          <SearchBox
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            onClear={() => { setSearchQuery(""); setSearchOpen(false); }}
            placeholder="Search cases, docs…"
            inputSize="sm"
            autoFocus
            onBlur={() => !searchQuery && setSearchOpen(false)}
          />
        ) : (
          <Tooltip content="Search" side="bottom">
            <IconButton variant="ghost" onClick={() => setSearchOpen(true)} aria-label="Open search">
              <Search className="h-4 w-4" />
            </IconButton>
          </Tooltip>
        )}
      </div>

      {/* Theme toggle */}
      <Tooltip content={`Switch to ${nextTheme} mode`} side="bottom">
        <IconButton
          variant="ghost"
          onClick={() => setTheme(nextTheme)}
          aria-label={`Switch to ${nextTheme} mode`}
        >
          <ThemeIcon className="h-4 w-4" />
        </IconButton>
      </Tooltip>

      {/* Notifications */}
      <div className="relative">
        <Tooltip content="Notifications" side="bottom">
          <div className="relative">
            <IconButton
              variant="ghost"
              onClick={() => { setNotifOpen(v => !v); setProfileOpen(false); }}
              aria-label="Notifications"
              aria-expanded={notifOpen}
            >
              <Bell className="h-4 w-4" />
            </IconButton>
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-danger-500 text-white text-2xs font-bold pointer-events-none">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </div>
        </Tooltip>
        <NotificationPanel open={notifOpen} onClose={() => setNotifOpen(false)} />
      </div>

      {/* Divider */}
      <div className="h-5 w-px bg-border" />

      {/* User avatar */}
      <div className="relative">
        <button
          onClick={() => { setProfileOpen(v => !v); setNotifOpen(false); }}
          className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-muted transition-colors"
          aria-label="User menu"
          aria-expanded={profileOpen}
        >
          <Avatar name={displayUser?.name ?? "User"} src={displayUser?.avatarUrl} size="sm" />
          {displayUser && (
            <div className="hidden md:block text-left min-w-0">
              <p className="text-xs font-semibold text-foreground truncate max-w-[120px]">{displayUser.name}</p>
              <p className="text-2xs text-muted-foreground capitalize">{displayUser.role}</p>
            </div>
          )}
        </button>
        <UserProfileDropdown open={profileOpen} onClose={() => setProfileOpen(false)} />
      </div>
    </header>
  );
}
