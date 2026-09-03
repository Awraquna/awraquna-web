"use client";

import { useMemo, useState } from "react";
import type { BusinessArea, Locale, ProductCard as ProductCardType } from "@/lib/types";
import { cx, pick } from "@/lib/utils";
import ProductCard from "@/components/ProductCard";
import EmptyState from "@/components/EmptyState";

type Props = {
  areas: BusinessArea[];
  products: ProductCardType[];
  locale: Locale;
  labels: { all: string; empty: string };
};

export default function BestSellersTabs({ areas, products, locale, labels }: Props) {
  const [active, setActive] = useState<string>("all");

  const tabs = useMemo(
    () => [{ slug: "all", name: labels.all }, ...areas.map((a) => ({ slug: a.slug, name: pick(a, "name", locale) }))],
    [areas, locale, labels.all],
  );

  const visible = useMemo(
    () => (active === "all" ? products : products.filter((p) => (p.businessAreaSlugs ?? []).includes(active))),
    [active, products],
  );

  return (
    <div>
      {/* Segmented control on a recessed track — the same shape language as the
          nav pill and the language switch. */}
      <div className="mx-auto mb-8 flex w-fit max-w-full flex-wrap justify-center gap-1.5 rounded-[26px] border border-border bg-surface-2 p-1.5" role="tablist">
        {tabs.map((t) => (
          <button
            key={t.slug}
            type="button"
            role="tab"
            aria-selected={active === t.slug}
            onClick={() => setActive(t.slug)}
            className={cx(
              "rounded-full px-4 py-2 text-sm font-medium transition-all duration-300",
              active === t.slug
                ? "bg-brand-600 text-white shadow-[0_8px_20px_-10px_var(--brand-600)] dark:text-[#0a1017]"
                : "text-muted-foreground hover:bg-surface hover:text-foreground",
            )}
          >
            {t.name}
          </button>
        ))}
      </div>
      {visible.length ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {visible.slice(0, 8).map((p) => (
            <ProductCard key={p.id} product={p} locale={locale} />
          ))}
        </div>
      ) : (
        <EmptyState title={labels.empty} compact />
      )}
    </div>
  );
}
