import type { Metadata } from "next";
import { getLocale } from "@/lib/i18n";
import { apiGet } from "@/lib/api";
import type { ContentSection, Locale } from "@/lib/types";
import { activeItems, pick } from "@/lib/utils";
import { getDict } from "@/i18n";
import EmptyState from "@/components/EmptyState";
import AppImage from "@/components/AppImage";
import Icon from "@/components/Icon";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "About Us" };

const container = "mx-auto max-w-7xl px-4 sm:px-6 lg:px-8";

export default async function AboutPage() {
  const locale = await getLocale();
  const dict = getDict(locale);
  const sections = await apiGet<ContentSection[]>("/api/public/pages/about");

  if (!sections || sections.length === 0) {
    return (
      <div className={`${container} py-16`}>
        <h1 className="mb-8 text-3xl font-bold text-gray-900">{dict.common.aboutTitle}</h1>
        <EmptyState title={dict.common.notAvailable} hint={dict.common.notAvailableHint} />
      </div>
    );
  }

  const ordered = sections.filter((s) => s.isActive !== false).sort((a, b) => a.sortOrder - b.sortOrder);
  const hasHero = ordered.some((s) => s.sectionKey === "hero");

  return (
    <>
      {!hasHero ? (
        <div className={`${container} pt-12`}>
          <h1 className="text-3xl font-bold text-gray-900">{dict.common.aboutTitle}</h1>
        </div>
      ) : null}
      {ordered.map((s) => (
        <Section key={s.id} section={s} locale={locale} />
      ))}
    </>
  );
}

function Section({ section: s, locale }: { section: ContentSection; locale: Locale }) {
  const title = pick(s, "title", locale);
  const subtitle = pick(s, "subtitle", locale);
  const body = pick(s, "body", locale);
  const items = activeItems(s);

  switch (s.sectionKey) {
    case "hero":
      return (
        <section className="bg-brand-800 text-white">
          <div className={`${container} py-20 lg:py-24`}>
            <h1 className="max-w-3xl text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl">{title}</h1>
            {subtitle ? <p className="mt-5 max-w-2xl text-lg text-brand-100">{subtitle}</p> : null}
          </div>
        </section>
      );

    case "pillars":
    case "different":
      return (
        <section className={`${container} py-16`}>
          <Heading title={title} subtitle={subtitle} />
          <div className="grid gap-5 md:grid-cols-3">
            {items.map((it) => (
              <div key={it.id} className="rounded-2xl border border-gray-200 bg-white p-6">
                <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                  <Icon name={it.icon} size={24} />
                </span>
                <h3 className="text-lg font-semibold text-gray-900">{pick(it, "title", locale)}</h3>
                <p className="mt-2 text-sm text-gray-500">{pick(it, "text", locale)}</p>
              </div>
            ))}
          </div>
        </section>
      );

    case "stats":
      return (
        <section className="bg-white">
          <div className={`${container} py-12`}>
            <h2 className="mb-6 text-center text-2xl font-bold text-gray-900 sm:text-3xl">{title}</h2>
            <div className="flex flex-wrap justify-center gap-3">
              {items.map((it) => (
                <span
                  key={it.id}
                  className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-5 py-2.5 text-sm font-semibold text-brand-800"
                >
                  <Icon name={it.icon} size={18} />
                  {pick(it, "title", locale)}
                </span>
              ))}
            </div>
          </div>
        </section>
      );

    case "story":
      return (
        <section className={`${container} py-16`}>
          <Heading title={title} subtitle={subtitle} />
          <div className="grid gap-5 md:grid-cols-3">
            {items.map((it, i) => (
              <div key={it.id} className="relative rounded-2xl border border-gray-200 bg-white p-6">
                <div className="mb-3 flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-600 text-white">
                    <Icon name={it.icon || String(i + 1)} size={20} />
                  </span>
                  <h3 className="font-semibold text-gray-900">{pick(it, "title", locale)}</h3>
                </div>
                <p className="text-sm text-gray-500">{pick(it, "text", locale)}</p>
              </div>
            ))}
          </div>
        </section>
      );

    case "quality":
      return (
        <section className="bg-white">
          <div className={`${container} py-16`}>
            <div className="mx-auto max-w-3xl rounded-2xl border border-gray-200 bg-gray-50 p-8">
              <div className="mb-4 flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                  <Icon name="shield" size={20} />
                </span>
                <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
              </div>
              {subtitle ? <p className="mb-3 text-gray-500">{subtitle}</p> : null}
              {body ? <div className="prose-cms leading-relaxed text-gray-600" dangerouslySetInnerHTML={{ __html: body }} /> : null}
            </div>
          </div>
        </section>
      );

    case "how_we_work":
      return (
        <section className={`${container} py-16`}>
          <Heading title={title} subtitle={subtitle} />
          <ol className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {items.map((it, i) => (
              <li key={it.id} className="rounded-2xl border border-gray-200 bg-white p-6">
                <span className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-brand-600 text-sm font-bold text-white">
                  {/^\d$/.test(it.icon || "") ? it.icon : i + 1}
                </span>
                <h3 className="font-semibold text-gray-900">{pick(it, "title", locale)}</h3>
                <p className="mt-2 text-sm text-gray-500">{pick(it, "text", locale)}</p>
              </li>
            ))}
          </ol>
        </section>
      );

    case "coverage":
      return (
        <section className="bg-white">
          <div className={`${container} py-16 text-center`}>
            <Heading title={title} subtitle={subtitle} />
            <div className="flex flex-wrap justify-center gap-3">
              {items.map((it) => (
                <span key={it.id} className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-gray-50 px-4 py-2 text-sm font-medium text-gray-700">
                  <Icon name={it.icon || "pin"} size={16} className="text-brand-600" />
                  {pick(it, "title", locale)}
                </span>
              ))}
            </div>
          </div>
        </section>
      );

    case "closing":
      return (
        <section className={`${container} py-16`}>
          <blockquote className="mx-auto max-w-3xl border-s-4 border-brand-600 bg-brand-50 px-8 py-6 text-lg italic leading-relaxed text-brand-900">
            {title ? <p className="mb-2 font-semibold not-italic">{title}</p> : null}
            {body ? <div className="prose-cms" dangerouslySetInnerHTML={{ __html: body }} /> : null}
          </blockquote>
        </section>
      );

    default:
      // Unknown section keys still render so new admin-created sections appear.
      return (
        <section className={`${container} py-16`}>
          <Heading title={title} subtitle={subtitle} />
          {s.imageUrl ? <AppImage src={s.imageUrl} alt={title} className="mb-6 aspect-[21/9] w-full rounded-2xl" /> : null}
          {body ? <div className="prose-cms mx-auto max-w-3xl text-gray-600" dangerouslySetInnerHTML={{ __html: body }} /> : null}
          {items.length ? (
            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((it) => (
                <div key={it.id} className="rounded-2xl border border-gray-200 bg-white p-6">
                  {it.imageUrl ? (
                    <AppImage src={it.imageUrl} alt="" className="mb-4 aspect-[16/9] w-full rounded-xl" />
                  ) : it.icon ? (
                    <span className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                      <Icon name={it.icon} size={22} />
                    </span>
                  ) : null}
                  {pick(it, "title", locale) ? <h3 className="font-semibold text-gray-900">{pick(it, "title", locale)}</h3> : null}
                  {pick(it, "text", locale) ? <p className="mt-2 text-sm text-gray-500">{pick(it, "text", locale)}</p> : null}
                </div>
              ))}
            </div>
          ) : null}
        </section>
      );
  }
}

function Heading({ title, subtitle }: { title: string; subtitle: string }) {
  if (!title && !subtitle) return null;
  return (
    <div className="mb-8 text-center">
      {title ? <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">{title}</h2> : null}
      {subtitle ? <p className="mt-2 text-gray-500">{subtitle}</p> : null}
    </div>
  );
}
