import Link from "next/link";
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";
import { cx } from "@/lib/utils";

export type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "glass";
export type ButtonSize = "sm" | "md" | "lg" | "icon";

const BASE =
  "relative inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-full font-semibold transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-brand-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]";

const VARIANTS: Record<ButtonVariant, string> = {
  primary:
    "bg-brand-600 text-white dark:text-[#0a1017] shadow-[0_10px_28px_-12px_var(--brand-600)] hover:bg-brand-700 hover:shadow-[0_16px_36px_-12px_var(--brand-600)] dark:text-[#0a1017]",
  secondary: "bg-foreground text-background hover:opacity-90",
  outline: "border border-border bg-transparent text-foreground hover:border-brand-400 hover:bg-surface-2",
  ghost: "bg-transparent text-foreground hover:bg-surface-2",
  glass:
    "border border-white/25 bg-white/10 text-white backdrop-blur-md hover:bg-white/20",
};

const SIZES: Record<ButtonSize, string> = {
  sm: "h-9 px-4 text-sm",
  md: "h-11 px-6 text-sm",
  lg: "h-13 px-8 text-base",
  icon: "h-10 w-10 p-0",
};

export function buttonClass(variant: ButtonVariant = "primary", size: ButtonSize = "md", className?: string) {
  return cx(BASE, VARIANTS[variant], SIZES[size], className);
}

type Common = { variant?: ButtonVariant; size?: ButtonSize; className?: string; children?: ReactNode };

export default function Button({
  variant,
  size,
  className,
  ...rest
}: Common & ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button className={buttonClass(variant, size, className)} {...rest} />;
}

/** Same shape as `Button`, rendered as a Next `<Link>` (internal) or `<a>` (external). */
export function ButtonLink({
  href,
  variant,
  size,
  className,
  ...rest
}: Common & { href: string } & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href">) {
  const cls = buttonClass(variant, size, className);
  const external = /^(https?:|mailto:|tel:)/i.test(href);
  if (external) return <a href={href} className={cls} {...rest} />;
  return <Link href={href} className={cls} {...rest} />;
}
