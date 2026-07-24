import { useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { User, Settings, LogOut, Shield, ChevronRight } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Avatar } from "@/components/ui/feedback/Avatar";
import { StatusBadge } from "@/components/ui/feedback/StatusBadge";
import { useClickOutside } from "@/hooks/useClickOutside";
import { ROUTES } from "@/router/routes";

export interface UserProfileDropdownProps {
  open:    boolean;
  onClose: () => void;
}

export function UserProfileDropdown({ open, onClose }: UserProfileDropdownProps) {
  const ref      = useRef<HTMLDivElement>(null);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  useClickOutside(ref, onClose);

  const handleLogout = () => {
    logout();
    navigate(ROUTES.LOGIN);
    onClose();
  };

  const menuItems = [
    { icon: User,    label: "My Profile",  href: ROUTES.PROFILE },
    { icon: Settings,label: "Settings",    href: ROUTES.SETTINGS },
    { icon: Shield,  label: "Audit Trail", href: ROUTES.AUDIT },
  ];

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 8, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{    opacity: 0, y: 8, scale: 0.97 }}
          transition={{ duration: 0.15 }}
          className="absolute top-full right-0 mt-2 z-50 w-64 rounded-xl border border-border bg-card shadow-xl"
        >
          {/* User info */}
          {user && (
            <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
              <Avatar name={user.name} src={user.avatarUrl} size="md" online />
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">{user.name}</p>
                <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                <StatusBadge variant="primary" size="xs" className="mt-1 capitalize">{user.role}</StatusBadge>
              </div>
            </div>
          )}

          {/* Menu */}
          <div className="py-1.5">
            {menuItems.map(item => (
              <Link
                key={item.href}
                to={item.href}
                onClick={onClose}
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-foreground hover:bg-muted transition-colors group"
              >
                <item.icon className="h-4 w-4 text-muted-foreground group-hover:text-foreground" />
                <span className="flex-1">{item.label}</span>
                <ChevronRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
            ))}
          </div>

          {/* Logout */}
          <div className="border-t border-border py-1.5">
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-danger-600 hover:bg-danger-50 dark:hover:bg-danger-950/20 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              <span>Sign out</span>
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
