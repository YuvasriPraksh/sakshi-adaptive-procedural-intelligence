/**
 * SAKSHI Design System — Typography tokens
 */
export const typography = {
  fontFamily: {
    sans:    '"Inter", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    mono:    '"JetBrains Mono", "Fira Code", Consolas, "Courier New", monospace',
    display: '"Inter", system-ui, sans-serif',
  },
  fontWeight: {
    thin:       100,
    extralight: 200,
    light:      300,
    normal:     400,
    medium:     500,
    semibold:   600,
    bold:       700,
    extrabold:  800,
    black:      900,
  },
  fontSize: {
    "2xs": "0.625rem",   //  10px
    xs:    "0.75rem",    //  12px
    sm:    "0.875rem",   //  14px
    base:  "1rem",       //  16px
    lg:    "1.125rem",   //  18px
    xl:    "1.25rem",    //  20px
    "2xl": "1.5rem",     //  24px
    "3xl": "1.875rem",   //  30px
    "4xl": "2.25rem",    //  36px
    "5xl": "3rem",       //  48px
    "6xl": "3.75rem",    //  60px
  },
  lineHeight: {
    none:    1,
    tight:   1.25,
    snug:    1.375,
    normal:  1.5,
    relaxed: 1.625,
    loose:   2,
  },
  letterSpacing: {
    tighter: "-0.05em",
    tight:   "-0.025em",
    normal:  "0em",
    wide:    "0.025em",
    wider:   "0.05em",
    widest:  "0.1em",
  },
} as const;

/** Heading styles used across the design system */
export const headingStyles = {
  "display-xl": { fontSize: typography.fontSize["5xl"], fontWeight: typography.fontWeight.bold,      lineHeight: typography.lineHeight.none  },
  "display-lg": { fontSize: typography.fontSize["4xl"], fontWeight: typography.fontWeight.bold,      lineHeight: typography.lineHeight.tight },
  h1:           { fontSize: typography.fontSize["3xl"], fontWeight: typography.fontWeight.bold,      lineHeight: typography.lineHeight.tight },
  h2:           { fontSize: typography.fontSize["2xl"], fontWeight: typography.fontWeight.semibold,  lineHeight: typography.lineHeight.snug  },
  h3:           { fontSize: typography.fontSize.xl,     fontWeight: typography.fontWeight.semibold,  lineHeight: typography.lineHeight.snug  },
  h4:           { fontSize: typography.fontSize.lg,     fontWeight: typography.fontWeight.medium,    lineHeight: typography.lineHeight.normal},
  h5:           { fontSize: typography.fontSize.base,   fontWeight: typography.fontWeight.medium,    lineHeight: typography.lineHeight.normal},
  h6:           { fontSize: typography.fontSize.sm,     fontWeight: typography.fontWeight.medium,    lineHeight: typography.lineHeight.normal},
  body:         { fontSize: typography.fontSize.sm,     fontWeight: typography.fontWeight.normal,    lineHeight: typography.lineHeight.relaxed},
  caption:      { fontSize: typography.fontSize.xs,     fontWeight: typography.fontWeight.normal,    lineHeight: typography.lineHeight.normal},
  label:        { fontSize: typography.fontSize.sm,     fontWeight: typography.fontWeight.medium,    lineHeight: typography.lineHeight.none  },
  code:         { fontSize: typography.fontSize.xs,     fontWeight: typography.fontWeight.normal,    lineHeight: typography.lineHeight.relaxed},
} as const;
