import Link from "next/link";
import type { ReactNode } from "react";
import { getLocale } from "@/lib/i18n";
import { apiGet } from "@/lib/api";
import type { ContentSection, HomeData } from "@/lib/types";
import { activeItems, pick } from "@/lib/utils";
import { getDict } from "@/i18n";
import HeroBanner from "@/components/home/HeroBanner";
import BestSellersTabs from "@/components/home/BestSellersTabs";
import SectionHeading from "@/components/SectionHeading";
import EmptyState from "@/components/EmptyState";
import AppImage from "@/components/AppImage";
import NewsCard from "@/components/NewsCard";
import LogoMarquee from "@/components/home/LogoMarquee";
import Icon from "@/components/Icon";
import Container from "@/components/ui/Container";
import Reveal from "@/components/ui/Reveal";

export const dynamic = "force-dynamic";

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
        <section className="border-b border-border bg-surface">
          <Container className="grid gap-4 py-8 sm:grid-cols-2 lg:grid-cols-4">
            {items.map((it, i) => (
              <Reveal key={it.id} delay={i * 70} className="flex items-start gap-3 rounded-2xl p-2 transition-colors hover:bg-surface-2">
                {it.imageUrl ? (
                  <AppImage src={it.imageUrl} alt="" className="h-11 w-11 shrink-0 rounded-xl" />
                ) : (
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                    <Icon name={it.icon} size={22} />
                  </span>
                )}
                <div>
                  <p className="font-semibold text-foreground">{pick(it, "title", locale)}</p>
                  <p className="text-sm text-muted-foreground">{pick(it, "text", locale)}</p>
                </div>
              </Reveal>
            ))}
          </Container>
        </section>
      );
    },

    categories: (s) => {
      if (!categories.length) return null;
      return (
        <section className="py-20">
          <Container>
            <SectionHeading
              eyebrow={dict.common.categories}
              title={t(s, "title") || "Browse Product Categories"}
              subtitle={t(s, "subtitle")}
            />
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {categories.map((c, i) => (
                <Reveal key={c.id} delay={(i % 4) * 80}>
                  <Link
                    href={`/products?category=${encodeURIComponent(c.slug)}`}
                    className="group flex h-full flex-col overflow-hidden rounded-3xl border border-border bg-surface transition-all duration-300 hover:-translate-y-1 hover:border-brand-300 hover:shadow-[0_28px_60px_-32px_rgb(16_24_40_/_0.45)]"
                  >
                    <div className="relative overflow-hidden">
                      <AppImage
                        src={c.imageUrl}
                        alt={pick(c, "name", locale)}
                        className="aspect-[4/3] w-full"
                        imgClassName="transition-transform duration-500 group-hover:scale-105"
                        icon="box"
                        iconSize={40}
                      />
                      <span className="absolute inset-0 bg-gradient-to-t from-brand-900/35 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                    </div>
                    <div className="flex flex-1 flex-col p-5">
                      <h3 className="flex items-center gap-1.5 font-semibold text-foreground transition-colors group-hover:text-brand-600">
                        {pick(c, "name", locale)}
                        <Icon
                          name="arrow-right"
                          size={15}
                          className="-translate-x-1 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100 rtl:rotate-180"
                        />
                      </h3>
                      {pick(c, "description", locale) ? (
                        <p className="mt-1.5 line-clamp-2 text-sm text-muted-foreground">{pick(c, "description", locale)}</p>
                      ) : null}
                      {(c.subCategories?.length ?? 0) > 0 ? (
                        <p className="mt-auto pt-3 text-xs text-muted-foreground/70">
                          {c.subCategories!
                            .slice(0, 3)
                            .map((sc) => pick(sc, "name", locale))
                            .join(" · ")}
                        </p>
                      ) : null}
                    </div>
                  </Link>
                </Reveal>
              ))}
            </div>
          </Container>
        </section>
      );
    },

    business_areas: (s) => {
      if (!areas.length) return null;
      return (
        <section className="border-y border-border bg-surface py-20">
          <Container>
            <SectionHeading
              eyebrow={dict.common.businessAreas}
              title={t(s, "title") || "Shop by Business Area"}
              subtitle={t(s, "subtitle")}
            />
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {areas.map((a, i) => (
                <Reveal key={a.id} delay={(i % 4) * 80}>
                  <Link
                    href={`/products?area=${encodeURIComponent(a.slug)}`}
                    className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-border bg-background p-5 transition-all duration-300 hover:-translate-y-1 hover:border-brand-300"
                  >
                    {/* Brand wash that swells in from the corner on hover. */}
                    <span className="pointer-events-none absolute -end-10 -top-10 h-28 w-28 rounded-full bg-[var(--brand-soft)] opacity-0 blur-2xl transition-opacity duration-300 group-hover:opacity-100" />
                    {a.imageUrl ? (
                      <AppImage src={a.imageUrl} alt="" className="mb-4 aspect-[16/9] w-full rounded-2xl" />
                    ) : (
                      <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 transition-colors group-hover:bg-brand-600 group-hover:text-white">
                        <Icon name="building" size={22} />
                      </span>
                    )}
                    <h3 className="relative font-semibold text-foreground transition-colors group-hover:text-brand-600">
                      {pick(a, "name", locale)}
                    </h3>
                    {pick(a, "tagline", locale) ? (
                      <p className="relative mt-1 text-sm text-muted-foreground">{pick(a, "tagline", locale)}</p>
                    ) : null}
                  </Link>
                </Reveal>
              ))}
            </div>
          </Container>
        </section>
      );
    },

    best_sellers: (s) => {
      if (!featured.length) return null;
      return (
        <section className="py-20">
          <Container>
            <SectionHeading
              eyebrow={dict.common.featured}
              title={t(s, "title") || "Best-Selling Products by Industry"}
              subtitle={t(s, "subtitle")}
            />
            <BestSellersTabs areas={areas} products={featured} locale={locale} labels={{ all: dict.common.all, empty: dict.common.noProducts }} />
            <div className="mt-10 text-center">
              <Link
                href="/products"
                className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-6 py-3 text-sm font-semibold text-foreground transition-colors hover:border-brand-400 hover:text-brand-600"
              >
                {dict.actions.viewAll}
                <Icon name="arrow-right" size={16} className="rtl:rotate-180" />
              </Link>
            </div>
          </Container>
        </section>
      );
    },

    why_choose: (s) => {
      const items = activeItems(s);
      if (!items.length) return null;
      return (
        <section className="py-20">
          <Container>
            <div className="brand-panel relative overflow-hidden rounded-[32px] px-6 py-14 sm:px-10 lg:px-14">
              <div aria-hidden="true" className="bg-dot pointer-events-none absolute inset-0 opacity-[0.18]" />
              <div className="pointer-events-none absolute -end-24 -top-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
              <div className="relative">
                <Reveal className="mb-10 text-center">
                  <h2 className="text-2xl font-bold sm:text-[2rem] sm:leading-tight">{t(s, "title") || "Why Businesses Choose Awraquna"}</h2>
                  {t(s, "subtitle") ? <p className="mx-auto mt-3 max-w-2xl text-white/75">{t(s, "subtitle")}</p> : null}
                </Reveal>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {items.map((it, i) => (
                    <Reveal
                      key={it.id}
                      delay={(i % 4) * 80}
                      className="rounded-2xl bg-white/10 p-5 ring-1 ring-white/15 backdrop-blur-sm transition-transform duration-300 hover:-translate-y-1"
                    >
                      <span className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-white/15">
                        <Icon name={it.icon} size={22} />
                      </span>
                      <h3 className="font-semibold">{pick(it, "title", locale)}</h3>
                      <p className="mt-1 text-sm text-white/75">{pick(it, "text", locale)}</p>
                    </Reveal>
                  ))}
                </div>
              </div>
            </div>
          </Container>
        </section>
      );
    },

    clients: (s) => {
      if (!clients.length) return null;
      return (
        <section className="border-y border-border bg-surface py-20">
          <Container>
            <SectionHeading eyebrow={dict.common.trustedBy} title={t(s, "title") || dict.common.ourClients} subtitle={t(s, "subtitle")} />
          </Container>
          {/* Full-bleed: the strip runs edge to edge and fades out at both sides,
              so it reads as continuous motion rather than a boxed-in row. */}
          <Reveal dir="fade">
            <LogoMarquee clients={clients} />
          </Reveal>
        </section>
      );
    },

    about_blurb: (s) => {
      if (!s) return null;
      return (
        <section className="py-20">
          <Container className="grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
            <Reveal dir="start">
              <span className="mb-3 inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-brand-700">
                {dict.common.aboutBrand}
              </span>
              <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-[2rem] sm:leading-tight">
                {t(s, "title") || dict.common.aboutBrand}
              </h2>
              {t(s, "subtitle") ? <p className="mt-3 text-muted-foreground">{t(s, "subtitle")}</p> : null}
              {t(s, "body") ? (
                <div className="prose-cms mt-5 leading-relaxed text-muted-foreground" dangerouslySetInnerHTML={{ __html: t(s, "body") }} />
              ) : null}
              <Link
                href="/about-us"
                className="mt-7 inline-flex items-center gap-2 rounded-full bg-brand-600 px-6 py-3 text-sm font-semibold text-white dark:text-[#0a1017] shadow-[0_12px_30px_-14px_var(--brand-600)] transition-colors hover:bg-brand-700 dark:text-[#0a1017]"
              >
                {dict.actions.learnMore}
                <Icon name="arrow-right" size={16} className="rtl:rotate-180" />
              </Link>
            </Reveal>
            <Reveal dir="scale" delay={120} className="relative">
              {/* Offset brand plate behind the photo. */}
              <span
                aria-hidden="true"
                className="absolute -bottom-4 -end-4 h-full w-full rounded-[28px] border border-brand-200 bg-[var(--brand-soft)]"
              />
              <AppImage
                src={s.imageUrl}
                alt=""
                className="relative aspect-[4/3] w-full rounded-[28px] border border-border shadow-[0_30px_70px_-40px_rgb(16_24_40_/_0.5)]"
                icon="building"
                iconSize={56}
              />
            </Reveal>
          </Container>
        </section>
      );
    },

    latest_news: (s) => {
      if (!latestNews.length) return null;
      return (
        <section className="border-t border-border bg-surface py-20">
          <Container>
            <SectionHeading eyebrow={dict.nav.news} title={t(s, "title") || dict.common.latestNews} subtitle={t(s, "subtitle")} />
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {latestNews.map((n, i) => (
                <Reveal key={n.id} delay={(i % 4) * 80}>
                  <NewsCard post={n} locale={locale} showImage={false} />
                </Reveal>
              ))}
            </div>
            <div className="mt-10 text-center">
              <Link href="/news" className="inline-flex items-center gap-2 text-sm font-semibold text-brand-600 hover:underline">
                {dict.actions.viewAll}
                <Icon name="arrow-right" size={16} className="rtl:rotate-180" />
              </Link>
            </div>
          </Container>
        </section>
      );
    },
  };

  return (
    <>
      <HeroBanner
        banners={home?.banners ?? []}
        locale={locale}
        fallback={heroFallback}
        labels={{ badge: dict.common.trustedBy, secondaryCta: dict.actions.contactUs, secondaryHref: "/contact" }}
      />

      {!home ? (
        <Container className="py-16">
          <EmptyState title={dict.common.notAvailable} hint={dict.common.notAvailableHint} />
        </Container>
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
      <section className="py-20">
        <Container>
          {title ? <SectionHeading title={title} subtitle={subtitle} /> : null}
          {s.imageUrl ? (
            <Reveal dir="scale">
              <AppImage src={s.imageUrl} alt={title} className="mb-8 aspect-[21/9] w-full rounded-3xl border border-border" />
            </Reveal>
          ) : null}
          {body ? (
            <Reveal className="prose-cms mx-auto max-w-3xl leading-relaxed text-muted-foreground">
              <div dangerouslySetInnerHTML={{ __html: body }} />
            </Reveal>
          ) : null}
          {items.length ? (
            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {items.map((it, i) => (
                <Reveal
                  key={it.id}
                  delay={(i % 4) * 80}
                  className="rounded-3xl border border-border bg-surface p-5 transition-all duration-300 hover:-translate-y-1 hover:border-brand-300"
                >
                  {it.imageUrl ? (
                    <AppImage src={it.imageUrl} alt="" className="mb-4 aspect-[16/9] w-full rounded-2xl" />
                  ) : (
                    <span className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                      <Icon name={it.icon} size={22} />
                    </span>
                  )}
                  <h3 className="font-semibold text-foreground">{pick(it, "title", locale)}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{pick(it, "text", locale)}</p>
                </Reveal>
              ))}
            </div>
          ) : null}
        </Container>
      </section>
    );
  };
}
