"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState, useTransition } from "react";
import { buildQuery } from "@/lib/api";
import { cx } from "@/lib/utils";
import Icon from "@/components/Icon";

type Props = {
  /** The search term the page was rendered with. */
  initial: string;
  /** Other active filters, preserved while typing. */
  params: { category: string; subCategory: string; area: string };
  placeholder: string;
  labels: { search: string; searching: string };
};

const DEBOUNCE_MS = 250;

/**
 * Search-as-you-type for the products page. Every keystroke (debounced) rewrites
 * the URL's `search` param and the server re-renders the list; the input keeps
 * focus because this client component survives the refresh. Enter / the button
 * skip the debounce.
 */
export default function ProductsSearch({ initial, params, placeholder, labels }: Props) {
  const router = useRouter();
  const { category, subCategory, area } = params;
  const [value, setValue] = useState(initial);
  const [isPending, startTransition] = useTransition();
  const [waiting, setWaiting] = useState(false);
  // What we last asked the server for. While the page's `initial` lags behind
  // it, the user is still typing and the input must not be overwritten.
  const [pushed, setPushed] = useState(initial);
  const [dirty, setDirty] = useState(false);

  // Something other than typing changed the term (the "Clear filters" link, the
  // back button): adopt it, but only when no keystroke is still in flight.
  const [seen, setSeen] = useState(initial);
  if (initial !== seen) {
    setSeen(initial);
    if (initial === pushed) setDirty(false);
    else if (!dirty) {
      setPushed(initial);
      setValue(initial);
    }
  }

  const go = useCallback(
    (term: string) => {
      const t = term.trim();
      setPushed(t);
      startTransition(() => {
        router.replace(`/products${buildQuery({ search: t, category, subCategory, area })}`, { scroll: false });
      });
    },
    [router, category, subCategory, area],
  );

  useEffect(() => {
    if (!dirty || value.trim() === pushed) return;
    const timer = window.setTimeout(() => {
      setWaiting(false);
      go(value);
    }, DEBOUNCE_MS);
    return () => window.clearTimeout(timer);
  }, [value, dirty, pushed, go]);

  const busy = waiting || isPending;

  return (
    <form
      action="/products"
      method="get"
      role="search"
      className="mt-7 flex max-w-2xl gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        setWaiting(false);
        go(value);
      }}
    >
      {category ? <input type="hidden" name="category" value={category} /> : null}
      {subCategory ? <input type="hidden" name="subCategory" value={subCategory} /> : null}
      {area ? <input type="hidden" name="area" value={area} /> : null}
      <div className="relative flex-1">
        <Icon
          name={busy ? "refresh" : "search"}
          size={18}
          className={cx(
            "pointer-events-none absolute start-4 top-1/2 -translate-y-1/2 text-muted-foreground/70",
            busy && "animate-spin text-brand-600",
          )}
        />
        <input
          type="search"
          name="search"
          value={value}
          onChange={(e) => {
            setDirty(true);
            setWaiting(true);
            setValue(e.target.value);
          }}
          placeholder={placeholder}
          autoComplete="off"
          aria-label={labels.search}
          aria-busy={busy}
          className="h-12 w-full rounded-full border border-border bg-surface pe-4 ps-11 text-sm text-foreground shadow-sm outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-500/25"
        />
      </div>
      <button
        type="submit"
        className="h-12 shrink-0 rounded-full bg-brand-600 px-6 text-sm font-semibold text-white shadow-[0_12px_28px_-14px_var(--brand-600)] transition hover:bg-brand-700 dark:text-[#0a1017]"
      >
        {busy ? labels.searching : labels.search}
      </button>
    </form>
  );
}
