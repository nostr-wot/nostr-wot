/** Fixed Inter Semibold outlines; regenerate with scripts/brand/export-wordmark.py. */
export function BrandLockup({ className = "h-[26px] w-auto", tone = "auto" }: { className?: string; tone?: "auto" | "light" | "dark" }) {
  return <span className={`inline-flex shrink-0 ${className}`}>
    {/* Public SVGs contain paths only, so no device font or font loading is involved. */}
    {tone !== "dark" && <img src="/brand/nostr-wot/lockup-light.svg" width={137.129} height={26} alt="Nostr WoT" className={`h-full w-auto max-w-full ${tone === "auto" ? "dark:hidden" : ""}`} />}
    {tone !== "light" && <img src="/brand/nostr-wot/lockup-dark.svg" width={137.129} height={26} alt="Nostr WoT" className={`h-full w-auto max-w-full ${tone === "auto" ? "hidden dark:block" : ""}`} />}
  </span>;
}
