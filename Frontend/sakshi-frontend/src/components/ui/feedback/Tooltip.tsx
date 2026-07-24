import { useState, useRef, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";

export interface TooltipProps {
  content:    ReactNode;
  children:   ReactNode;
  side?:      "top" | "bottom" | "left" | "right";
  className?: string;
  delay?:     number;
}

const positionMap = {
  top:    { tooltip: "bottom-full left-1/2 -translate-x-1/2 mb-2",  arrow: "top-full left-1/2 -translate-x-1/2 border-t-foreground/80" },
  bottom: { tooltip: "top-full left-1/2 -translate-x-1/2 mt-2",     arrow: "bottom-full left-1/2 -translate-x-1/2 border-b-foreground/80" },
  left:   { tooltip: "right-full top-1/2 -translate-y-1/2 mr-2",    arrow: "left-full top-1/2 -translate-y-1/2 border-l-foreground/80" },
  right:  { tooltip: "left-full top-1/2 -translate-y-1/2 ml-2",     arrow: "right-full top-1/2 -translate-y-1/2 border-r-foreground/80" },
};

export function Tooltip({ content, children, side = "top", className, delay = 300 }: TooltipProps) {
  const [visible, setVisible] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const pos = positionMap[side];

  const show = () => { timerRef.current = setTimeout(() => setVisible(true), delay); };
  const hide = () => { clearTimeout(timerRef.current); setVisible(false); };

  return (
    <div className="relative inline-flex" onMouseEnter={show} onMouseLeave={hide} onFocus={show} onBlur={hide}>
      {children}
      <AnimatePresence>
        {visible && (
          <motion.div
            role="tooltip"
            className={cn("absolute z-[300] pointer-events-none", pos.tooltip)}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1   }}
            exit={{    opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.12 }}
          >
            <div className={cn(
              "rounded-md bg-foreground/90 px-2.5 py-1.5 text-xs text-background shadow-md whitespace-nowrap max-w-xs",
              className,
            )}>
              {content}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
