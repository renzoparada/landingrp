/**
 * Deterministic, timezone-independent date formatting. Avoids relying on
 * Intl/toLocaleString, whose output can differ between the server's ICU
 * data/timezone and the browser's — which triggers React hydration
 * mismatches when used inside client components.
 */
export function formatDateTime(iso: string | Date): string {
  const d = typeof iso === "string" ? new Date(iso) : iso;
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${pad(d.getUTCDate())}/${pad(d.getUTCMonth() + 1)}/${d.getUTCFullYear()} ${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())} UTC`;
}
