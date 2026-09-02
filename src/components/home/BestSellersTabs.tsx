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
      <div className="mb-6 flex flex-wrap justify-center gap-2" role="tablist">
        {tabs.map((t) => (
          <button
            key={t.slug}
            type="button"
            role="tab"
            aria-selected={active === t.slug}
            onClick={() => setActive(t.slug)}
            className={cx(
              "rounded-full border px-4 py-1.5 text-sm font-medium transition",
              active === t.slug
                ? "border-brand-600 bg-brand-600 text-white"
                : "border-gray-200 bg-white text-gray-600 hover:border-brand-400 hover:text-brand-700",
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
