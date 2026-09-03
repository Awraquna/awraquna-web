import type { HTMLAttributes } from "react";
import { cx } from "@/lib/utils";

type Props = HTMLAttributes<HTMLDivElement> & { size?: "sm" | "md" | "lg" | "xl" };

const WIDTHS: Record<NonNullable<Props["size"]>, string> = {
  sm: "max-w-3xl",
  md: "max-w-5xl",
  lg: "max-w-7xl",
  xl: "max-w-[88rem]",
};

/** The one page gutter. Every section measures itself against this. */
export default function Container({ size = "lg", className, children, ...rest }: Props) {
  return (
    <div className={cx("mx-auto w-full px-4 sm:px-6 lg:px-8", WIDTHS[size], className)} {...rest}>
      {children}
    </div>
  );
}
