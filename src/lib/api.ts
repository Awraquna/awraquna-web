export const API_BASE = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5200").replace(/\/+$/, "");

export type ApiResult<T> =
  | { ok: true; status: number; data: T }
  | { ok: false; status: number; data: null };

/**
 * How long to wait for the API before giving up and rendering the empty state.
 *
 * Without this a slow or unreachable API does not fail — it hangs forever. The
 * root layout, header and footer make seven blocking calls that every render
 * waits on, so one stalled socket takes the whole page (and, during `next build`,
 * the whole build) down with it. The site is designed to degrade to empty states
 * when the API is unreachable; that promise only holds if the request actually
 * ends.
 */
const TIMEOUT_MS = 10_000;

/**
 * The Cloudflare colo's own cache, when running on Workers.
 *
 * Next's data cache turned out not to engage at all here: every page reads the
 * locale cookie, so every render is dynamic, and a dynamic render fetches afresh
 * however the request is annotated. That meant each page view paid four or five
 * round trips to the API in Riyadh, which is most of what made the site feel
 * slow. This caches those GETs in the edge location that served the visitor, so
 * only the first viewer after each TTL window waits for the origin.
 *
 * Bump CACHE_VERSION to invalidate everything at once.
 */
const CACHE_VERSION = "v1";
type EdgeCache = { match(key: Request): Promise<Response | undefined>; put(key: Request, res: Response): Promise<void> };

function edgeCache(): EdgeCache | null {
  const c = (globalThis as { caches?: { default?: EdgeCache } }).caches;
  return c?.default ?? null;
}

/** GET `url`, served from the colo cache when a fresh copy is already there. */
async function cachedFetch(url: string, ttl: number): Promise<Response> {
  const cache = edgeCache();
  if (!cache || ttl <= 0) {
    return fetch(url, { headers: { Accept: "application/json" }, cache: "no-store" });
  }

  // The cache is keyed by URL, so the version prefix has to live in it.
  const key = new Request(`${url}${url.includes("?") ? "&" : "?"}__c=${CACHE_VERSION}`, { method: "GET" });
  const hit = await cache.match(key);
  if (hit) return hit;

  const res = await fetch(url, { headers: { Accept: "application/json" }, cache: "no-store" });
  if (res.ok) {
    // A copy with our own TTL; the original body is still untouched for the caller.
    const body = await res.clone().arrayBuffer();
    const store = new Response(body, {
      status: res.status,
      headers: {
        "Content-Type": res.headers.get("Content-Type") ?? "application/json",
        "Cache-Control": `public, s-maxage=${Math.round(ttl)}`,
      },
    });
    await cache.put(key, store);
  }
  return res;
}

/** Raw GET; never throws. `status` is 0 when the API is unreachable or too slow. */
export async function apiFetch<T>(path: string, opts: { revalidate?: number } = {}): Promise<ApiResult<T>> {
  // How long (seconds) the site caches API responses.
  // When REVALIDATE_SECONDS is set in .env.local it wins over every per-call value, so
  // REVALIDATE_SECONDS=0 makes the whole site always fresh while editing in the admin.
  const envValue = process.env.REVALIDATE_SECONDS;
  const envSeconds = envValue !== undefined && envValue !== "" ? Number(envValue) : NaN;
  const revalidate = Number.isFinite(envSeconds) ? envSeconds : (opts.revalidate ?? 60);
  try {
    // The timeout is a RACE rather than an AbortSignal on the request: a signal
    // makes the response unusable for the cache write below, and losing the race
    // gives the same empty state the abort used to.
    const res = await Promise.race([
      cachedFetch(`${API_BASE}${path}`, revalidate),
      new Promise<never>((_, reject) => setTimeout(() => reject(new Error("api timeout")), TIMEOUT_MS)),
    ]);
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
