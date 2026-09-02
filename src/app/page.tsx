import Link from "next/link";
import type { ReactNode } from "react";
import { getLocale } from "@/lib/i18n";
import { apiGet, imageUrl } from "@/lib/api";
import type { ContentSection, HomeData } from "@/lib/types";
import { activeItems, pick } from "@/lib/utils";
import { getDict } from "@/i18n";
import HeroBanner from "@/components/home/HeroBanner";
import BestSellersTabs from "@/components/home/BestSellersTabs";
import SectionHeading from "@/components/SectionHeading";
import EmptyState from "@/components/EmptyState";
import AppImage from "@/components/AppImage";
import NewsCard from "@/components/NewsCard";
import Icon from "@/components/Icon";

export const dynamic = "force-dynamic";

const container = "mx-auto max-w-7xl px-4 sm:px-6 lg:px-8";

/**
 * Every block on the home page is one ContentSection row (pageKey = "home"): the admin
 * controls its order (sortOrder), visibility (isActive), title, subtitle, body, image and
 * items. What you see here is exactly the active sections in their admin order — hiding a
 * section hides the block, reordering reorders the page.
 *
 * The API creates any missing standard section at startup, so every block always has a row
 * to control. A section with an unknown sectionKey renders as a generic title/body/items block.
 */
export default async function HomePage() {
  const locale = await getLocale();
  const dict = getDict(locale);
  const home = await apiGet<HomeData>("/api/public/home");

  const settings = home?.settings ?? {};
  const categories = home?.categories ?? [];
  const areas = home?.businessAreas ?? [];
  const featured = home?.featuredProducts ?? [];
  const clients = home?.clients ?? [];
  const latestNews = home?.latestNews ?? [];

  const heroFallback = {
    title: pick(settings, "tagline", locale) || "Your One Supplier for Thermal & Labeling Solutions in Saudi Arabia",
    subtitle: "",
    ctaText: dict.actions.shopProducts,
    ctaUrl: "/products",
  };

  // Active sections, in the order the admin set. This list IS the page.
  const sections = (home?.sections ?? [])
    .filter((s) => s.isActive !== false)
    .sort((a, b) => a.sortOrder - b.sortOrder || a.id - b.id);

  const t = (s: ContentSection | undefined, field: "title" | "subtitle" | "body") => (s ? pick(s, field, locale) : "");

  const blocks: Record<string, (s?: ContentSection) => ReactNode> = {
    value_props: (s) => {
      const items = activeItems(s);
      if (!items.length) return null;
      return (
        <section className="border-b border-gray-200 bg-white">
          <div className={`${container} grid gap-6 py-8 sm:grid-cols-2 lg:grid-cols-4`}>
            {items.map((it) => (
              <div key={it.id} className="flex items-start gap-3">
                {it.imageUrl ? (
                  <AppImage src={it.imageUrl} alt="" className="h-11 w-11 shrink-0 rounded-xl" />
                ) : (
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                    <Icon name={it.icon} size={22} />
                  </span>
                )}
                <div>
                  <p className="font-semibold text-gray-900">{pick(it, "title", locale)}</p>
                  <p className="text-sm text-gray-500">{pick(it, "text", locale)}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      );
    },

    categories: (s) => {
      if (!categories.length) return null;
      return (
        <section className={`${container} py-16`}>
          <SectionHeading title={t(s, "title") || "Browse Product Categories"} subtitle={t(s, "subtitle")} />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {categories.map((c) => (
              <Link
                key={c.id}
                href={`/products?category=${encodeURIComponent(c.slug)}`}
                className="group overflow-hidden rounded-2xl border border-gray-200 bg-white transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <AppImage src={c.imageUrl} alt={pick(c, "name", locale)} className="aspect-[4/3] w-full" icon="box" iconSize={40} />
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 group-hover:text-brand-700">{pick(c, "name", locale)}</h3>
                  {pick(c, "description", locale) ? (
                    <p className="mt-1 line-clamp-2 text-sm text-gray-500">{pick(c, "description", locale)}</p>
                  ) : null}
                  {(c.subCategories?.length ?? 0) > 0 ? (
                    <p className="mt-2 text-xs text-gray-400">
                      {c.subCategories!
                        .slice(0, 3)
                        .map((sc) => pick(sc, "name", locale))
                        .join(" · ")}
                    </p>
                  ) : null}
                </div>
              </Link>
            ))}
          </div>
        </section>
      );
    },

    business_areas: (s) => {
      if (!areas.length) return null;
      return (
        <section className="bg-white">
          <div className={`${container} py-16`}>
            <SectionHeading title={t(s, "title") || "Shop by Business Area"} subtitle={t(s, "subtitle")} />
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {areas.map((a) => (
                <Link
                  key={a.id}
                  href={`/products?area=${encodeURIComponent(a.slug)}`}
                  className="group flex flex-col rounded-2xl border border-gray-200 bg-gray-50 p-5 transition hover:border-brand-400 hover:bg-brand-50"
                >
                  {a.imageUrl ? (
                    <AppImage src={a.imageUrl} alt="" className="mb-4 aspect-[16/9] w-full rounded-xl" />
                  ) : (
                    <span className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-white text-brand-600 ring-1 ring-gray-200">
                      <Icon name="building" size={22} />
                    </span>
                  )}
                  <h3 className="font-semibold text-gray-900 group-hover:text-brand-700">{pick(a, "name", locale)}</h3>
                  {pick(a, "tagline", locale) ? <p className="mt-1 text-sm text-gray-500">{pick(a, "tagline", locale)}</p> : null}
                </Link>
              ))}
            </div>
          </div>
        </section>
      );
    },

    best_sellers: (s) => {
      if (!featured.length) return null;
      return (
        <section className={`${container} py-16`}>
          <SectionHeading title={t(s, "title") || "Best-Selling Products by Industry"} subtitle={t(s, "subtitle")} />
          <BestSellersTabs areas={areas} products={featured} locale={locale} labels={{ all: dict.common.all, empty: dict.common.noProducts }} />
          <div className="mt-8 text-center">
            <Link href="/products" className="inline-flex items-center gap-2 rounded-xl border border-brand-600 px-5 py-2.5 text-sm font-semibold text-brand-700 transition hover:bg-brand-50">
              {dict.actions.viewAll}
              <Icon name="arrow-right" size={16} className="rtl:rotate-180" />
            </Link>
          </div>
        </section>
      );
    },

    why_choose: (s) => {
      const items = activeItems(s);
      if (!items.length) return null;
      return (
        <section className="bg-brand-800 text-white">
          <div className={`${container} py-16`}>
            <div className="mb-8 text-center">
              <h2 className="text-2xl font-bold sm:text-3xl">{t(s, "title") || "Why Businesses Choose Awraquna"}</h2>
              {t(s, "subtitle") ? <p className="mt-2 text-brand-100">{t(s, "subtitle")}</p> : null}
            </div>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {items.map((it) => (
                <div key={it.id} className="rounded-2xl bg-white/10 p-5 ring-1 ring-white/15">
                  <span className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-white/15 text-white">
                    <Icon name={it.icon} size={22} />
                  </span>
                  <h3 className="font-semibold">{pick(it, "title", locale)}</h3>
                  <p className="mt-1 text-sm text-brand-100">{pick(it, "text", locale)}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      );
    },

    clients: (s) => {
      if (!clients.length) return null;
      return (
        <section className={`${container} py-16`}>
          <SectionHeading title={t(s, "title") || dict.common.ourClients} subtitle={t(s, "subtitle")} />
          <div className="flex flex-wrap items-center justify-center gap-3">
            {clients.map((c) => {
              const logo = imageUrl(c.logoUrl);
              const inner = logo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={logo} alt={c.name} loading="lazy" className="h-10 w-auto max-w-[140px] object-contain grayscale transition hover:grayscale-0" />
              ) : (
                <span className="text-sm font-semibold text-gray-600">{c.name}</span>
              );
              const cls = "flex h-16 items-center justify-center rounded-full border border-gray-200 bg-white px-6 transition hover:border-brand-400";
              return c.websiteUrl ? (
                <a key={c.id} href={c.websiteUrl} target="_blank" rel="noopener noreferrer" className={cls} title={c.name}>
                  {inner}
                </a>
              ) : (
                <div key={c.id} className={cls} title={c.name}>
                  {inner}
                </div>
              );
            })}
          </div>
        </section>
      );
    },

    about_blurb: (s) => {
      if (!s) return null;
      return (
        <section className="bg-white">
          <div className={`${container} grid items-center gap-8 py-16 lg:grid-cols-2`}>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">{t(s, "title") || dict.common.aboutBrand}</h2>
              {t(s, "subtitle") ? <p className="mt-2 text-gray-500">{t(s, "subtitle")}</p> : null}
              {t(s, "body") ? <div className="prose-cms mt-4 text-gray-600" dangerouslySetInnerHTML={{ __html: t(s, "body") }} /> : null}
              <Link href="/about-us" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700">
                {dict.actions.learnMore}
                <Icon name="arrow-right" size={16} className="rtl:rotate-180" />
              </Link>
            </div>
            <AppImage src={s.imageUrl} alt="" className="aspect-[4/3] w-full rounded-2xl" icon="building" iconSize={56} />
          </div>
        </section>
      );
    },

    latest_news: (s) => {
      if (!latestNews.length) return null;
      return (
        <section className={`${container} py-16`}>
          <SectionHeading title={t(s, "title") || dict.common.latestNews} subtitle={t(s, "subtitle")} />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {latestNews.map((n) => (
              <NewsCard key={n.id} post={n} locale={locale} showImage={false} />
            ))}
          </div>
          <div className="mt-8 text-center">
            <Link href="/news" className="inline-flex items-center gap-2 text-sm font-semibold text-brand-700 hover:underline">
              {dict.actions.viewAll}
              <Icon name="arrow-right" size={16} className="rtl:rotate-180" />
            </Link>
          </div>
        </section>
      );
    },
  };

  return (
    <>
      <HeroBanner banners={home?.banners ?? []} locale={locale} fallback={heroFallback} />

      {!home ? (
        <div className={`${container} py-16`}>
          <EmptyState title={dict.common.notAvailable} hint={dict.common.notAvailableHint} />
        </div>
      ) : null}

      {sections.map((section) => {
        const render = blocks[section.sectionKey] ?? genericBlock(locale);
        return <div key={section.id}>{render(section)}</div>;
      })}
    </>
  );
}

/** Sections created from the admin with a new sectionKey render as a generic title/body/items block. */
function genericBlock(locale: "en" | "ar") {
  return function Generic(s?: ContentSection) {
    if (!s) return null;
    const title = pick(s, "title", locale);
    const subtitle = pick(s, "subtitle", locale);
    const body = pick(s, "body", locale);
    const items = activeItems(s);
    if (!title && !body && !items.length) return null;
    return (
      <section className={`${container} py-16`}>
        {title ? <SectionHeading title={title} subtitle={subtitle} /> : null}
        {s.imageUrl ? <AppImage src={s.imageUrl} alt={title} className="mb-6 aspect-[21/9] w-full rounded-2xl" /> : null}
        {body ? <div className="prose-cms mx-auto max-w-3xl text-gray-600" dangerouslySetInnerHTML={{ __html: body }} /> : null}
        {items.length ? (
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {items.map((it) => (
              <div key={it.id} className="rounded-2xl border border-gray-200 bg-white p-5">
                {it.imageUrl ? (
                  <AppImage src={it.imageUrl} alt="" className="mb-4 aspect-[16/9] w-full rounded-xl" />
                ) : (
                  <span className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                    <Icon name={it.icon} size={22} />
                  </span>
                )}
                <h3 className="font-semibold text-gray-900">{pick(it, "title", locale)}</h3>
                <p className="mt-1 text-sm text-gray-500">{pick(it, "text", locale)}</p>
              </div>
            ))}
          </div>
        ) : null}
      </section>
    );
  };
}
