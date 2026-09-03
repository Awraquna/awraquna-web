"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Banner, Locale } from "@/lib/types";
import { imageUrl } from "@/lib/api";
import { cx, pick } from "@/lib/utils";
import Icon from "@/components/Icon";
import Container from "@/components/ui/Container";

type Props = {
  banners: Banner[];
  locale: Locale;
  fallback: { title: string; subtitle: string; ctaText: string; ctaUrl: string };
  labels: { secondaryCta: string; secondaryHref: string; badge: string };
};

const AUTOPLAY_MS = 6000;

/**
 * Home hero — a split layout: the campaign copy on one side, the banner artwork
 * floating in a rounded card on the other, over a soft brand-lit grid.
 *
 * Built for speed: every slide stays mounted and stacked, so switching only
 * toggles opacity (GPU compositing — no layout, no image re-request, no flash).
 * The first image is fetched with high priority and decoded off the main thread;
 * the rest load lazily. Autoplay pauses while the tab is hidden, while the hero
 * is hovered or focused, and for reduced-motion visitors. Swipe on touch, arrow
 * keys on desktop, prev/next buttons and dots.
 */
export default function HeroBanner({ banners, locale, fallback, labels }: Props) {
  const slides = banners.length
    ? banners.map((b) => ({
        id: b.id,
        title: pick(b, "title", locale) || fallback.title,
        subtitle: pick(b, "subtitle", locale),
        cta: pick(b, "ctaText", locale) || fallback.ctaText,
        url: b.ctaUrl || fallback.ctaUrl,
        image: imageUrl(b.imageUrl),
      }))
    : [{ id: 0, title: fallback.title, subtitle: fallback.subtitle, cta: fallback.ctaText, url: fallback.ctaUrl, image: null }];

  const count = slides.length;
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);

  const go = useCallback((i: number) => setIndex(((i % count) + count) % count), [count]);
  const next = useCallback(() => go(index + 1), [go, index]);
  const prev = useCallback(() => go(index - 1), [go, index]);

  // Autoplay: one timer, reset on manual change, paused when hidden / hovered / reduced motion.
  useEffect(() => {
    if (count <= 1 || paused) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let timer: number | undefined;
    const start = () => {
      stop();
      if (document.visibilityState === "visible") timer = window.setTimeout(() => setIndex((i) => (i + 1) % count), AUTOPLAY_MS);
    };
    const stop = () => {
      if (timer) window.clearTimeout(timer);
    };
    start();
    document.addEventListener("visibilitychange", start);
    return () => {
      stop();
      document.removeEventListener("visibilitychange", start);
    };
  }, [count, paused, index]);

  const onKey = (e: React.KeyboardEvent) => {
    if (count <= 1) return;
    const rtl = locale === "ar";
    if (e.key === "ArrowRight") {
      if (rtl) prev();
      else next();
    } else if (e.key === "ArrowLeft") {
      if (rtl) next();
      else prev();
    }
  };
  const onTouchStart = (e: React.TouchEvent) => (touchStartX.current = e.touches[0].clientX);
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(dx) < 40) return;
    const rtl = locale === "ar";
    if ((dx < 0) !== rtl) next();
    else prev();
  };

  const active = slides[index];
  const hasArt = slides.some((s) => s.image);

  return (
    <section
      className="relative isolate overflow-hidden border-b border-border bg-background"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
      onKeyDown={onKey}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      aria-roledescription="carousel"
    >
      {/* Ambient layer: a faint grid, two drifting brand glows, both masked so
          they fade out before they reach an edge. */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="bg-grid mask-fade absolute inset-0 opacity-60" />
        <div className="animate-aurora absolute -top-32 start-[-8%] h-[26rem] w-[26rem] rounded-full bg-[var(--brand-soft)] blur-3xl" />
        <div
          className="animate-aurora absolute -bottom-40 end-[-6%] h-[24rem] w-[24rem] rounded-full bg-[var(--brand-soft)] blur-3xl"
          style={{ animationDelay: "-8s" }}
        />
      </div>

      <Container className="relative grid items-center gap-10 py-14 lg:grid-cols-2 lg:gap-14 lg:py-20">
        {/* ---- Copy. Slides are stacked in one grid cell so the tallest sets the
             height and nothing jumps between them. ---- */}
        <div className="grid">
          {slides.map((s, i) => {
            const on = i === index;
            return (
              <div
                key={s.id}
                aria-hidden={!on}
                className={cx(
                  "col-start-1 row-start-1 flex flex-col items-start transition-[opacity,transform] duration-500 ease-out",
                  on ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-2 opacity-0",
                )}
              >
                <span className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-3 py-1.5 text-xs font-semibold text-brand-700">
                  <Icon name="sparkles" size={14} />
                  {labels.badge}
                </span>

                <h1 className="mt-5 max-w-2xl text-3xl font-extrabold leading-[1.15] tracking-tight text-foreground sm:text-4xl lg:text-[3.25rem]">
                  <Accented text={s.title} />
                </h1>

                {s.subtitle ? (
                  <p className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">{s.subtitle}</p>
                ) : null}

                <div className="mt-8 flex flex-wrap items-center gap-3">
                  <Link
                    href={s.url}
                    tabIndex={on ? 0 : -1}
                    className="inline-flex items-center gap-2 rounded-full bg-brand-600 px-6 py-3.5 text-sm font-semibold text-white shadow-[0_14px_34px_-14px_var(--brand-600)] transition-all hover:bg-brand-700 hover:shadow-[0_20px_44px_-14px_var(--brand-600)] dark:text-[#0a1017]"
                  >
                    {s.cta}
                    <Icon name="arrow-right" size={16} className="rtl:rotate-180" />
                  </Link>
                  <Link
                    href={labels.secondaryHref}
                    tabIndex={on ? 0 : -1}
                    className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-6 py-3.5 text-sm font-semibold text-foreground transition-colors hover:border-brand-400 hover:text-brand-600"
                  >
                    <Icon name="headset" size={16} />
                    {labels.secondaryCta}
                  </Link>
                </div>
              </div>
            );
          })}

          {count > 1 ? (
            <div className="col-start-1 row-start-2 mt-10 flex items-center gap-3">
              <button
                type="button"
                onClick={prev}
                aria-label="Previous slide"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-surface text-foreground transition-colors hover:border-brand-400 hover:text-brand-600"
              >
                <Icon name="chevron-right" size={16} className="rotate-180 rtl:rotate-0" />
              </button>
              <div className="flex gap-2" role="tablist" aria-label="Slides">
                {slides.map((s, i) => (
                  <button
                    key={s.id}
                    type="button"
                    role="tab"
                    aria-selected={i === index}
                    aria-label={`Slide ${i + 1}`}
                    onClick={() => go(i)}
                    className={cx(
                      "h-2 rounded-full transition-all duration-300",
                      i === index ? "w-8 bg-brand-600" : "w-2 bg-border hover:bg-brand-300",
                    )}
                  />
                ))}
              </div>
              <button
                type="button"
                onClick={next}
                aria-label="Next slide"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-surface text-foreground transition-colors hover:border-brand-400 hover:text-brand-600"
              >
                <Icon name="chevron-right" size={16} className="rtl:rotate-180" />
              </button>
            </div>
          ) : null}
        </div>

        {/* ---- Artwork ---- */}
        <div className="relative">
          <div className="animate-float relative aspect-[4/3] w-full overflow-hidden rounded-[28px] border border-border bg-surface shadow-[0_40px_90px_-40px_rgb(16_24_40_/_0.45)] lg:aspect-[5/4]">
            {hasArt ? (
              slides.map((s, i) =>
                s.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={s.id}
                    src={s.image}
                    alt=""
                    aria-hidden="true"
                    loading={i === 0 ? "eager" : "lazy"}
                    fetchPriority={i === 0 ? "high" : "low"}
                    decoding="async"
                    draggable={false}
                    className={cx(
                      "absolute inset-0 h-full w-full select-none object-cover transition-opacity duration-700 ease-out",
                      i === index ? "opacity-100" : "opacity-0",
                    )}
                  />
                ) : null,
              )
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-brand-50 via-surface to-brand-100" />
            )}
            {!hasArt ? (
              <div className="absolute inset-0 flex items-center justify-center text-brand-300">
                <Icon name="printer" size={96} strokeWidth={1} />
              </div>
            ) : null}
            {/* A whisper of brand over the photo so it belongs to the palette. */}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-brand-900/25 via-transparent to-transparent" />
          </div>

          {/* Floating chip naming the campaign currently on show. Only earns its
              place when there is more than one slide to keep track of. */}
          {count > 1 ? (
            <div className="absolute -bottom-4 start-4 hidden max-w-[75%] items-center gap-3 rounded-2xl border border-border bg-surface/90 px-4 py-3 shadow-lg backdrop-blur-md sm:flex">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-600 text-white dark:text-[#0a1017]">
                <Icon name="sparkles" size={18} />
              </span>
              <span className="min-w-0">
                <span className="block truncate text-sm font-semibold text-foreground">{active.cta}</span>
                <span className="block truncate text-xs text-muted-foreground" dir="ltr">
                  {index + 1} / {count}
                </span>
              </span>
            </div>
          ) : null}
        </div>
      </Container>
    </section>
  );
}

/**
 * Paints the last two words of the headline with the brand gradient. Purely
 * typographic emphasis — the whole string still reads as one sentence to a
 * screen reader.
 */
function Accented({ text }: { text: string }) {
  const words = text.trim().split(/\s+/);
  if (words.length < 4) return <>{text}</>;
  const head = words.slice(0, -2).join(" ");
  const tail = words.slice(-2).join(" ");
  return (
    <>
      {head} <span className="text-gradient">{tail}</span>
    </>
  );
}
