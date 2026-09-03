import { cx } from "@/lib/utils";
import Reveal from "./ui/Reveal";

type Props = {
  /** Small brand-coloured kicker above the title. */
  eyebrow?: string | null;
  title?: string | null;
  subtitle?: string | null;
  align?: "start" | "center";
  className?: string;
};

export default function SectionHeading({ eyebrow, title, subtitle, align = "center", className }: Props) {
  if (!title && !subtitle) return null;
  const centered = align === "center";
  return (
    <Reveal className={cx("mb-10", centered ? "text-center" : "text-start", className)}>
      {eyebrow ? (
        <span
          className={cx(
            "mb-3 inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-brand-700",
          )}
        >
          {eyebrow}
        </span>
      ) : null}
      {title ? (
        <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-[2rem] sm:leading-tight">{title}</h2>
      ) : null}
      {/* Short brand rule under the title — the same accent the nav and footer use. */}
      <span
        aria-hidden="true"
        className={cx("mt-4 block h-1 w-14 rounded-full bg-gradient-to-r from-brand-500 to-brand-300", centered && "mx-auto")}
      />
      {subtitle ? (
        <p className={cx("mt-4 text-base leading-relaxed text-muted-foreground", centered && "mx-auto max-w-2xl")}>{subtitle}</p>
      ) : null}
    </Reveal>
  );
}
