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
    <article className="group flex h-full flex-col overflow-hidden rounded-3xl border border-border bg-surface transition-all duration-300 hover:-translate-y-1 hover:border-brand-300 hover:shadow-[0_28px_60px_-32px_rgb(16_24_40_/_0.45)]">
      {showImage ? (
        <Link href={href} aria-label={title}>
          <AppImage
            src={post.coverImageUrl}
            alt={title}
            className="aspect-[16/9] w-full overflow-hidden"
            imgClassName="transition-transform duration-500 group-hover:scale-105"
            icon="news"
          />
        </Link>
      ) : null}
      <div className="flex flex-1 flex-col p-5">
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground/70">
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
        <h3 className="mt-3 text-lg font-semibold leading-snug text-foreground">
          <Link href={href} className="transition-colors hover:text-brand-600">
            {title}
          </Link>
        </h3>
        {excerpt ? <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{excerpt}</p> : null}
        <Link href={href} className="mt-auto inline-flex items-center gap-1.5 pt-4 text-sm font-semibold text-brand-600 hover:underline">
          {dict.actions.read}
          <Icon name="arrow-right" size={14} className="transition-transform group-hover:translate-x-0.5 rtl:rotate-180" />
        </Link>
      </div>
    </article>
  );
}
