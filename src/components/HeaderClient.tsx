"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import type { BusinessArea, Category, Locale } from "@/lib/types";
import { cx } from "@/lib/utils";
import Icon from "./Icon";
import LanguageToggle from "./LanguageToggle";
import SiteLogo from "./SiteLogo";
import ThemeToggle from "./ui/ThemeToggle";
import ProductsMegaMenu, { type MegaLabels } from "./header/ProductsMegaMenu";

export type NavLink = { href: string; label: string; icon: string; panel?: "products" };

type Props = {
  locale: Locale;
  siteName: string;
  logoUrl: string | null;
  phone: string | null;
  links: NavLink[];
  categories: Category[];
  areas: BusinessArea[];
  labels: {
    callUs: string;
    openMenu: string;
    closeMenu: string;
    switchLanguage: string;
    theme: string;
    search: string;
    searchPlaceholder: string;
    contactUs: string;
    mega: MegaLabels;
  };
};

const subscribeNoop = () => () => {};

/**
 * The site header: a floating pill that hugs its content — expanded (icon +
 * label) at the top of the page, shrunk to icons once you scroll into it, and
 * expanded again when you come back up. One transition each way.
 *
 * The active section is marked by a single brand pill that slides between items
 * rather than one background per link, so switching pages reads as one movement.
 * That indicator is positioned by direct DOM writes rather than React state:
 * during the collapse the active item moves every frame, and re-rendering the
 * nav that often is what makes a bar like this stutter.
 *
 * Below `lg` the whole thing collapses to a compact bar plus a slide-in drawer.
 */
export default function HeaderClient({ locale, siteName, logoUrl, phone, links, categories, areas, labels }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);
  // true only after hydration, so the portal never renders on the server
  const mounted = useSyncExternalStore(subscribeNoop, () => true, () => false);

  // One state, driven by scroll POSITION rather than scroll activity: the bar is
  // expanded at the top of the page and compact once you are into it.
  //
  // Keying this to activity instead ("collapse while moving, re-expand 260ms
  // after stopping") is what made the bar dance — a normal read-scroll is
  // scroll, pause, scroll, pause, so it flipped on every single burst. Position
  // gives one transition down and one back up, however the visitor scrolls.
  const [compact, setCompact] = useState(false);

  // Hover mega-menu.
  const [panel, setPanel] = useState<"products" | null>(null);
  const closeTimer = useRef<number | null>(null);

  // Inline search inside the pill.
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const searchInput = useRef<HTMLInputElement | null>(null);

  // Sliding active-item indicator. Deliberately NOT React state: while the bar
  // collapses, the active item moves every frame, and re-rendering the whole nav
  // (six links plus the mega-menu) 60 times a second is what made the old
  // version stutter. syncPill writes straight to the node instead.
  const listRef = useRef<HTMLDivElement | null>(null);
  const pillRef = useRef<HTMLSpanElement | null>(null);

  const isActive = useCallback(
    (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href)),
    [pathname],
  );

  // Close the drawer when the route changes (state adjusted during render, no effect needed).
  const [seenPath, setSeenPath] = useState(pathname);
  if (seenPath !== pathname) {
    setSeenPath(pathname);
    setOpen(false);
    setPanel(null);
  }

  // Lock body scroll while the drawer is open, close on Escape.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, close]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setPanel(null);
      setSearchOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // rAF-throttled, and it writes state only when the boolean actually flips, so
  // scrolling the length of the page costs exactly two renders. The collapse and
  // expand thresholds are far apart, so no amount of nudging around the boundary
  // can make the bar flip back and forth.
  useEffect(() => {
    let frame = 0;
    let on = false;
    const read = () => {
      frame = 0;
      const y = window.scrollY;
      const next = on ? y > 40 : y > 120;
      if (next !== on) {
        on = next;
        setCompact(next);
      }
      // Closing the mega-menu is conditional: the common case (nothing open)
      // does not touch state at all.
      setPanel((p) => (p === null ? p : null));
    };
    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(read);
    };
    // Seed through the same path, so a page restored mid-scroll starts in the
    // right state without a synchronous write in the effect body.
    frame = window.requestAnimationFrame(read);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  /** Glues the indicator to the active item. Pure DOM writes — no render. */
  const syncPill = useCallback(() => {
    const list = listRef.current;
    const pill = pillRef.current;
    if (!list || !pill) return;
    const el = list.querySelector<HTMLElement>('[data-nav-active="true"]');
    if (!el) {
      pill.style.opacity = "0";
      return;
    }
    const box = list.getBoundingClientRect();
    const item = el.getBoundingClientRect();
    // Physical offsets: CSS transforms are not mirrored in RTL, so measuring
    // from the container's left edge is correct in both directions.
    pill.style.width = `${item.width}px`;
    pill.style.transform = `translateX(${item.left - box.left}px)`;
    pill.style.opacity = "1";
  }, []);

  // Navigation and language switches: one write, and the pill's own CSS
  // transition slides it across to the new section.
  useLayoutEffect(() => {
    syncPill();
  }, [pathname, locale, links, syncPill]);

  // Collapse / expand: the active item is physically moving for the length of
  // the width transition, so track it frame by frame with the pill's transition
  // switched off — left on, the pill would chase its own target 300ms behind.
  useLayoutEffect(() => {
    const pill = pillRef.current;
    if (!pill) return;
    const restore = pill.style.transition;
    pill.style.transition = "none";
    let frame = 0;
    const until = performance.now() + 420;
    const tick = () => {
      syncPill();
      if (performance.now() < until) {
        frame = window.requestAnimationFrame(tick);
        return;
      }
      frame = 0;
      pill.style.transition = restore;
    };
    frame = window.requestAnimationFrame(tick);
    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      pill.style.transition = restore;
    };
  }, [compact, syncPill]);

  useLayoutEffect(() => {
    const onResize = () => syncPill();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [syncPill]);

  const cancelClose = () => {
    if (closeTimer.current) window.clearTimeout(closeTimer.current);
  };
  const hoverItem = (id: NavLink["panel"]) => {
    cancelClose();
    setPanel(id ?? null);
  };
  const scheduleClose = () => {
    cancelClose();
    closeTimer.current = window.setTimeout(() => setPanel(null), 220);
  };

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    if (!searchOpen) {
      setSearchOpen(true);
      window.setTimeout(() => searchInput.current?.focus(), 60);
      return;
    }
    if (!q) {
      setSearchOpen(false);
      return;
    }
    router.push(`/products?search=${encodeURIComponent(q)}`);
    setSearchOpen(false);
    setQuery("");
  };

  const tel = phone ? `tel:${phone.replace(/\s+/g, "")}` : null;
  const iconBtn =
    "inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border bg-surface text-foreground transition-colors hover:border-brand-400 hover:text-brand-600";

  const drawer = mounted
    ? createPortal(
        <div className={cx("lg:hidden", !open && "pointer-events-none")} aria-hidden={!open}>
          {/* backdrop */}
          <div
            className={cx(
              "fixed inset-0 z-[70] bg-slate-950/55 backdrop-blur-[3px] transition-opacity duration-300",
              open ? "opacity-100" : "opacity-0",
            )}
            onClick={close}
          />
          {/* panel slides in from the inline-end edge (right in LTR, left in RTL) */}
          <aside
            id="mobile-nav"
            role="dialog"
            aria-modal="true"
            aria-label={labels.openMenu}
            className={cx(
              "fixed inset-y-0 end-0 z-[80] flex w-[86%] max-w-sm flex-col bg-surface shadow-2xl transition-transform duration-300 ease-[cubic-bezier(.22,1,.36,1)]",
              open ? "translate-x-0" : "translate-x-full rtl:-translate-x-full",
            )}
          >
            <div className="flex h-16 items-center justify-between border-b border-border px-4">
              <Link href="/" onClick={close} aria-label={siteName} className="flex items-center">
                <SiteLogo src={logoUrl} siteName={siteName} className="h-8" />
              </Link>
              <button
                type="button"
                onClick={close}
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-muted-foreground transition hover:bg-surface-2 hover:text-foreground"
                aria-label={labels.closeMenu}
              >
                <Icon name="close" size={20} />
              </button>
            </div>

            <form onSubmit={submitSearch} className="border-b border-border p-4" role="search">
              <div className="flex items-center gap-2 rounded-xl border border-border bg-surface-2 px-3">
                <Icon name="search" size={16} className="shrink-0 text-muted-foreground" />
                <input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={labels.searchPlaceholder}
                  aria-label={labels.search}
                  className="h-11 w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
                />
              </div>
            </form>

            <nav className="flex-1 overflow-y-auto px-3 py-4" aria-label="Mobile">
              <ul className="space-y-1">
                {links.map((l, i) => (
                  <li
                    key={l.href}
                    className={cx("drawer-item", open && "drawer-item-in")}
                    style={{ transitionDelay: open ? `${80 + i * 40}ms` : "0ms" }}
                  >
                    <Link
                      href={l.href}
                      onClick={close}
                      className={cx(
                        "flex items-center gap-3 rounded-xl px-3 py-3 text-[15px] font-medium transition",
                        isActive(l.href) ? "bg-brand-50 text-brand-700" : "text-foreground hover:bg-surface-2",
                      )}
                      aria-current={isActive(l.href) ? "page" : undefined}
                    >
                      <span
                        className={cx(
                          "flex h-9 w-9 items-center justify-center rounded-lg",
                          isActive(l.href) ? "bg-brand-600 text-white dark:text-[#0a1017]" : "bg-surface-2 text-brand-600",
                        )}
                      >
                        <Icon name={l.icon} size={18} />
                      </span>
                      {l.label}
                      <Icon name="chevron-right" size={16} className="ms-auto text-muted-foreground/50 rtl:rotate-180" />
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            <div className="space-y-3 border-t border-border p-4">
              <LanguageToggle locale={locale} label={labels.switchLanguage} variant="wide" onSwitched={close} />
              {tel ? (
                <a
                  href={tel}
                  onClick={close}
                  className="flex items-center justify-center gap-2 rounded-xl bg-brand-600 px-3 py-3 text-sm font-semibold text-white transition hover:bg-brand-700 dark:text-[#0a1017]"
                >
                  <Icon name="phone" size={16} />
                  {labels.callUs}: <span dir="ltr">{phone}</span>
                </a>
              ) : null}
            </div>
          </aside>
        </div>,
        document.body,
      )
    : null;

  return (
    <header className="sticky top-0 z-50">
      {/* ---------- Desktop: the floating pill ---------- */}
      <div className="pointer-events-none hidden w-full justify-center px-3 py-3 lg:flex">
        <div className="pointer-events-auto relative flex w-full max-w-[86rem] justify-center" onMouseLeave={scheduleClose}>
          <ProductsMegaMenu
            open={panel === "products"}
            categories={categories}
            areas={areas}
            locale={locale}
            labels={labels.mega}
            onClose={() => setPanel(null)}
            onEnter={cancelClose}
          />

          <nav
            aria-label="Main"
            className={cx(
              "flex max-w-full items-center rounded-[28px] border border-border backdrop-blur-xl transition-[background-color,box-shadow,padding,gap] duration-300 ease-out",
              compact
                ? "gap-0.5 bg-surface/95 px-2 py-1.5 shadow-[0_16px_44px_-20px_rgb(16_24_40_/_0.45)]"
                : "gap-1 bg-surface/72 px-3 py-2 shadow-[0_24px_60px_-24px_rgb(16_24_40_/_0.3)]",
            )}
          >
            <Link href="/" aria-label={siteName} className="me-1 flex shrink-0 items-center transition-transform duration-200 hover:scale-105">
              <SiteLogo src={logoUrl} siteName={siteName} className={cx("transition-all duration-300 ease-out", compact ? "h-7" : "h-9")} />
            </Link>

            <span className="mx-1 h-7 w-px shrink-0 bg-border" />

            <div ref={listRef} className="relative flex items-stretch gap-0.5">
              {/* One indicator for the whole bar — it slides between items instead
                  of each link owning a background. */}
              <span
                ref={pillRef}
                aria-hidden="true"
                // Painted before the links in DOM order, so the (relative) links
                // sit on top of it. Position and width come from syncPill.
                className="absolute inset-y-0 left-0 rounded-2xl bg-brand-600 opacity-0 transition-[transform,width] duration-300 ease-[cubic-bezier(.22,1,.36,1)]"
              />
              {links.map((l) => {
                const active = isActive(l.href);
                return (
                  <div key={l.href} className="shrink-0" onMouseEnter={() => hoverItem(l.panel)}>
                    <Link
                      href={l.href}
                      data-nav-active={active || undefined}
                      aria-current={active ? "page" : undefined}
                      title={l.label}
                      className={cx(
                        "group relative flex flex-col items-center justify-center gap-0.5 rounded-2xl px-2.5 py-1.5 transition-colors",
                        active ? "text-white dark:text-[#0a1017]" : "text-muted-foreground hover:text-foreground",
                      )}
                    >
                      <span className="flex items-center gap-0.5">
                        <Icon
                          name={l.icon}
                          size={18}
                          className="shrink-0 transition-transform duration-200 group-hover:-translate-y-0.5"
                        />
                        {/* Only while the labels are shown, so collapsed items are
                            pure icons of equal width and space evenly. */}
                        {l.panel && !compact ? (
                          <Icon
                            name="chevron-down"
                            size={12}
                            className={cx("shrink-0 opacity-70 transition-transform duration-200", panel === l.panel && "rotate-180")}
                          />
                        ) : null}
                      </span>
                      {/* Collapses BOTH width and height, so the
                          icons close up evenly instead of leaving a gap where the
                          label was. leading-tight keeps Arabic descenders
                          (ة / ي / ج) clear of the overflow clip. */}
                      <span
                        className={cx(
                          "overflow-hidden whitespace-nowrap text-[10px] font-medium leading-tight transition-[max-width,max-height,opacity,margin-top] duration-300 ease-out",
                          compact ? "mt-0 max-h-0 max-w-0 opacity-0" : "mt-0.5 max-h-5 max-w-[140px] opacity-100",
                        )}
                      >
                        {l.label}
                      </span>
                    </Link>
                  </div>
                );
              })}
            </div>

            <span className="mx-1.5 h-7 w-px shrink-0 bg-border" />

            <form onSubmit={submitSearch} role="search" className="flex items-center">
              <input
                ref={searchInput}
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onBlur={() => !query && setSearchOpen(false)}
                placeholder={labels.searchPlaceholder}
                aria-label={labels.search}
                aria-hidden={!searchOpen}
                tabIndex={searchOpen ? 0 : -1}
                className={cx(
                  "h-10 rounded-full border border-border bg-surface-2 text-sm text-foreground outline-none transition-all duration-300 placeholder:text-muted-foreground focus:border-brand-400",
                  searchOpen ? "me-1.5 w-52 px-4 opacity-100" : "pointer-events-none w-0 border-transparent px-0 opacity-0",
                )}
              />
              <button type="submit" className={iconBtn} aria-label={labels.search} title={labels.search}>
                <Icon name="search" size={18} />
              </button>
            </form>

            <span className="w-1.5" />
            <LanguageToggle locale={locale} label={labels.switchLanguage} />
            <span className="w-1.5" />
            <ThemeToggle label={labels.theme} />

            {tel ? (
              <a
                href={tel}
                className="ms-2 inline-flex shrink-0 items-center gap-2 rounded-full bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-[0_10px_24px_-12px_var(--brand-600)] transition-transform hover:scale-[1.03] dark:text-[#0a1017]"
              >
                <Icon name="phone" size={16} />
                <span dir="ltr">{phone}</span>
              </a>
            ) : (
              <Link
                href="/contact"
                className="ms-2 inline-flex shrink-0 items-center gap-2 rounded-full bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white transition-transform hover:scale-[1.03] dark:text-[#0a1017]"
              >
                {labels.contactUs}
              </Link>
            )}
          </nav>
        </div>
      </div>

      {/* ---------- Mobile / tablet: compact bar ---------- */}
      <div className="px-3 py-2.5 lg:hidden">
        <div
          className={cx(
            "flex h-14 items-center justify-between gap-2 rounded-2xl border border-border px-3 backdrop-blur-xl transition-[background-color,box-shadow] duration-300",
            compact ? "bg-surface/95 shadow-[0_12px_30px_-16px_rgb(16_24_40_/_0.45)]" : "bg-surface/80 shadow-sm",
          )}
        >
          <Link href="/" className="flex shrink-0 items-center" aria-label={siteName}>
            <SiteLogo src={logoUrl} siteName={siteName} className="h-8" />
          </Link>
          <div className="flex items-center gap-2">
            <ThemeToggle label={labels.theme} />
            <button
              type="button"
              className={iconBtn}
              onClick={() => setOpen(true)}
              aria-expanded={open}
              aria-controls="mobile-nav"
              aria-label={labels.openMenu}
            >
              <Icon name="menu" size={20} />
            </button>
          </div>
        </div>
      </div>

      {drawer}
    </header>
  );
}
