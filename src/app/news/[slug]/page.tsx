import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getLocale } from "@/lib/i18n";
import { apiFetch, apiGet } from "@/lib/api";
import type { NewsDetail } from "@/lib/types";
import { formatDate, pick } from "@/lib/utils";
import { getDict } from "@/i18n";
import AppImage from "@/components/AppImage";
import EmptyState from "@/components/EmptyState";
import Icon from "@/components/Icon";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const locale = await getLocale();
  const post = await apiGet<NewsDetail>(`/api/public/news/${encodeURIComponent(slug)}`);
  if (!post) return { title: "News" };
  return { title: pick(post, "title", locale), description: pick(post, "excerpt", locale) || undefined };
}

export default async function NewsDetailPage({ params }: Params) {
  const { slug } = await params;
  const locale = await getLocale();
  const dict = getDict(locale);
  const res = await apiFetch<NewsDetail>(`/api/public/news/${encodeURIComponent(slug)}`);

  if (!res.ok && res.status === 404) notFound();

  const back = (
    <Link href="/news" className="inline-flex items-center gap-1 text-sm font-semibold text-brand-700 hover:underline">
      <Icon name="arrow-right" size={14} className="rotate-180 rtl:rotate-0" />
      {dict.actions.backToNews}
    </Link>
  );

  if (!res.ok) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <EmptyState title={dict.common.notAvailable} hint={dict.common.notAvailableHint} icon="news" />
        <div className="mt-6 text-center">{back}</div>
      </div>
    );
  }

  const post = res.data;
  const title = pick(post, "title", locale);
  const tag = pick(post, "tag", locale);
  const body = pick(post, "body", locale);
  const excerpt = pick(post, "excerpt", locale);

  return (
    <article className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-6">{back}</div>

      <header>
        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
          {tag ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-2.5 py-0.5 font-medium text-brand-700">
              <Icon name="tag" size={12} />
              {tag}
            </span>
          ) : null}
          {post.publishedAt ? (
            <span className="inline-flex items-center gap-1">
              <Icon name="calendar" size={12} />
              {formatDate(post.publishedAt, locale)}
            </span>
          ) : null}
          {post.readMinutes ? (
            <span className="inline-flex items-center gap-1">
              <Icon name="clock" size={12} />
              {post.readMinutes} {dict.common.minRead}
            </span>
          ) : null}
        </div>
        <h1 className="mt-3 text-3xl font-bold leading-tight text-foreground sm:text-4xl">{title}</h1>
        {excerpt ? <p className="mt-3 text-lg text-muted-foreground">{excerpt}</p> : null}
      </header>

      {post.coverImageUrl ? <AppImage src={post.coverImageUrl} alt={title} className="mt-8 aspect-[16/9] w-full rounded-2xl" /> : null}

      {body ? (
        <div className="prose-cms mt-8 rounded-2xl border border-border bg-surface p-6 leading-relaxed text-foreground sm:p-8" dangerouslySetInnerHTML={{ __html: body }} />
      ) : null}

      <div className="mt-10">{back}</div>
    </article>
  );
}
