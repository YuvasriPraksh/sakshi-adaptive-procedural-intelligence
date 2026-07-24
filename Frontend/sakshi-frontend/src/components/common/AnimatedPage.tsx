import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { pageTransitionVariants } from "@/theme/animations";

export interface AnimatedPageProps {
  children:   ReactNode;
  className?: string;
}

/**
 * Wraps a page with a standard enter/exit transition.
 * Usage: wrap the content inside each placeholder page component.
 */
export function AnimatedPage({ children, className }: AnimatedPageProps) {
  return (
    <motion.div
      className={className}
      variants={pageTransitionVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      {children}
    </motion.div>
  );
}
