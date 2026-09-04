"use client";

import { useEffect, useState } from "react";
import type { ProductCard } from "./types";

export type SearchHit = Pick<
  ProductCard,
  "id" | "slug" | "sku" | "nameEn" | "nameAr" | "imageUrl" | "price" | "unit" | "categoryNameEn" | "categoryNameAr"
>;

type Result = { forQuery: string; items: SearchHit[]; total: number };

export const MIN_QUERY = 2;

/**
 * Live product suggestions for a query, debounced and abortable. `loading` is
 * derived (the last settled result is for a different query), so typing never
 * flashes an empty list: the previous hits stay on screen until the new ones land.
 */
export function useProductSearch(query: string, limit = 6, delay = 200) {
  const q = query.trim();
  const [result, setResult] = useState<Result>({ forQuery: "", items: [], total: 0 });

  useEffect(() => {
    if (q.length < MIN_QUERY) return;
    const ctrl = new AbortController();
    const timer = window.setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(q)}&limit=${limit}`, {
          signal: ctrl.signal,
          headers: { Accept: "application/json" },
        });
        const data = res.ok ? ((await res.json()) as { items: SearchHit[]; total: number }) : null;
        setResult({ forQuery: q, items: data?.items ?? [], total: data?.total ?? 0 });
      } catch {
        if (!ctrl.signal.aborted) setResult({ forQuery: q, items: [], total: 0 });
      }
    }, delay);
    return () => {
      window.clearTimeout(timer);
      ctrl.abort();
    };
  }, [q, limit, delay]);

  const active = q.length >= MIN_QUERY;
  return {
    active,
    loading: active && result.forQuery !== q,
    items: active ? result.items : [],
    total: active ? result.total : 0,
  };
}
