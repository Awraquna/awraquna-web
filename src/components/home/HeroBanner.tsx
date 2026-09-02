"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Banner, Locale } from "@/lib/types";
import { imageUrl } from "@/lib/api";
import { cx, pick } from "@/lib/utils";
import Icon from "@/components/Icon";

type Props = {
  banners: Banner[];
  locale: Locale;
  fallback: { title: string; subtitle: string; ctaText: string; ctaUrl: string };
};

const AUTOPLAY_MS = 6000;

/**
 * Hero slider built for speed:
 *  - every slide stays mounted and stacked; switching only toggles opacity (GPU compositing,
 *    no layout, no image re-request, no flash);
 *  - the first image is fetched with high priority and decoded off the main thread; the others
 *    load lazily after the page is interactive;
 *  - autoplay pauses while the tab is hidden, while hovered/focused, and for reduced-motion users;
 *  - swipe on touch, arrow keys on desktop, prev/next buttons and dots.
 */
export default function HeroBanner({ banners, locale, fallback }: Props) {
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

  return (
    <section
      className="group relative overflow-hidden bg-brand-800 text-white"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
      onKeyDown={onKey}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      aria-roledescription="carousel"
    >
      {/* Backgrounds: all mounted, only opacity changes. */}
      {slides.map((s, i) =>
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
              "absolute inset-0 h-full w-full select-none object-cover transition-opacity duration-700 ease-out will-change-[opacity]",
              i === index ? "opacity-30" : "opacity-0",
            )}
          />
        ) : (
          <div
            key={s.id}
            aria-hidden="true"
            className={cx(
              "absolute inset-0 bg-gradient-to-br from-brand-700 via-brand-800 to-brand-900 transition-opacity duration-700 ease-out",
              i === index ? "opacity-100" : "opacity-0",
            )}
          />
        ),
      )}
      <div className="pointer-events-none absolute -end-24 -top-24 h-72 w-72 rounded-full bg-brand-500/30 blur-3xl" />

      {/* Text: slides stacked in a grid cell so the tallest one sets the height (no jump). */}
      <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
        <div className="grid">
          {slides.map((s, i) => {
            const active = i === index;
            return (
              <div
                key={s.id}
                aria-hidden={!active}
                className={cx(
                  "col-start-1 row-start-1 flex flex-col items-start gap-6 transition-[opacity,transform] duration-500 ease-out",
                  active ? "opacity-100 translate-y-0" : "pointer-events-none opacity-0 translate-y-2",
                )}
              >
                <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-brand-100 ring-1 ring-white/20">
                  <Icon name="award" size={14} />
                  Saudi Arabia
                </span>
                <h1 className="max-w-3xl text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl">{s.title}</h1>
                {s.subtitle ? <p className="max-w-2xl text-base text-brand-100 sm:text-lg">{s.subtitle}</p> : null}
                <Link
                  href={s.url}
                  tabIndex={active ? 0 : -1}
                  className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-semibold text-brand-800 shadow transition hover:bg-brand-50"
                >
                  {s.cta}
                  <Icon name="arrow-right" size={16} className="rtl:rotate-180" />
                </Link>
              </div>
            );
          })}
        </div>

        {count > 1 ? (
          <div className="mt-8 flex items-center gap-3">
            <button
              type="button"
              onClick={prev}
              aria-label="Previous slide"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white ring-1 ring-white/20 transition hover:bg-white/20"
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
                  className={cx("h-2.5 rounded-full transition-all duration-300", i === index ? "w-8 bg-white" : "w-2.5 bg-white/40 hover:bg-white/70")}
                />
              ))}
            </div>
            <button
              type="button"
              onClick={next}
              aria-label="Next slide"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white ring-1 ring-white/20 transition hover:bg-white/20"
            >
              <Icon name="chevron-right" size={16} className="rtl:rotate-180" />
            </button>
          </div>
        ) : null}
      </div>
    </section>
  );
}
