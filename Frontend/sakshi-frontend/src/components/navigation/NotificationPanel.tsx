import { useRef } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCheck, BellOff, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNotifications } from "@/context/NotificationContext";
import { Button } from "@/components/ui/buttons";
import { NotificationCard } from "@/components/ui/cards/Card";
import { EmptyState } from "@/components/ui/feedback/EmptyState";
import { useClickOutside } from "@/hooks/useClickOutside";
import { ROUTES } from "@/router/routes";
import { formatRelativeTime } from "@/utils/format";

export interface NotificationPanelProps {
  open:     boolean;
  onClose:  () => void;
}

export function NotificationPanel({ open, onClose }: NotificationPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const { notifications, unreadCount, markRead, markAllRead } = useNotifications();
  useClickOutside(panelRef, onClose);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          ref={panelRef}
          initial={{ opacity: 0, y: 8, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{    opacity: 0, y: 8, scale: 0.97 }}
          transition={{ duration: 0.15 }}
          className={cn(
            "absolute top-full right-0 mt-2 z-50",
            "w-80 rounded-xl border border-border bg-card shadow-xl",
            "flex flex-col max-h-[480px]",
          )}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-foreground">Notifications</p>
              {unreadCount > 0 && (
                <p className="text-xs text-muted-foreground">{unreadCount} unread</p>
              )}
            </div>
            {unreadCount > 0 && (
              <Button variant="ghost" size="xs" onClick={markAllRead} leftIcon={<CheckCheck className="h-3 w-3" />}>
                Mark all read
              </Button>
            )}
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto divide-y divide-border">
            {notifications.length === 0 ? (
              <EmptyState
                icon={<BellOff className="h-5 w-5" />}
                title="No notifications"
                description="You're all caught up!"
                size="sm"
              />
            ) : (
              notifications.slice(0, 10).map(n => (
                <div key={n.id} className="px-3 py-2">
                  <NotificationCard
                    title={n.title}
                    message={n.message ?? ""}
                    time={formatRelativeTime(n.createdAt)}
                    read={n.read}
                    onMarkRead={() => markRead(n.id)}
                  />
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="border-t border-border px-4 py-2">
              <Link
                to={ROUTES.NOTIFICATIONS}
                onClick={onClose}
                className="flex items-center justify-center gap-1.5 text-xs font-medium text-primary hover:underline"
              >
                View all notifications <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
