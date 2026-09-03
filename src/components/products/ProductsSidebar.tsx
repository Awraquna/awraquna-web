"use client";

import Link from "next/link";
import { useState } from "react";
import type { BusinessArea, Category, Locale } from "@/lib/types";
import { buildQuery } from "@/lib/api";
import { cx, pick } from "@/lib/utils";
import Icon from "@/components/Icon";

type Filters = { search: string; category: string; subCategory: string; area: string };

type Props = {
  categories: Category[];
  areas: BusinessArea[];
  filters: Filters;
  locale: Locale;
  labels: { filters: string; categories: string; businessAreas: string; allProducts: string; clear: string };
};

export default function ProductsSidebar({ categories, areas, filters, locale, labels }: Props) {
  const [open, setOpen] = useState(false);
  const hasFilter = !!(filters.category || filters.subCategory || filters.area || filters.search);

  const link = (next: Partial<Filters>) =>
    `/products${buildQuery({ search: filters.search, category: "", subCategory: "", area: "", ...next })}`;

  const itemCls = (active: boolean) =>
    cx(
      "flex items-center justify-between rounded-lg px-3 py-2 text-sm transition",
      active ? "bg-brand-50 font-semibold text-brand-700" : "text-muted-foreground hover:bg-surface-2 hover:text-foreground",
    );

  return (
    <aside className="lg:w-72 lg:shrink-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="mb-3 flex w-full items-center justify-between rounded-xl border border-border bg-surface px-4 py-3 text-sm font-semibold text-foreground lg:hidden"
        aria-expanded={open}
        aria-controls="products-filters"
      >
        <span className="inline-flex items-center gap-2">
          <Icon name="settings" size={16} />
          {labels.filters}
        </span>
        <Icon name="chevron-down" size={16} className={cx("transition", open && "rotate-180")} />
      </button>

      <div id="products-filters" className={cx("space-y-6", open ? "block" : "hidden lg:block")}>
        <section className="rounded-2xl border border-border bg-surface p-4">
          <h2 className="mb-2 px-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground/70">{labels.categories}</h2>
          <ul className="space-y-0.5">
            <li>
              <Link href={link({})} className={itemCls(!filters.category && !filters.subCategory && !filters.area)}>
                {labels.allProducts}
              </Link>
            </li>
            {categories.map((c) => {
              const active = filters.category === c.slug;
              const subs = (c.subCategories ?? []).filter((s) => s.isActive !== false);
              return (
                <li key={c.id}>
                  <Link href={link({ category: c.slug })} className={itemCls(active && !filters.subCategory)}>
                    <span>{pick(c, "name", locale)}</span>
                    {typeof c.productCount === "number" ? (
                      <span className="ms-2 rounded-full bg-surface-2 px-2 py-0.5 text-xs text-muted-foreground">{c.productCount}</span>
                    ) : null}
                  </Link>
                  {subs.length ? (
                    <ul className={cx("ms-3 mt-0.5 space-y-0.5 border-s border-border ps-2", !active && "hidden lg:block")}>
                      {subs.map((s) => (
                        <li key={s.id}>
                          <Link href={link({ category: c.slug, subCategory: s.slug })} className={itemCls(filters.subCategory === s.slug)}>
                            <span className="text-[13px]">{pick(s, "name", locale)}</span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </li>
              );
            })}
          </ul>
        </section>

        {areas.length ? (
          <section className="rounded-2xl border border-border bg-surface p-4">
            <h2 className="mb-2 px-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground/70">{labels.businessAreas}</h2>
            <ul className="space-y-0.5">
              {areas.map((a) => (
                <li key={a.id}>
                  <Link href={link({ area: a.slug })} className={itemCls(filters.area === a.slug)}>
                    {pick(a, "name", locale)}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {hasFilter ? (
          <Link href="/products" className="inline-flex items-center gap-1 px-2 text-sm font-medium text-muted-foreground hover:text-brand-700">
            <Icon name="close" size={14} />
            {labels.clear}
          </Link>
        ) : null}
      </div>
    </aside>
  );
}
