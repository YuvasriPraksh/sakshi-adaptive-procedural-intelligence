import type { Variants, Transition } from "framer-motion";

// ─── Shared transitions ───────────────────────────────────────────────────────
export const transitions = {
  fast:    { duration: 0.15, ease: "easeOut" } satisfies Transition,
  default: { duration: 0.2,  ease: "easeOut" } satisfies Transition,
  smooth:  { duration: 0.3,  ease: "easeOut" } satisfies Transition,
  spring:  { type: "spring", stiffness: 400, damping: 30 } satisfies Transition,
  springGentle: { type: "spring", stiffness: 200, damping: 20 } satisfies Transition,
} as const;

// ─── Fade ─────────────────────────────────────────────────────────────────────
export const fadeVariants: Variants = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: transitions.default },
  exit:    { opacity: 0, transition: transitions.fast },
};

// ─── Slide up ─────────────────────────────────────────────────────────────────
export const slideUpVariants: Variants = {
  hidden:  { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0,  transition: transitions.smooth },
  exit:    { opacity: 0, y: 8,  transition: transitions.fast },
};

// ─── Slide down ───────────────────────────────────────────────────────────────
export const slideDownVariants: Variants = {
  hidden:  { opacity: 0, y: -16 },
  visible: { opacity: 1, y: 0,   transition: transitions.smooth },
  exit:    { opacity: 0, y: -8,  transition: transitions.fast },
};

// ─── Slide in from left ───────────────────────────────────────────────────────
export const slideInLeftVariants: Variants = {
  hidden:  { opacity: 0, x: -24 },
  visible: { opacity: 1, x: 0,   transition: transitions.smooth },
  exit:    { opacity: 0, x: -16, transition: transitions.fast },
};

// ─── Slide in from right ──────────────────────────────────────────────────────
export const slideInRightVariants: Variants = {
  hidden:  { opacity: 0, x: 24  },
  visible: { opacity: 1, x: 0,   transition: transitions.smooth },
  exit:    { opacity: 0, x: 16,  transition: transitions.fast },
};

// ─── Scale ────────────────────────────────────────────────────────────────────
export const scaleVariants: Variants = {
  hidden:  { opacity: 0, scale: 0.94 },
  visible: { opacity: 1, scale: 1,    transition: transitions.spring },
  exit:    { opacity: 0, scale: 0.96, transition: transitions.fast   },
};

// ─── Stagger container ────────────────────────────────────────────────────────
export const staggerContainer: Variants = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.06 } },
};

export const staggerItem: Variants = {
  hidden:  { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0,  transition: transitions.smooth },
};

// ─── Page transition ──────────────────────────────────────────────────────────
export const pageTransitionVariants: Variants = {
  hidden:  { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.25, ease: "easeOut" } },
  exit:    { opacity: 0, y: -8, transition: { duration: 0.15 } },
};

// ─── Card hover ───────────────────────────────────────────────────────────────
export const cardHoverProps = {
  whileHover: { y: -2, boxShadow: "0 8px 24px -4px rgb(0 0 0 / 0.12)" },
  transition: transitions.fast,
} as const;

// ─── Button tap ───────────────────────────────────────────────────────────────
export const buttonTapProps = {
  whileTap:   { scale: 0.97 },
  transition: transitions.fast,
} as const;

// ─── Loading pulse ────────────────────────────────────────────────────────────
export const loadingPulseVariants: Variants = {
  start: { opacity: 0.4, scale: 0.98 },
  end:   { opacity: 1,   scale: 1,
    transition: { repeat: Infinity, repeatType: "reverse", duration: 0.8, ease: "easeInOut" },
  },
};

// ─── Accordion ────────────────────────────────────────────────────────────────
export const accordionVariants: Variants = {
  open:   { height: "auto", opacity: 1, transition: { duration: 0.25, ease: "easeOut" } },
  closed: { height: 0,      opacity: 0, transition: { duration: 0.2,  ease: "easeIn"  } },
};
