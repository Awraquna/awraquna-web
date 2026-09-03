"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import type { Locale } from "@/lib/types";
import { cx } from "@/lib/utils";

type Props = {
  locale: Locale;
  /** Accessible label for the switch. */
  label?: string;
  /** "pill" (header) or "wide" (inside the mobile drawer). */
  variant?: "pill" | "wide";
  className?: string;
  onSwitched?: () => void;
};

const NAMES: Record<Locale, string> = { en: "English", ar: "العربية" };

type DocWithVT = Document & {
  startViewTransition?: (update: () => Promise<void> | void) => { finished: Promise<void> };
};

function setLocaleCookie(l: Locale) {
  document.cookie = `locale=${l}; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`;
}

/** Marks <html> with the language being switched to; globals.css picks the slide direction from it. */
function markSwitch(l: Locale | null) {
  if (l) document.documentElement.dataset.langSwitch = l;
  else delete document.documentElement.dataset.langSwitch;
}

function canViewTransition(doc: DocWithVT): boolean {
  return typeof doc.startViewTransition === "function" && !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Seamless EN / AR switch. The current page stays on screen, untouched, while the server
 * re-renders it in the other language; when the new markup is ready the browser crossfades the
 * old page into the new one in place (View Transitions API, see globals.css). Nothing that
 * looks like "loading" is ever shown. Browsers without View Transitions just swap.
 */
export default function LanguageToggle({ locale, label, variant = "pill", className, onSwitched }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [target, setTarget] = useState<Locale | null>(null); // optimistic knob position
  const resolveRefresh = useRef<(() => void) | null>(null);
  const armed = useRef(false);

  const next: Locale = locale === "ar" ? "en" : "ar";
  // While a switch is in flight the knob already shows the target language.
  const busy = target !== null && target !== locale;
  const shown: Locale = busy ? (target as Locale) : locale;

  // The refresh started inside startTransition; resolve the view-transition promise once it commits.
  useEffect(() => {
    if (pending) {
      armed.current = true;
      return;
    }
    if (armed.current && resolveRefresh.current) {
      armed.current = false;
      resolveRefresh.current();
      resolveRefresh.current = null;
    }
  }, [pending]);

  async function switchTo(l: Locale) {
    if (busy || l === locale) return;
    setTarget(l);

    try {
      await fetch("/api/locale", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ locale: l }),
      });
    } catch {
      setLocaleCookie(l);
    }

    const refresh = () =>
      new Promise<void>((resolve) => {
        resolveRefresh.current = resolve;
        startTransition(() => router.refresh());
      });

    const doc = document as DocWithVT;
    if (canViewTransition(doc)) {
      markSwitch(l);
      try {
        await doc.startViewTransition!(refresh).finished;
      } finally {
        markSwitch(null);
      }
    } else {
      await refresh();
    }
    setTarget(null);
    onSwitched?.();
  }

  if (variant === "wide") {
    return (
      <div className={cx("grid grid-cols-2 gap-1 rounded-xl bg-surface-2 p-1", className)} role="group" aria-label={label}>
        {(["en", "ar"] as Locale[]).map((l) => (
          <button
            key={l}
            type="button"
            lang={l}
            onClick={() => switchTo(l)}
            aria-pressed={shown === l}
            className={cx(
              "rounded-lg px-3 py-2 text-sm font-semibold transition-all duration-300",
              shown === l ? "bg-surface text-brand-700 shadow-sm" : "text-muted-foreground hover:text-foreground",
            )}
          >
            {NAMES[l]}
          </button>
        ))}
      </div>
    );
  }

  return (
    <button
      type="button"
      role="switch"
      aria-checked={shown === "ar"}
      aria-label={label ?? `Switch language to ${NAMES[next]}`}
      onClick={() => switchTo(next)}
      className={cx(
        "group relative inline-flex h-10 w-[104px] shrink-0 select-none items-center rounded-full border border-border bg-surface-2 p-1 text-xs font-semibold transition-colors hover:border-brand-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400/60",
        className,
      )}
    >
      {/* sliding knob: sits under EN or AR; in RTL the second cell is on the left */}
      <span
        aria-hidden="true"
        className={cx(
          "absolute top-1 bottom-1 start-1 w-[calc(50%-4px)] rounded-full bg-surface shadow-[0_1px_3px_rgba(31,56,83,.25)] transition-transform duration-300 ease-[cubic-bezier(.22,1,.36,1)]",
          shown === "ar" ? "translate-x-full rtl:-translate-x-full" : "translate-x-0",
        )}
      />
      <span lang="en" className={cx("relative z-10 flex-1 text-center transition-colors duration-300", shown === "en" ? "text-brand-700" : "text-muted-foreground")}>
        EN
      </span>
      <span lang="ar" className={cx("relative z-10 flex-1 text-center transition-colors duration-300", shown === "ar" ? "text-brand-700" : "text-muted-foreground")}>
        عربي
      </span>
    </button>
  );
}
