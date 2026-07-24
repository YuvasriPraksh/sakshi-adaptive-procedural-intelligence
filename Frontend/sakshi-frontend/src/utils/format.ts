// ─── Date formatting ──────────────────────────────────────────────────────────
const dateFormatter     = new Intl.DateTimeFormat("en-IN", { year: "numeric", month: "short", day: "numeric" });
const dateTimeFormatter = new Intl.DateTimeFormat("en-IN", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
const timeFormatter     = new Intl.DateTimeFormat("en-IN", { hour: "2-digit", minute: "2-digit" });

export function formatDate(date: string | Date): string {
  return dateFormatter.format(new Date(date));
}
export function formatDateTime(date: string | Date): string {
  return dateTimeFormatter.format(new Date(date));
}
export function formatTime(date: string | Date): string {
  return timeFormatter.format(new Date(date));
}
export function formatRelativeTime(date: string | Date): string {
  const diff = (Date.now() - new Date(date).getTime()) / 1000;
  if (diff < 60)    return "just now";
  if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800)return `${Math.floor(diff / 86400)}d ago`;
  return formatDate(date);
}

// ─── Number formatting ────────────────────────────────────────────────────────
export function formatNumber(n: number, opts?: Intl.NumberFormatOptions): string {
  return new Intl.NumberFormat("en-IN", opts).format(n);
}
export function formatCompact(n: number): string {
  return formatNumber(n, { notation: "compact", maximumFractionDigits: 1 });
}
export function formatCurrency(n: number, currency = "INR"): string {
  return formatNumber(n, { style: "currency", currency });
}
export function formatPercent(n: number, decimals = 1): string {
  return `${n.toFixed(decimals)}%`;
}
export function formatFileSize(bytes: number): string {
  if (bytes === 0)      return "0 B";
  if (bytes < 1024)     return `${bytes} B`;
  if (bytes < 1048576)  return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1073741824) return `${(bytes / 1048576).toFixed(1)} MB`;
  return `${(bytes / 1073741824).toFixed(1)} GB`;
}

// ─── String formatting ────────────────────────────────────────────────────────
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return `${str.slice(0, maxLength - 3)}…`;
}
export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}
export function toTitleCase(str: string): string {
  return str.replace(/\b\w/g, c => c.toUpperCase());
}
export function toKebabCase(str: string): string {
  return str.replace(/([a-z])([A-Z])/g, "$1-$2").replace(/\s+/g, "-").toLowerCase();
}
export function toSnakeCase(str: string): string {
  return str.replace(/([a-z])([A-Z])/g, "$1_$2").replace(/\s+/g, "_").toLowerCase();
}
export function initials(name: string): string {
  if (!name?.trim()) return "?";
  return name.trim().split(/\s+/).map(w => w[0]).join("").toUpperCase().slice(0, 2);
}
export function maskString(str: string, visibleEnd = 4, char = "•"): string {
  if (str.length <= visibleEnd) return str;
  return char.repeat(str.length - visibleEnd) + str.slice(-visibleEnd);
}

// ─── Case ID formatting ───────────────────────────────────────────────────────
export function formatCaseId(id: string): string {
  return `SAKSHI/${new Date().getFullYear()}/${id.toUpperCase().slice(0, 8)}`;
}
