"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import type { Locale } from "@/lib/types";
import { cx } from "@/lib/utils";
import Icon from "./Icon";
import LanguageToggle from "./LanguageToggle";
import SiteLogo from "./SiteLogo";

export type NavLink = { href: string; label: string };

type Props = {
  locale: Locale;
  siteName: string;
  logoUrl: string | null;
  phone: string | null;
  links: NavLink[];
  labels: { callUs: string; openMenu: string; closeMenu: string; switchLanguage: string };
};

const subscribeNoop = () => () => {};

const NAV_ICONS: Record<string, string> = {
  "/": "building",
  "/products": "box",
  "/about-us": "compass",
  "/news": "news",
  "/contact": "mail",
  "/jobs": "handshake",
};

export default function HeaderClient({ locale, siteName, logoUrl, phone, links, labels }: Props) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);
  // true only after hydration, so the portal never renders on the server
  const mounted = useSyncExternalStore(subscribeNoop, () => true, () => false);

  // Close the drawer when the route changes (state adjusted during render, no effect needed).
  const [seenPath, setSeenPath] = useState(pathname);
  if (seenPath !== pathname) {
    setSeenPath(pathname);
    setOpen(false);
  }

  // Lock body scroll while open, close on Escape.
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

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));
  const tel = phone ? `tel:${phone.replace(/\s+/g, "")}` : null;

  const drawer = mounted
    ? createPortal(
        <div className={cx("lg:hidden", !open && "pointer-events-none")} aria-hidden={!open}>
          {/* backdrop */}
          <div
            className={cx(
              "fixed inset-0 z-[70] bg-gray-900/50 backdrop-blur-[2px] transition-opacity duration-300",
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
              "fixed inset-y-0 end-0 z-[80] flex w-[84%] max-w-sm flex-col bg-white shadow-2xl transition-transform duration-300 ease-[cubic-bezier(.22,1,.36,1)]",
              open ? "translate-x-0" : "translate-x-full rtl:-translate-x-full",
            )}
          >
            <div className="flex h-16 items-center justify-between border-b border-gray-200 px-4">
              <Link href="/" onClick={close} aria-label={siteName} className="flex items-center">
                <SiteLogo src={logoUrl} siteName={siteName} className="h-8" />
              </Link>
              <button
                type="button"
                onClick={close}
                className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-gray-600 transition hover:bg-gray-100 hover:text-gray-900"
                aria-label={labels.closeMenu}
              >
                <Icon name="close" size={20} />
              </button>
            </div>

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
                        isActive(l.href) ? "bg-brand-50 text-brand-700" : "text-gray-700 hover:bg-gray-100",
                      )}
                      aria-current={isActive(l.href) ? "page" : undefined}
                    >
                      <span
                        className={cx(
                          "flex h-9 w-9 items-center justify-center rounded-lg",
                          isActive(l.href) ? "bg-brand-600 text-white" : "bg-gray-100 text-brand-600",
                        )}
                      >
                        <Icon name={NAV_ICONS[l.href] ?? "star"} size={18} />
                      </span>
                      {l.label}
                      <Icon name="chevron-right" size={16} className="ms-auto text-gray-300 rtl:rotate-180" />
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            {tel ? (
              <div className="border-t border-gray-200 p-4">
                <a
                  href={tel}
                  onClick={close}
                  className="flex items-center justify-center gap-2 rounded-xl bg-brand-600 px-3 py-3 text-sm font-semibold text-white transition hover:bg-brand-700"
                >
                  <Icon name="phone" size={16} />
                  {labels.callUs}: <span dir="ltr">{phone}</span>
                </a>
              </div>
            ) : null}
          </aside>
        </div>,
        document.body,
      )
    : null;

  return (
    <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex shrink-0 items-center" aria-label={siteName}>
          <SiteLogo src={logoUrl} siteName={siteName} className="h-8 sm:h-9 lg:h-10" />
        </Link>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Main">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={cx(
                "rounded-lg px-3 py-2 text-sm font-medium transition",
                isActive(l.href) ? "bg-brand-50 text-brand-700" : "text-gray-600 hover:bg-gray-100 hover:text-gray-900",
              )}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <LanguageToggle locale={locale} label={labels.switchLanguage} />
          {tel ? (
            <a
              href={tel}
              className="hidden items-center gap-2 rounded-lg bg-brand-600 px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-brand-700 lg:inline-flex"
            >
              <Icon name="phone" size={16} />
              <span dir="ltr">{phone}</span>
            </a>
          ) : null}
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 text-gray-700 transition hover:bg-gray-100 lg:hidden"
            onClick={() => setOpen(true)}
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={labels.openMenu}
          >
            <Icon name="menu" size={20} />
          </button>
        </div>
      </div>
      {drawer}
    </header>
  );
}
