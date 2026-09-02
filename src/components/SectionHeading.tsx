import { cx } from "@/lib/utils";

type Props = {
  title?: string | null;
  subtitle?: string | null;
  align?: "start" | "center";
  className?: string;
};

export default function SectionHeading({ title, subtitle, align = "center", className }: Props) {
  if (!title && !subtitle) return null;
  return (
    <div className={cx("mb-8", align === "center" ? "text-center" : "text-start", className)}>
      {title ? <h2 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">{title}</h2> : null}
      {subtitle ? <p className="mt-2 text-base text-gray-500">{subtitle}</p> : null}
    </div>
  );
}
