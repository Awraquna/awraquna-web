"use client";

import { memo } from "react";
import Link from "next/link";
import type { BusinessArea, Category, Locale } from "@/lib/types";
import { cx, pick } from "@/lib/utils";
import Icon from "@/components/Icon";
import AppImage from "@/components/AppImage";

export type MegaLabels = {
  categories: string;
  businessAreas: string;
  allProducts: string;
  viewAll: string;
  products: string;
  blurbTitle: string;
  blurbText: string;
};

type Props = {
  open: boolean;
  categories: Category[];
  areas: BusinessArea[];
  locale: Locale;
  labels: MegaLabels;
  onClose: () => void;
  /** Cancels the navbar's close timer so crossing the gap from the trigger does not shut the panel. */
  onEnter: () => void;
};

/**
 * The Products dropdown: every category (with its first sub-categories) plus the
 * business areas and a closing call-to-action. It stays mounted and toggles
 * opacity/visibility, so opening it costs one composited transition instead of a
 * mount — the panel never flashes half-built.
 */
function ProductsMegaMenu({ open, categories, areas, locale, labels, onClose, onEnter }: Props) {
  const cats = categories.slice(0, 8);
  const tops = areas.slice(0, 6);

  return (
    <div
      className={cx(
        // top-full + transparent pt-2 means there is no hover dead-zone between
        // the bar and the card: the pointer never leaves the panel's box.
        "absolute top-full left-1/2 z-40 hidden w-[min(94vw,62rem)] -translate-x-1/2 pt-3 transition-all duration-200 ease-out lg:block",
        open ? "translate-y-0 opacity-100" : "pointer-events-none invisible -translate-y-2 opacity-0",
      )}
      onMouseEnter={onEnter}
      onMouseLeave={onClose}
      aria-hidden={!open}
    >
      <div className="overflow-hidden rounded-3xl border border-border bg-surface shadow-[0_40px_90px_-40px_rgb(16_24_40_/_0.55)]">
        <div className="grid gap-8 p-7 lg:grid-cols-3">
          {/* Categories — two of the three columns. */}
          <div className="lg:col-span-2">
            <MenuHeading
              title={labels.categories}
              action={
                <Link href="/products" onClick={onClose} className="text-xs font-semibold text-brand-600 hover:underline">
                  {labels.allProducts}
                </Link>
              }
            />
            <div className="grid gap-1.5 sm:grid-cols-2">
              {cats.map((c) => {
                const subs = (c.subCategories ?? []).filter((s) => s.isActive !== false).slice(0, 3);
                return (
                  <Link
                    key={c.id}
                    href={`/products?category=${encodeURIComponent(c.slug)}`}
                    onClick={onClose}
                    className="group flex items-start gap-3 rounded-2xl p-2.5 transition-colors hover:bg-surface-2"
                  >
                    {c.imageUrl ? (
                      <AppImage src={c.imageUrl} alt="" className="h-11 w-11 shrink-0 rounded-xl" icon="box" iconSize={20} />
                    ) : (
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600 transition-colors group-hover:bg-brand-600 group-hover:text-white">
                        <Icon name="box" size={20} />
                      </span>
                    )}
                    <span className="min-w-0">
                      <span className="flex items-center gap-1 text-sm font-semibold text-foreground">
                        <span className="truncate">{pick(c, "name", locale)}</span>
                        <Icon
                          name="arrow-right"
                          size={13}
                          className="shrink-0 -translate-x-1 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100 rtl:rotate-180"
                        />
                      </span>
                      <span className="mt-0.5 line-clamp-1 block text-xs text-muted-foreground">
                        {subs.length
                          ? subs.map((s) => pick(s, "name", locale)).join(" · ")
                          : c.productCount
                            ? `${c.productCount} ${labels.products}`
                            : pick(c, "description", locale)}
                      </span>
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Business areas + the closing CTA. */}
          <div className="lg:border-s lg:border-border lg:ps-8">
            <MenuHeading title={labels.businessAreas} />
            <ul className="space-y-0.5">
              {tops.map((a) => (
                <li key={a.id}>
                  <Link
                    href={`/products?area=${encodeURIComponent(a.slug)}`}
                    onClick={onClose}
                    className="group flex items-center gap-2 rounded-xl px-2.5 py-2 text-sm text-muted-foreground transition-colors hover:bg-surface-2 hover:text-foreground"
                  >
                    <span className="h-px w-0 bg-brand-500 transition-all duration-300 group-hover:w-3" />
                    <span className="truncate">{pick(a, "name", locale)}</span>
                  </Link>
                </li>
              ))}
            </ul>

            <Link
              href="/contact"
              onClick={onClose}
              className="brand-panel mt-5 block overflow-hidden rounded-2xl p-4 transition-transform hover:-translate-y-0.5"
            >
              <span className="flex items-center gap-2 text-sm font-semibold">
                <Icon name="headset" size={16} />
                {labels.blurbTitle}
              </span>
              <span className="mt-1 block text-xs text-white/80">{labels.blurbText}</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Memoised: the navbar re-renders on every scroll burst and on every keystroke in
 * its search box, and none of that should cost a re-render of eight category
 * tiles. Only `open` actually changes here.
 */
export default memo(ProductsMegaMenu);

function MenuHeading({ title, action }: { title: string; action?: React.ReactNode }) {
  return (
    <div className="mb-3 flex items-center justify-between gap-2">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{title}</h3>
      {action}
    </div>
  );
}
