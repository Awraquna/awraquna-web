import { NextResponse } from "next/server";
import { apiFetch } from "@/lib/api";
import type { Paged, ProductCard } from "@/lib/types";

/**
 * GET /api/search?q=...&category=...&limit=6 -> { items, total }
 *
 * Same-origin proxy over the catalogue, used by the navbar suggestions (`q`) and
 * by the quote wizard, which lists a whole category at once (`category`). The
 * backend's CORS list is per-hostname, so proxying here keeps the browser calls
 * working from any domain this site is served on.
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const q = (url.searchParams.get("q") ?? "").trim().slice(0, 100);
  const category = (url.searchParams.get("category") ?? "").trim().slice(0, 100);
  const limit = Math.min(Math.max(Number(url.searchParams.get("limit")) || 6, 1), 60);
  // A bare query is a typeahead and needs two characters to be worth a round
  // trip; a category listing is explicit and needs none.
  if (!category && q.length < 2) return NextResponse.json({ items: [], total: 0 });

  const params = new URLSearchParams({ page: "1", pageSize: String(limit) });
  if (q) params.set("search", q);
  if (category) params.set("category", category);

  const r = await apiFetch<Paged<ProductCard>>(`/api/public/products?${params}`, { revalidate: 30 });
  const items = (r.ok ? r.data.items : []).map((p) => ({
    id: p.id,
    slug: p.slug,
    sku: p.sku,
    nameEn: p.nameEn,
    nameAr: p.nameAr,
    imageUrl: p.imageUrl,
    price: p.price,
    unit: p.unit,
    categorySlug: p.categorySlug,
    categoryNameEn: p.categoryNameEn,
    categoryNameAr: p.categoryNameAr,
  }));
  return NextResponse.json(
    { items, total: r.ok ? r.data.total : 0 },
    { headers: { "Cache-Control": "public, max-age=30" } },
  );
}
