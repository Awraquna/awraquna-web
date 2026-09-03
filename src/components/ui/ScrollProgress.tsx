"use client";

import { useEffect, useRef } from "react";

/**
 * Hairline brand bar across the very top that fills as the page scrolls.
 * Written straight to the element's transform inside rAF, so scrolling never
 * triggers a React render.
 */
export default function ScrollProgress() {
  const bar = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const el = bar.current;
      if (!el) return;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      el.style.transform = `scaleX(${p})`;
    };
    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-[100] h-0.5" aria-hidden="true">
      <div
        ref={bar}
        className="h-full w-full origin-left bg-gradient-to-r from-brand-500 to-brand-300 rtl:origin-right"
        style={{ transform: "scaleX(0)" }}
      />
    </div>
  );
}
