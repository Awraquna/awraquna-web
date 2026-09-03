"use client";

import { useEffect, useSyncExternalStore } from "react";
import { cx } from "@/lib/utils";
import { DARK_CLASS, THEME_KEY } from "@/lib/theme";
import Icon from "@/components/Icon";

/**
 * The `dark` class on <html> IS the store — the pre-paint script in layout.tsx
 * writes it before React exists, and any other toggle on the page writes it too.
 * Reading it through useSyncExternalStore (rather than mirroring it into state)
 * keeps every toggle in sync and gives hydration a defined server snapshot.
 */
function subscribe(onChange: () => void) {
  const mo = new MutationObserver(onChange);
  mo.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
  return () => mo.disconnect();
}
const isDark = () => document.documentElement.classList.contains(DARK_CLASS);
const serverSnapshot = () => false;

export default function ThemeToggle({ className, label = "Toggle theme" }: { className?: string; label?: string }) {
  const dark = useSyncExternalStore(subscribe, isDark, serverSnapshot);

  // Follow the OS for as long as the visitor has not picked a side.
  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = (e: MediaQueryListEvent) => {
      let stored: string | null = null;
      try {
        stored = localStorage.getItem(THEME_KEY);
      } catch {
        /* ignore */
      }
      if (stored) return;
      document.documentElement.classList.toggle(DARK_CLASS, e.matches);
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return (
    <button
      type="button"
      onClick={() => {
        const next = !isDark();
        document.documentElement.classList.toggle(DARK_CLASS, next);
        try {
          localStorage.setItem(THEME_KEY, next ? "dark" : "light");
        } catch {
          /* private mode — the choice just does not persist */
        }
      }}
      aria-label={label}
      title={label}
      aria-pressed={dark}
      className={cx(
        "group relative inline-flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full border border-border bg-surface text-foreground transition-colors hover:border-brand-400 hover:text-brand-600",
        className,
      )}
    >
      {/* Both glyphs are mounted inside a one-glyph-tall window; the pair slides so
          the active one is the one on show. */}
      <span aria-hidden="true" className="block h-[18px] w-[18px] overflow-hidden">
        <span
          className={cx(
            "flex flex-col transition-transform duration-300 ease-[cubic-bezier(.22,1,.36,1)]",
            dark && "-translate-y-[18px]",
          )}
        >
          <Icon name="sun" size={18} className="shrink-0" />
          <Icon name="moon" size={18} className="shrink-0" />
        </span>
      </span>
    </button>
  );
}
