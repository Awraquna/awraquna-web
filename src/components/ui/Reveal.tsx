"use client";

import type { ElementType, ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import { cx } from "@/lib/utils";

type Dir = "up" | "down" | "start" | "scale" | "fade";

const DIR_CLASS: Record<Dir, string> = {
  up: "",
  down: "reveal-down",
  start: "reveal-start",
  scale: "reveal-scale",
  fade: "reveal-fade",
};

/**
 * Scroll-reveal wrapper — the block sits shifted + transparent until it enters
 * the viewport, then eases into place.
 *
 *   <Reveal>…</Reveal>
 *   <Reveal dir="scale" delay={120}>…</Reveal>
 *
 * The animation is pure CSS (see `.reveal` in globals.css); this component only
 * flips one class from an IntersectionObserver, so there is no animation library
 * and nothing runs on the main thread while scrolling. Server-rendered markup is
 * identical either way, and `prefers-reduced-motion` short-circuits the whole
 * thing in CSS.
 */
export default function Reveal({
  children,
  className,
  dir = "up",
  delay = 0,
  as: Tag = "div",
  once = true,
  amount = 0.15,
}: {
  children: ReactNode;
  className?: string;
  dir?: Dir;
  /** Milliseconds — stagger siblings by passing 0, 80, 160, … */
  delay?: number;
  as?: ElementType;
  once?: boolean;
  /** Fraction of the element that must be visible before it plays. */
  amount?: number;
}) {
  const ref = useRef<HTMLElement | null>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // No observer support: reveal on the next frame rather than leaving the
    // block permanently invisible.
    if (typeof IntersectionObserver === "undefined") {
      const frame = requestAnimationFrame(() => setShown(true));
      return () => cancelAnimationFrame(frame);
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          if (once) io.disconnect();
        } else if (!once) {
          setShown(false);
        }
      },
      { threshold: Math.min(amount, 0.99), rootMargin: "0px 0px -8% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [once, amount]);

  return (
    <Tag
      ref={ref}
      className={cx("reveal", DIR_CLASS[dir], shown && "reveal-in", className)}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </Tag>
  );
}
