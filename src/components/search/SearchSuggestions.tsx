"use client";

import Link from "next/link";
import type { Locale } from "@/lib/types";
import { useProductSearch } from "@/lib/useProductSearch";
import { cx, formatPrice, pick } from "@/lib/utils";
import AppImage from "@/components/AppImage";
import Icon from "@/components/Icon";

export type SuggestLabels = { searching: string; noResults: string; seeAllResults: string; results: string };

type Props = {
  query: string;
  locale: Locale;
  labels: SuggestLabels;
  /** Called after a suggestion or the "see all" link is chosen, so the host can close itself. */
  onPick?: () => void;
  className?: string;
};

/**
 * The live results list under a search box. Renders nothing until the query is
 * long enough, so the host can always mount it unconditionally.
 */
export default function SearchSuggestions({ query, locale, labels, onPick, className }: Props) {
  const { active, loading, items, total } = useProductSearch(query);
  if (!active) return null;

  const allHref = `/products?search=${encodeURIComponent(query.trim())}`;

  return (
    <div
      className={cx(
        "overflow-hidden rounded-2xl border border-border bg-surface text-start shadow-[0_30px_70px_-30px_rgb(16_24_40_/_0.5)]",
        className,
      )}
      role="listbox"
    >
      {items.length === 0 ? (
        <p className="flex items-center gap-2 px-4 py-3 text-sm text-muted-foreground">
          <Icon name={loading ? "refresh" : "search"} size={15} className={cx(loading && "animate-spin")} />
          {loading ? labels.searching : labels.noResults}
        </p>
      ) : (
        <ul className={cx("max-h-[60vh] overflow-y-auto py-1.5 transition-opacity", loading && "opacity-60")}>
          {items.map((p) => {
            const name = pick(p, "name", locale);
            const price = formatPrice(p.price, locale);
            return (
              <li key={p.id} role="option" aria-selected={false}>
                <Link
                  href={`/products/${encodeURIComponent(p.slug)}`}
                  onClick={onPick}
                  className="flex items-center gap-3 px-3 py-2 transition-colors hover:bg-surface-2"
                >
                  <AppImage src={p.imageUrl} alt="" className="h-11 w-11 shrink-0 rounded-lg" icon="box" iconSize={18} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-foreground">{name}</span>
                    <span className="block truncate text-xs text-muted-foreground">
                      {[p.sku, pick(p, "categoryName", locale)].filter(Boolean).join(" · ")}
                    </span>
                  </span>
                  {price ? <span className="shrink-0 text-xs font-semibold text-brand-600">{price}</span> : null}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
      {total > 0 ? (
        <Link
          href={allHref}
          onClick={onPick}
          className="flex items-center justify-between gap-2 border-t border-border bg-surface-2/60 px-4 py-2.5 text-xs font-semibold text-brand-600 transition-colors hover:bg-surface-2"
        >
          <span>
            {labels.seeAllResults} ({total} {labels.results})
          </span>
          <Icon name="arrow-right" size={14} className="rtl:rotate-180" />
        </Link>
      ) : null}
    </div>
  );
}
