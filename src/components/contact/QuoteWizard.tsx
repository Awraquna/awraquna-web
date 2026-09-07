"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { API_BASE } from "@/lib/api";
import type { Category, Locale } from "@/lib/types";
import type { SearchHit } from "@/lib/useProductSearch";
import { cx, formatPrice, pick } from "@/lib/utils";
import AppImage from "@/components/AppImage";
import Icon from "@/components/Icon";

export type QuoteLabels = {
  /** Step chips */
  steps: [string, string, string];
  categoriesTitle: string;
  categoriesHint: string;
  productsTitle: string;
  productsHint: string;
  detailsTitle: string;
  detailsHint: string;
  searchProducts: string;
  noProducts: string;
  loading: string;
  selected: string;
  next: string;
  back: string;
  skip: string;
  addMore: string;
  summary: string;
  wholeCategory: string;
  qty: string;
  remove: string;
  quoteSubject: string;
  categoriesLine: string;
  productsLine: string;
  /** Shared with the old plain form */
  name: string;
  phone: string;
  email: string;
  company: string;
  message: string;
  messageHint: string;
  send: string;
  sending: string;
  success: string;
  successHint: string;
  again: string;
  error: string;
};

export type QuotePreset = {
  /** Category slugs ticked before the visitor sees anything. */
  categories: string[];
  /** Product the visitor arrived from, already ticked. */
  product?: SearchHit;
};

type Props = {
  categories: Category[];
  locale: Locale;
  preset: QuotePreset;
  labels: QuoteLabels;
};

type Status = "idle" | "sending" | "success" | "error";
type Picked = SearchHit & { qty: number };

const PAGE_SIZE = 60;

const inputCls =
  "w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/70 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30";

/**
 * Three-step quote request: WHAT categories → WHICH products → WHO you are.
 *
 * The point is that the reply can be written without a phone call: by the time
 * the message lands in the admin inbox it already names the exact SKUs and
 * quantities, composed into the message body (no schema change — the admin's
 * existing Messages screen shows it as written).
 *
 * Kept quick on purpose:
 *  - a category's products are fetched the moment it is TICKED, not when step 2
 *    opens, so the list is usually already there by the time it is shown;
 *  - every fetch is cached per category for the life of the page and never
 *    repeated, and an in-flight one is aborted if the visitor moves on;
 *  - filtering and grouping are memoised, so typing in the product filter costs
 *    no network at all.
 *
 * Arriving from a product page's "Request a quote" pre-ticks that product and
 * its category and opens on step 2, where the rest of the category is already
 * listed and other categories are one step back.
 */
export default function QuoteWizard({ categories, locale, preset, labels }: Props) {
  const [step, setStep] = useState<1 | 2 | 3>(preset.product || preset.categories.length ? 2 : 1);
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);

  const [cats, setCats] = useState<string[]>(preset.categories);
  const [picked, setPicked] = useState<Record<string, Picked>>(
    preset.product ? { [preset.product.slug]: { ...preset.product, qty: 1 } } : {},
  );
  const [filter, setFilter] = useState("");

  // slug -> products, written only when a response lands; a slug that is ticked
  // but absent from the map is still loading. `requested` is what makes a
  // category cost exactly one request per page view.
  const [byCat, setByCat] = useState<Record<string, SearchHit[]>>({});
  const requested = useRef<Set<string>>(new Set());
  const [form, setForm] = useState({ name: "", phone: "", email: "", company: "", message: "" });

  const setField = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const catBySlug = useMemo(() => new Map(categories.map((c) => [c.slug, c])), [categories]);
  const catName = useCallback(
    (slug: string) => {
      const c = catBySlug.get(slug);
      return c ? pick(c, "name", locale) : slug;
    },
    [catBySlug, locale],
  );

  // Load every ticked category that has not been loaded yet. Runs on tick, not
  // on step change, so the products are usually waiting by the time step 2 opens.
  useEffect(() => {
    const missing = cats.filter((slug) => !requested.current.has(slug));
    if (!missing.length) return;
    for (const slug of missing) requested.current.add(slug);
    const ctrl = new AbortController();
    void Promise.all(
      missing.map(async (slug) => {
        try {
          const res = await fetch(`/api/search?category=${encodeURIComponent(slug)}&limit=${PAGE_SIZE}`, {
            signal: ctrl.signal,
            headers: { Accept: "application/json" },
          });
          const data = res.ok ? ((await res.json()) as { items: SearchHit[] }) : null;
          setByCat((m) => ({ ...m, [slug]: data?.items ?? [] }));
        } catch {
          // An abort means the visitor left; anything else is a dead category
          // that should stop showing a spinner.
          if (!ctrl.signal.aborted) {
            setByCat((m) => ({ ...m, [slug]: [] }));
          } else {
            requested.current.delete(slug);
          }
        }
      }),
    );
    return () => ctrl.abort();
  }, [cats]);

  const toggleCat = (slug: string) =>
    setCats((c) => (c.includes(slug) ? c.filter((s) => s !== slug) : [...c, slug]));

  const togglePick = (p: SearchHit) =>
    setPicked((m) => {
      if (m[p.slug]) {
        const rest = { ...m };
        delete rest[p.slug];
        return rest;
      }
      return { ...m, [p.slug]: { ...p, qty: 1 } };
    });

  const setQty = (slug: string, qty: number) =>
    setPicked((m) => (m[slug] ? { ...m, [slug]: { ...m[slug], qty: Math.min(Math.max(qty, 1), 99999) } } : m));

  const pickedList = useMemo(() => Object.values(picked), [picked]);

  // Products of the ticked categories, filtered by the box at the top of step 2.
  const groups = useMemo(() => {
    const needle = filter.trim().toLowerCase();
    return cats.map((slug) => {
      const all = byCat[slug];
      const items = (all ?? []).filter(
        (p) =>
          !needle ||
          `${p.nameEn} ${p.nameAr ?? ""} ${p.sku ?? ""}`.toLowerCase().includes(needle),
      );
      return { slug, name: catName(slug), loading: all === undefined, items };
    });
  }, [cats, byCat, filter, catName]);

  /** The selection, rendered into the message body the admin will read. */
  const compose = () => {
    const lines = [form.message.trim(), ""].filter(Boolean);
    lines.push(`${labels.categoriesLine}: ${cats.map(catName).join(" · ") || "-"}`);
    if (pickedList.length) {
      lines.push(`${labels.productsLine}:`);
      for (const p of pickedList) {
        const name = pick(p, "name", locale);
        lines.push(`- ${name}${p.sku ? ` (${p.sku})` : ""} × ${p.qty}`);
      }
    } else {
      lines.push(`${labels.productsLine}: ${labels.wholeCategory}`);
    }
    return lines.join("\n");
  };

  const submitted = useRef(false);
  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (submitted.current) return;
    submitted.current = true;
    setStatus("sending");
    setError(null);
    try {
      const subject = pickedList.length
        ? `${labels.quoteSubject}: ${pick(pickedList[0], "name", locale)}${pickedList.length > 1 ? ` +${pickedList.length - 1}` : ""}`
        : `${labels.quoteSubject}: ${cats.map(catName).join(", ") || "-"}`;
      const res = await fetch(`${API_BASE}/api/public/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          phone: form.phone,
          email: form.email.trim() || undefined,
          company: form.company.trim() || undefined,
          subject: subject.slice(0, 300),
          message: compose().slice(0, 4000),
        }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setStatus("success");
    } catch {
      setStatus("error");
      setError(labels.error);
    } finally {
      submitted.current = false;
    }
  }

  if (status === "success") {
    return (
      <div className="rounded-2xl border border-brand-200 bg-brand-50 p-8 text-center">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-brand-600 text-white dark:text-[#0a1017]">
          <Icon name="check" size={24} />
        </div>
        <p className="text-lg font-semibold text-brand-800">{labels.success}</p>
        <p className="mt-1 text-sm text-brand-700/80">{labels.successHint}</p>
        <button
          type="button"
          onClick={() => {
            setStatus("idle");
            setStep(1);
            setCats([]);
            setPicked({});
            setForm({ name: "", phone: "", email: "", company: "", message: "" });
          }}
          className="mt-5 rounded-full border border-brand-300 bg-white px-5 py-2 text-sm font-semibold text-brand-700 transition hover:bg-brand-100"
        >
          {labels.again}
        </button>
      </div>
    );
  }

  return (
    <div>
      <Steps step={step} labels={labels.steps} onGo={(s) => s < step && setStep(s)} />

      {/* ---------- 1. Categories ---------- */}
      {step === 1 ? (
        <section aria-labelledby="quote-step-1">
          <h2 id="quote-step-1" className="text-lg font-semibold text-foreground">
            {labels.categoriesTitle}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">{labels.categoriesHint}</p>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {categories.map((c) => {
              const on = cats.includes(c.slug);
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => toggleCat(c.slug)}
                  aria-pressed={on}
                  className={cx(
                    "flex items-center gap-3 rounded-2xl border p-3 text-start transition",
                    on
                      ? "border-brand-500 bg-brand-50 ring-2 ring-brand-500/25"
                      : "border-border bg-surface hover:border-brand-300 hover:bg-surface-2",
                  )}
                >
                  <AppImage src={c.imageUrl} alt="" className="h-12 w-12 shrink-0 rounded-xl" icon="box" iconSize={20} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-foreground">{pick(c, "name", locale)}</span>
                    {typeof c.productCount === "number" ? (
                      <span className="block text-xs text-muted-foreground">{c.productCount}</span>
                    ) : null}
                  </span>
                  <Check on={on} />
                </button>
              );
            })}
          </div>

          <Nav
            right={
              <button
                type="button"
                disabled={!cats.length}
                onClick={() => setStep(2)}
                className={primaryBtn}
              >
                {labels.next}
                <Icon name="arrow-right" size={16} className="rtl:rotate-180" />
              </button>
            }
            left={
              <button type="button" onClick={() => setStep(3)} className="text-sm font-medium text-muted-foreground underline hover:text-brand-700">
                {labels.skip}
              </button>
            }
          />
        </section>
      ) : null}

      {/* ---------- 2. Products ---------- */}
      {step === 2 ? (
        <section aria-labelledby="quote-step-2">
          <h2 id="quote-step-2" className="text-lg font-semibold text-foreground">
            {labels.productsTitle}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">{labels.productsHint}</p>

          {/* What is already on the list, shown before the products finish
              loading — arriving from a product page, this is the visitor's
              confirmation that the thing they clicked is in the basket. */}
          {pickedList.length ? (
            <ul className="mt-4 flex flex-wrap gap-1.5">
              {pickedList.map((p) => (
                <li key={p.slug}>
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-300 bg-brand-50 py-1 pe-1 ps-3 text-xs font-medium text-brand-700">
                    {pick(p, "name", locale)}
                    <button
                      type="button"
                      onClick={() => togglePick(p)}
                      aria-label={`${labels.remove}: ${pick(p, "name", locale)}`}
                      className="flex h-5 w-5 items-center justify-center rounded-full transition hover:bg-brand-200"
                    >
                      <Icon name="close" size={12} />
                    </button>
                  </span>
                </li>
              ))}
            </ul>
          ) : null}

          <div className="relative mt-4">
            <Icon name="search" size={16} className="pointer-events-none absolute start-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/70" />
            <input
              type="search"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder={labels.searchProducts}
              aria-label={labels.searchProducts}
              className={cx(inputCls, "ps-10")}
            />
          </div>

          <div className="mt-5 space-y-6">
            {groups.map((g) => (
              <div key={g.slug}>
                <div className="mb-2 flex items-center justify-between gap-2">
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground/70">{g.name}</h3>
                  <button
                    type="button"
                    onClick={() => toggleCat(g.slug)}
                    className="text-xs font-medium text-muted-foreground hover:text-brand-700"
                  >
                    {labels.remove}
                  </button>
                </div>
                {g.loading ? (
                  <ul className="space-y-2" aria-busy="true" aria-label={labels.loading}>
                    {[0, 1, 2].map((i) => (
                      <li key={i} className="shimmer h-16 rounded-xl border border-border bg-surface-2" />
                    ))}
                  </ul>
                ) : g.items.length ? (
                  <ul className="grid gap-2 sm:grid-cols-2">
                    {g.items.map((p) => {
                      const on = !!picked[p.slug];
                      const price = formatPrice(p.price, locale);
                      return (
                        <li key={p.id}>
                          <button
                            type="button"
                            onClick={() => togglePick(p)}
                            aria-pressed={on}
                            className={cx(
                              "flex w-full items-center gap-3 rounded-xl border p-2.5 text-start transition",
                              on
                                ? "border-brand-500 bg-brand-50 ring-2 ring-brand-500/25"
                                : "border-border bg-surface hover:border-brand-300 hover:bg-surface-2",
                            )}
                          >
                            <AppImage src={p.imageUrl} alt="" className="h-11 w-11 shrink-0 rounded-lg" icon="box" iconSize={18} />
                            <span className="min-w-0 flex-1">
                              <span className="block truncate text-sm font-medium text-foreground">{pick(p, "name", locale)}</span>
                              <span className="block truncate text-xs text-muted-foreground">
                                {[p.sku, price].filter(Boolean).join(" · ")}
                              </span>
                            </span>
                            <Check on={on} />
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <p className="rounded-xl border border-dashed border-border px-4 py-3 text-sm text-muted-foreground">{labels.noProducts}</p>
                )}
              </div>
            ))}
          </div>

          <Nav
            left={
              <button type="button" onClick={() => setStep(1)} className={ghostBtn}>
                <Icon name="chevron-right" size={16} className="rotate-180 rtl:rotate-0" />
                {labels.back}
              </button>
            }
            right={
              <button type="button" onClick={() => setStep(3)} className={primaryBtn}>
                {labels.next}
                <Icon name="arrow-right" size={16} className="rtl:rotate-180" />
              </button>
            }
            count={pickedList.length ? `${pickedList.length} ${labels.selected}` : null}
          />
        </section>
      ) : null}

      {/* ---------- 3. Details ---------- */}
      {step === 3 ? (
        <form onSubmit={onSubmit} aria-labelledby="quote-step-3">
          <h2 id="quote-step-3" className="text-lg font-semibold text-foreground">
            {labels.detailsTitle}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">{labels.detailsHint}</p>

          {/* What they are asking about, still editable at the last moment. */}
          <div className="mt-5 rounded-2xl border border-border bg-surface-2/60 p-4">
            <div className="mb-3 flex items-center justify-between gap-2">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground/70">{labels.summary}</h3>
              <button type="button" onClick={() => setStep(cats.length ? 2 : 1)} className="text-xs font-semibold text-brand-600 hover:underline">
                {labels.addMore}
              </button>
            </div>
            {cats.length ? (
              <div className="mb-3 flex flex-wrap gap-1.5">
                {cats.map((slug) => (
                  <span key={slug} className="rounded-full border border-border bg-surface px-3 py-1 text-xs text-muted-foreground">
                    {catName(slug)}
                  </span>
                ))}
              </div>
            ) : null}
            {pickedList.length ? (
              <ul className="space-y-2">
                {pickedList.map((p) => (
                  <li key={p.slug} className="flex items-center gap-3 rounded-xl border border-border bg-surface p-2">
                    <AppImage src={p.imageUrl} alt="" className="h-10 w-10 shrink-0 rounded-lg" icon="box" iconSize={16} />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-foreground">{pick(p, "name", locale)}</span>
                      {p.sku ? <span className="block truncate text-xs text-muted-foreground">{p.sku}</span> : null}
                    </span>
                    <label className="flex items-center gap-1.5">
                      <span className="text-xs text-muted-foreground">{labels.qty}</span>
                      <input
                        type="number"
                        min={1}
                        max={99999}
                        value={p.qty}
                        onChange={(e) => setQty(p.slug, Number(e.target.value))}
                        className="h-9 w-20 rounded-lg border border-border bg-surface px-2 text-sm text-foreground focus:border-brand-500 focus:outline-none"
                        dir="ltr"
                      />
                    </label>
                    <button
                      type="button"
                      onClick={() => togglePick(p)}
                      aria-label={labels.remove}
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-muted-foreground transition hover:bg-surface-2 hover:text-red-600"
                    >
                      <Icon name="close" size={14} />
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">{labels.wholeCategory}</p>
            )}
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <Field label={labels.name} required>
              <input className={inputCls} value={form.name} onChange={setField("name")} required maxLength={200} autoComplete="name" />
            </Field>
            <Field label={labels.phone} required>
              <input className={inputCls} type="tel" value={form.phone} onChange={setField("phone")} required maxLength={50} autoComplete="tel" dir="ltr" />
            </Field>
            <Field label={labels.email}>
              <input className={inputCls} type="email" value={form.email} onChange={setField("email")} maxLength={200} autoComplete="email" dir="ltr" />
            </Field>
            <Field label={labels.company} required>
              <input className={inputCls} value={form.company} onChange={setField("company")} required maxLength={200} autoComplete="organization" />
            </Field>
          </div>
          <div className="mt-4">
            <Field label={labels.message}>
              <textarea className={inputCls} rows={4} value={form.message} onChange={setField("message")} maxLength={3000} placeholder={labels.messageHint} />
            </Field>
          </div>

          {error ? (
            <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
              {error}
            </p>
          ) : null}

          <Nav
            left={
              <button type="button" onClick={() => setStep(cats.length ? 2 : 1)} className={ghostBtn}>
                <Icon name="chevron-right" size={16} className="rotate-180 rtl:rotate-0" />
                {labels.back}
              </button>
            }
            right={
              <button type="submit" disabled={status === "sending"} className={primaryBtn}>
                <Icon name="mail" size={16} />
                {status === "sending" ? labels.sending : labels.send}
              </button>
            }
          />
        </form>
      ) : null}
    </div>
  );
}

const primaryBtn =
  "inline-flex items-center gap-2 rounded-xl bg-brand-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50 dark:text-[#0a1017]";
const ghostBtn =
  "inline-flex items-center gap-1.5 rounded-xl border border-border px-4 py-3 text-sm font-semibold text-muted-foreground transition hover:border-brand-300 hover:text-foreground";

/** The rail across the top. Completed steps are clickable, later ones are not. */
function Steps({ step, labels, onGo }: { step: 1 | 2 | 3; labels: [string, string, string]; onGo: (s: 1 | 2 | 3) => void }) {
  return (
    <ol className="mb-6 flex items-center gap-2" aria-label="Progress">
      {labels.map((label, i) => {
        const n = (i + 1) as 1 | 2 | 3;
        const done = n < step;
        const now = n === step;
        return (
          <li key={label} className={cx("flex min-w-0 items-center gap-2", i < 2 && "flex-1")}>
            <button
              type="button"
              onClick={() => onGo(n)}
              disabled={!done}
              aria-current={now ? "step" : undefined}
              className={cx("flex min-w-0 items-center gap-2", done && "cursor-pointer")}
            >
              <span
                className={cx(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold transition",
                  now
                    ? "bg-brand-600 text-white dark:text-[#0a1017]"
                    : done
                      ? "bg-brand-100 text-brand-700"
                      : "bg-surface-2 text-muted-foreground",
                )}
              >
                {done ? <Icon name="check" size={14} /> : n}
              </span>
              <span className={cx("hidden truncate text-xs font-semibold sm:block", now ? "text-foreground" : "text-muted-foreground")}>
                {label}
              </span>
            </button>
            {i < 2 ? <span className={cx("h-px flex-1 transition-colors", done ? "bg-brand-400" : "bg-border")} /> : null}
          </li>
        );
      })}
    </ol>
  );
}

function Nav({ left, right, count }: { left?: React.ReactNode; right: React.ReactNode; count?: string | null }) {
  return (
    <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-5">
      <div className="flex items-center gap-3">{left}</div>
      <div className="flex items-center gap-3">
        {count ? <span className="text-xs font-medium text-muted-foreground">{count}</span> : null}
        {right}
      </div>
    </div>
  );
}

function Check({ on }: { on: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={cx(
        "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition",
        on ? "border-brand-600 bg-brand-600 text-white dark:text-[#0a1017]" : "border-border bg-surface text-transparent",
      )}
    >
      <Icon name="check" size={14} />
    </span>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-foreground">
        {label}
        {required ? <span className="ms-0.5 text-red-500">*</span> : null}
      </span>
      {children}
    </label>
  );
}
