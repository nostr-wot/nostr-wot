/** Format a Nostr timestamp using the selected page language. */
export function formatRelativeTime(timestamp: number, locale: string, now = Date.now()): string {
  const seconds = Math.max(0, Math.floor(now / 1000) - timestamp);
  const format = new Intl.RelativeTimeFormat(locale, { numeric: "auto", style: "short" });
  if (seconds < 60) return format.format(0, "second");
  if (seconds < 3600) return format.format(-Math.floor(seconds / 60), "minute");
  if (seconds < 86400) return format.format(-Math.floor(seconds / 3600), "hour");
  if (seconds < 604800) return format.format(-Math.floor(seconds / 86400), "day");
  return new Intl.DateTimeFormat(locale, { month: "short", day: "numeric", year: "numeric" }).format(timestamp * 1000);
}
