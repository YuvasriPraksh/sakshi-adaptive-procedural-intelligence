import { useEffect, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/buttons";

export interface DrawerProps {
  open:       boolean;
  onClose:    () => void;
  title?:     string;
  children:   ReactNode;
  footer?:    ReactNode;
  side?:      "left" | "right";
  width?:     string;
  className?: string;
}

const slideVariants = {
  right: {
    initial: { x: "100%", opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit:    { x: "100%", opacity: 0 },
  },
  left: {
    initial: { x: "-100%", opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit:    { x: "-100%", opacity: 0 },
  },
};

export function Drawer({ open, onClose, title, children, footer, side = "right", width = "420px", className }: DrawerProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  const variants = slideVariants[side];

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[100] flex" role="dialog" aria-modal>
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />
          {/* Panel */}
          <motion.div
            className={cn(
              "absolute top-0 bottom-0 flex flex-col bg-card border-border shadow-2xl",
              side === "right" ? "right-0 border-l" : "left-0 border-r",
              className,
            )}
            style={{ width }}
            variants={variants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.25, ease: "easeOut" }}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              {title ? <h2 className="text-base font-semibold text-foreground">{title}</h2> : <span />}
              <Button variant="ghost" size="icon-sm" onClick={onClose} aria-label="Close panel">
                <X className="h-4 w-4" />
              </Button>
            </div>
            {/* Body */}
            <div className="flex-1 overflow-y-auto px-5 py-4">{children}</div>
            {/* Footer */}
            {footer && (
              <div className="flex items-center justify-end gap-3 border-t border-border px-5 py-4">
                {footer}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
