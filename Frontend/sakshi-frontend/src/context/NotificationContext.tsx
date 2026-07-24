import {
  createContext,
  useCallback,
  useContext,
  useReducer,
  useRef,
  type ReactNode,
} from "react";

// ─── Types ────────────────────────────────────────────────────────────────────
export type NotificationVariant = "info" | "success" | "warning" | "error";

export interface Notification {
  id:        string;
  title:     string;
  message?:  string;
  variant:   NotificationVariant;
  duration?: number;   // ms — 0 = persistent
  read:      boolean;
  createdAt: Date;
}

export type ToastInput = Omit<Notification, "id" | "read" | "createdAt">;

// ─── State ────────────────────────────────────────────────────────────────────
interface NotificationState {
  toasts:        Notification[];
  notifications: Notification[];
  unreadCount:   number;
}

type NotifAction =
  | { type: "ADD_TOAST";           payload: Notification }
  | { type: "REMOVE_TOAST";        payload: string }
  | { type: "ADD_NOTIFICATION";    payload: Notification }
  | { type: "MARK_READ";           payload: string }
  | { type: "MARK_ALL_READ" }
  | { type: "CLEAR_NOTIFICATIONS" };

function notifReducer(state: NotificationState, action: NotifAction): NotificationState {
  switch (action.type) {
    case "ADD_TOAST":
      return { ...state, toasts: [action.payload, ...state.toasts].slice(0, 5) };
    case "REMOVE_TOAST":
      return { ...state, toasts: state.toasts.filter(t => t.id !== action.payload) };
    case "ADD_NOTIFICATION": {
      const notifications = [action.payload, ...state.notifications].slice(0, 100);
      return { ...state, notifications, unreadCount: state.unreadCount + 1 };
    }
    case "MARK_READ": {
      const notifications = state.notifications.map(n =>
        n.id === action.payload ? { ...n, read: true } : n,
      );
      const unreadCount = notifications.filter(n => !n.read).length;
      return { ...state, notifications, unreadCount };
    }
    case "MARK_ALL_READ":
      return {
        ...state,
        notifications: state.notifications.map(n => ({ ...n, read: true })),
        unreadCount:   0,
      };
    case "CLEAR_NOTIFICATIONS":
      return { ...state, notifications: [], unreadCount: 0 };
    default:
      return state;
  }
}

// ─── Context ──────────────────────────────────────────────────────────────────
interface NotificationContextValue extends NotificationState {
  toast:               (input: ToastInput) => string;
  dismiss:             (id: string) => void;
  notify:              (input: ToastInput) => void;
  markRead:            (id: string) => void;
  markAllRead:         () => void;
  clearNotifications:  () => void;
}

const NotificationContext = createContext<NotificationContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────
export function NotificationProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(notifReducer, {
    toasts: [], notifications: [], unreadCount: 0,
  });
  const idRef = useRef(0);

  const makeId = () => `notif_${Date.now()}_${++idRef.current}`;

  const toast = useCallback((input: ToastInput): string => {
    const id = makeId();
    const notif: Notification = { ...input, id, read: true, createdAt: new Date() };
    dispatch({ type: "ADD_TOAST", payload: notif });
    const duration = input.duration ?? 4000;
    if (duration > 0) {
      setTimeout(() => dispatch({ type: "REMOVE_TOAST", payload: id }), duration);
    }
    return id;
  }, []);

  const dismiss             = useCallback((id: string) => dispatch({ type: "REMOVE_TOAST",        payload: id }), []);
  const markRead            = useCallback((id: string) => dispatch({ type: "MARK_READ",            payload: id }), []);
  const markAllRead         = useCallback(()            => dispatch({ type: "MARK_ALL_READ"  }), []);
  const clearNotifications  = useCallback(()            => dispatch({ type: "CLEAR_NOTIFICATIONS" }), []);

  const notify = useCallback((input: ToastInput) => {
    const id = makeId();
    dispatch({ type: "ADD_NOTIFICATION", payload: { ...input, id, read: false, createdAt: new Date() } });
    toast(input);
  }, [toast]);

  return (
    <NotificationContext.Provider value={{ ...state, toast, dismiss, notify, markRead, markAllRead, clearNotifications }}>
      {children}
    </NotificationContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error("useNotifications must be used within NotificationProvider");
  return ctx;
}
