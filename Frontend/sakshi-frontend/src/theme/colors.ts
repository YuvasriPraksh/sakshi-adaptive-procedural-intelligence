/**
 * SAKSHI Design System — Color tokens (JS-side mirror of CSS vars)
 * Use these in Framer Motion, canvas, or dynamic style calculations.
 */
export const colors = {
  navy: {
    50:  "#eef2f9",
    100: "#d5dff0",
    200: "#aabfe1",
    300: "#7a99ce",
    400: "#4d73b8",
    500: "#2952a3",
    600: "#1e3f87",
    700: "#162f6b",
    800: "#0f2050",
    900: "#091435",
    950: "#050c21",
  },
  royal: {
    50:  "#eff6ff",
    100: "#dbeafe",
    200: "#bfdbfe",
    300: "#93c5fd",
    400: "#60a5fa",
    500: "#3b82f6",
    600: "#2563eb",
    700: "#1d4ed8",
    800: "#1e40af",
    900: "#1e3a8a",
    950: "#172554",
  },
  emerald: {
    50:  "#ecfdf5",
    100: "#d1fae5",
    300: "#6ee7b7",
    400: "#34d399",
    500: "#10b981",
    600: "#059669",
    700: "#047857",
  },
  amber: {
    50:  "#fffbeb",
    100: "#fef3c7",
    300: "#fcd34d",
    400: "#fbbf24",
    500: "#f59e0b",
    600: "#d97706",
    700: "#b45309",
  },
  danger: {
    50:  "#fff1f2",
    300: "#fda4af",
    400: "#fb7185",
    500: "#f43f5e",
    600: "#e11d48",
    700: "#be123c",
  },
  success: {
    50:  "#f0fdf4",
    100: "#dcfce7",
    500: "#22c55e",
    600: "#16a34a",
    700: "#15803d",
  },
  slate: {
    50:  "#f8fafc",
    100: "#f1f5f9",
    200: "#e2e8f0",
    300: "#cbd5e1",
    400: "#94a3b8",
    500: "#64748b",
    600: "#475569",
    700: "#334155",
    800: "#1e293b",
    900: "#0f172a",
    950: "#020617",
  },
  white: "#ffffff",
  black: "#000000",
  transparent: "transparent",
} as const;

/** Semantic aliases for the light theme */
export const semanticColors = {
  primary:     colors.navy[700],
  secondary:   colors.royal[600],
  accent:      colors.emerald[500],
  warning:     colors.amber[500],
  danger:      colors.danger[500],
  success:     colors.success[500],
  background:  "#f3f6fb",
  surface:     colors.white,
  textPrimary: colors.slate[800],
  textMuted:   colors.slate[500],
  border:      colors.slate[200],
  sidebarBg:   colors.navy[800],
  sidebarText: colors.slate[100],
} as const;

/** Semantic aliases for the dark theme */
export const semanticColorsDark = {
  primary:     colors.royal[400],
  secondary:   colors.royal[500],
  accent:      colors.emerald[400],
  warning:     colors.amber[400],
  danger:      colors.danger[400],
  success:     colors.success[500],
  background:  "#0d1626",
  surface:     "#111c2d",
  textPrimary: colors.slate[100],
  textMuted:   colors.slate[400],
  border:      "#1e2d45",
  sidebarBg:   "#080f1c",
  sidebarText: colors.slate[200],
} as const;

/** Chart color palette — consistent across all charts */
export const chartColors = [
  colors.royal[500],
  colors.emerald[500],
  colors.amber[500],
  colors.danger[500],
  colors.navy[400],
  colors.royal[300],
  colors.emerald[300],
  colors.amber[300],
] as const;
