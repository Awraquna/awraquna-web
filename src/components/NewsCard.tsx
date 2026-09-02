import Link from "next/link";
import type { Locale, NewsCard as NewsCardType } from "@/lib/types";
import { formatDate, pick } from "@/lib/utils";
import { getDict } from "@/i18n";
import AppImage from "./AppImage";
import Icon from "./Icon";

type Props = { post: NewsCardType; locale: Locale; showImage?: boolean };

export default function NewsCard({ post, locale, showImage = true }: Props) {
  const dict = getDict(locale);
  const title = pick(post, "title", locale);
  const tag = pick(post, "tag", locale);
  const excerpt = pick(post, "excerpt", locale);
  const href = `/news/${post.slug}`;

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white transition hover:shadow-md">
      {showImage ? (
        <Link href={href} aria-label={title}>
          <AppImage src={post.coverImageUrl} alt={title} className="aspect-[16/9] w-full" icon="news" />
        </Link>
      ) : null}
      <div className="flex flex-1 flex-col p-5">
        <div className="flex flex-wrap items-center gap-2 text-xs text-gray-400">
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
        <h3 className="mt-3 text-lg font-semibold leading-snug text-gray-900">
          <Link href={href} className="hover:text-brand-700">
            {title}
          </Link>
        </h3>
        {excerpt ? <p className="mt-2 line-clamp-3 text-sm text-gray-500">{excerpt}</p> : null}
        <Link href={href} className="mt-auto inline-flex items-center gap-1 pt-4 text-sm font-semibold text-brand-700 hover:underline">
          {dict.actions.read}
          <Icon name="arrow-right" size={14} className="rtl:rotate-180" />
        </Link>
      </div>
    </article>
  );
}
