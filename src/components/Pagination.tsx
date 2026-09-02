import Link from "next/link";
import { buildQuery } from "@/lib/api";
import { cx } from "@/lib/utils";
import type { Dictionary } from "@/i18n";

type Props = {
  basePath: string;
  params: Record<string, string | number | undefined | null>;
  page: number;
  pageSize: number;
  total: number;
  dict: Dictionary;
};

export default function Pagination({ basePath, params, page, pageSize, total, dict }: Props) {
  const pages = Math.max(1, Math.ceil(total / Math.max(1, pageSize)));
  if (pages <= 1) return null;

  const href = (p: number) => `${basePath}${buildQuery({ ...params, page: p > 1 ? p : undefined })}`;

  // Compact window of page numbers around the current page.
  const window: number[] = [];
  const start = Math.max(1, page - 2);
  const end = Math.min(pages, page + 2);
  for (let p = start; p <= end; p++) window.push(p);

  const btn =
    "inline-flex h-10 min-w-10 items-center justify-center rounded-lg border px-3 text-sm font-medium transition";
  const normal = "border-gray-200 bg-white text-gray-700 hover:border-brand-400 hover:text-brand-700";
  const active = "border-brand-600 bg-brand-600 text-white";
  const disabled = "border-gray-100 bg-gray-50 text-gray-300 pointer-events-none";

  return (
    <nav className="mt-10 flex flex-wrap items-center justify-center gap-2" aria-label="Pagination">
      <Link href={href(page - 1)} className={cx(btn, page <= 1 ? disabled : normal)} aria-disabled={page <= 1}>
        {dict.actions.prev}
      </Link>
      {start > 1 ? (
        <>
          <Link href={href(1)} className={cx(btn, normal)}>
            1
          </Link>
          {start > 2 ? <span className="px-1 text-gray-400">…</span> : null}
        </>
      ) : null}
      {window.map((p) => (
        <Link key={p} href={href(p)} className={cx(btn, p === page ? active : normal)} aria-current={p === page ? "page" : undefined}>
          {p}
        </Link>
      ))}
      {end < pages ? (
        <>
          {end < pages - 1 ? <span className="px-1 text-gray-400">…</span> : null}
          <Link href={href(pages)} className={cx(btn, normal)}>
            {pages}
          </Link>
        </>
      ) : null}
      <Link href={href(page + 1)} className={cx(btn, page >= pages ? disabled : normal)} aria-disabled={page >= pages}>
        {dict.actions.next}
      </Link>
    </nav>
  );
}
