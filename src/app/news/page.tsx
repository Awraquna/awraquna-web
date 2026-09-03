import type { Metadata } from "next";
import { getLocale } from "@/lib/i18n";
import { apiGet, buildQuery } from "@/lib/api";
import type { NewsCard as NewsCardType, Paged } from "@/lib/types";
import { firstParam, toInt } from "@/lib/utils";
import { getDict } from "@/i18n";
import NewsCard from "@/components/NewsCard";
import Pagination from "@/components/Pagination";
import EmptyState from "@/components/EmptyState";
import PageHeader from "@/components/PageHeader";
import Container from "@/components/ui/Container";
import Reveal from "@/components/ui/Reveal";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "News" };

const PAGE_SIZE = 10;

export default async function NewsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  const locale = await getLocale();
  const dict = getDict(locale);
  const page = toInt(firstParam(sp.page), 1);

  const news = await apiGet<Paged<NewsCardType>>(`/api/public/news${buildQuery({ page, pageSize: PAGE_SIZE })}`, { revalidate: 30 });
  const items = news?.items ?? [];

  return (
    <>
      <PageHeader eyebrow={dict.nav.news} icon="news" title={dict.common.newsTitle} subtitle={dict.common.newsSubtitle} size="sm" />
      <Container size="md" className="py-10 lg:py-14">

      {!news ? (
        <EmptyState title={dict.common.notAvailable} hint={dict.common.notAvailableHint} icon="news" />
      ) : items.length === 0 ? (
        <EmptyState title={dict.common.noNews} icon="news" />
      ) : (
        <ol className="relative space-y-6 border-s-2 border-brand-100 ps-6 sm:ps-8">
          {items.map((n, i) => (
            <li key={n.id} className="relative">
              <span className="absolute -start-[calc(1.5rem+5px)] top-6 h-3 w-3 rounded-full bg-brand-600 ring-4 ring-background sm:-start-[calc(2rem+5px)]" />
              <Reveal dir="start" delay={(i % 4) * 70}>
                <NewsCard post={n} locale={locale} showImage={!!n.coverImageUrl} />
              </Reveal>
            </li>
          ))}
        </ol>
      )}

        <Pagination basePath="/news" params={{}} page={page} pageSize={news?.pageSize || PAGE_SIZE} total={news?.total ?? 0} dict={dict} />
      </Container>
    </>
  );
}
