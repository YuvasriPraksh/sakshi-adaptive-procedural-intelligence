export function AIBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(99,102,241,0.14),transparent_34%)]" />
      <div className="absolute left-1/2 top-1/4 h-72 w-72 -translate-x-1/2 rounded-full bg-violet-500/20 blur-3xl" />
      <div className="absolute right-0 top-2/3 h-80 w-80 translate-x-1/4 rounded-full bg-sky-400/20 blur-3xl" />
    </div>
  );
}
