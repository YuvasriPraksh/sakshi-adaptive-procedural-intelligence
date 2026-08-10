export function AIBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-[hsl(var(--background))]">
      {/* Subtle radial ambient highlight */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(2,132,199,0.06),transparent_50%)]" />
      {/* Precision grid pattern */}
      <div 
        className="absolute inset-0 opacity-[0.035] bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:32px_32px]" 
      />
      {/* Subtle vignette border top */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent" />
    </div>
  );
}
