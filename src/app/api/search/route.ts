import { NextResponse } from "next/server";
import { apiFetch } from "@/lib/api";
import type { Paged, ProductCard } from "@/lib/types";

/**
 * GET /api/search?q=...&limit=6 -> { items, total }
 *
 * Same-origin proxy for the live search boxes. The backend sends no CORS
 * headers, so the browser cannot query it directly; this route does the fetch
 * server-side and returns a trimmed payload.
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const q = (url.searchParams.get("q") ?? "").trim().slice(0, 100);
  const limit = Math.min(Math.max(Number(url.searchParams.get("limit")) || 6, 1), 20);
  if (q.length < 2) return NextResponse.json({ items: [], total: 0 });

  const r = await apiFetch<Paged<ProductCard>>(
    `/api/public/products?search=${encodeURIComponent(q)}&page=1&pageSize=${limit}`,
    { revalidate: 30 },
  );
  const items = (r.ok ? r.data.items : []).map((p) => ({
    id: p.id,
    slug: p.slug,
    sku: p.sku,
    nameEn: p.nameEn,
    nameAr: p.nameAr,
    imageUrl: p.imageUrl,
    price: p.price,
    unit: p.unit,
    categoryNameEn: p.categoryNameEn,
    categoryNameAr: p.categoryNameAr,
  }));
  return NextResponse.json(
    { items, total: r.ok ? r.data.total : 0 },
    { headers: { "Cache-Control": "public, max-age=30" } },
  );
}
