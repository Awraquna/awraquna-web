import type { ReactNode } from "react";
import { cx } from "@/lib/utils";
import Container from "./ui/Container";
import Reveal from "./ui/Reveal";
import Icon from "./Icon";

type Props = {
  eyebrow?: string | null;
  title: string;
  subtitle?: string | null;
  /** Icon name for the badge beside the eyebrow. */
  icon?: string;
  /** Rendered under the copy — search fields, filters, CTA rows. */
  children?: ReactNode;
  align?: "start" | "center";
  size?: "sm" | "md" | "lg";
};

const PAD: Record<NonNullable<Props["size"]>, string> = {
  sm: "py-10 lg:py-12",
  md: "py-14 lg:py-16",
  lg: "py-16 lg:py-24",
};

/**
 * The banner every interior page opens with — the same ambient grid + brand glow
 * the home hero uses, so the pages read as one site rather than a set of
 * separately styled documents.
 */
export default function PageHeader({ eyebrow, title, subtitle, icon, children, align = "start", size = "md" }: Props) {
  const centered = align === "center";
  return (
    <section className="relative isolate overflow-hidden border-b border-border bg-background">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="bg-grid mask-fade absolute inset-0 opacity-50" />
        <div className="animate-aurora absolute -top-40 start-[10%] h-72 w-72 rounded-full bg-[var(--brand-soft)] blur-3xl" />
      </div>
      <Container className={cx(PAD[size], centered && "text-center")}>
        <Reveal>
          {eyebrow ? (
            <span
              className={cx(
                "mb-4 inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-brand-700",
              )}
            >
              {icon ? <Icon name={icon} size={13} /> : null}
              {eyebrow}
            </span>
          ) : null}
          <h1 className="text-3xl font-extrabold leading-tight tracking-tight text-foreground sm:text-4xl lg:text-[2.75rem]">
            {title}
          </h1>
          {subtitle ? (
            <p className={cx("mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg", centered && "mx-auto")}>
              {subtitle}
            </p>
          ) : null}
        </Reveal>
        {children ? <Reveal delay={100}>{children}</Reveal> : null}
      </Container>
    </section>
  );
}
