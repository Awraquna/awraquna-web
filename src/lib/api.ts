export const API_BASE = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5200").replace(/\/+$/, "");

export type ApiResult<T> =
  | { ok: true; status: number; data: T }
  | { ok: false; status: number; data: null };

/** Raw GET; never throws. `status` is 0 when the API is unreachable. */
export async function apiFetch<T>(path: string, opts: { revalidate?: number } = {}): Promise<ApiResult<T>> {
  // How long (seconds) the site caches API responses.
  // When REVALIDATE_SECONDS is set in .env.local it wins over every per-call value, so
  // REVALIDATE_SECONDS=0 makes the whole site always fresh while editing in the admin.
  const envValue = process.env.REVALIDATE_SECONDS;
  const envSeconds = envValue !== undefined && envValue !== "" ? Number(envValue) : NaN;
  const revalidate = Number.isFinite(envSeconds) ? envSeconds : (opts.revalidate ?? 60);
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      headers: { Accept: "application/json" },
      next: { revalidate },
    });
    if (!res.ok) return { ok: false, status: res.status, data: null };
    const data = (await res.json()) as T;
    return { ok: true, status: res.status, data };
  } catch {
    return { ok: false, status: 0, data: null };
  }
}

/** GET helper returning `null` on any failure so pages can render empty states. */
export async function apiGet<T>(path: string, opts: { revalidate?: number } = {}): Promise<T | null> {
  const r = await apiFetch<T>(path, opts);
  return r.ok ? r.data : null;
}

/** Turns a relative `/uploads/..` URL into an absolute one. Returns null when there is no image. */
export function imageUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  if (/^(https?:)?\/\//i.test(url) || url.startsWith("data:")) return url;
  return `${API_BASE}${url.startsWith("/") ? "" : "/"}${url}`;
}

export function buildQuery(params: Record<string, string | number | undefined | null>): string {
  const q = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === null || v === "") continue;
    q.set(k, String(v));
  }
  const s = q.toString();
  return s ? `?${s}` : "";
}
