import type { Metadata } from "next";
import Link from "next/link";
import { getLocale } from "@/lib/i18n";
import { apiGet } from "@/lib/api";
import type { ContentSection } from "@/lib/types";
import { activeItems, pick, sectionBy } from "@/lib/utils";
import { getDict } from "@/i18n";
import EmptyState from "@/components/EmptyState";
import Icon from "@/components/Icon";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Jobs" };

export default async function JobsPage() {
  const locale = await getLocale();
  const dict = getDict(locale);
  const sections = await apiGet<ContentSection[]>("/api/public/pages/jobs");
  const intro = sectionBy(sections, "intro");
  const others = (sections ?? []).filter((s) => s.sectionKey !== "intro" && s.isActive !== false).sort((a, b) => a.sortOrder - b.sortOrder);

  const title = pick(intro, "title", locale) || dict.common.jobsTitle;
  const subtitle = pick(intro, "subtitle", locale);
  const body = pick(intro, "body", locale);

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">{title}</h1>
        {subtitle ? <p className="mt-2 text-lg text-gray-500">{subtitle}</p> : null}
      </div>

      {!sections ? (
        <EmptyState title={dict.common.notAvailable} hint={dict.common.notAvailableHint} icon="clipboard" />
      ) : (
        <div className="rounded-2xl border border-gray-200 bg-white p-6 sm:p-10">
          {body ? <div className="prose-cms leading-relaxed text-gray-600" dangerouslySetInnerHTML={{ __html: body }} /> : null}

          {others.map((s) => {
            const items = activeItems(s);
            return (
              <section key={s.id} className="mt-10 border-t border-gray-100 pt-8">
                {pick(s, "title", locale) ? <h2 className="text-xl font-bold text-gray-900">{pick(s, "title", locale)}</h2> : null}
                {pick(s, "subtitle", locale) ? <p className="mt-1 text-gray-500">{pick(s, "subtitle", locale)}</p> : null}
                {pick(s, "body", locale) ? (
                  <div className="prose-cms mt-3 text-gray-600" dangerouslySetInnerHTML={{ __html: pick(s, "body", locale) }} />
                ) : null}
                {items.length ? (
                  <ul className="mt-4 space-y-3">
                    {items.map((it) => (
                      <li key={it.id} className="flex gap-3 rounded-xl border border-gray-200 p-4">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                          <Icon name={it.icon || "clipboard"} size={18} />
                        </span>
                        <div>
                          <p className="font-semibold text-gray-900">{pick(it, "title", locale)}</p>
                          {pick(it, "text", locale) ? <p className="mt-1 text-sm text-gray-500">{pick(it, "text", locale)}</p> : null}
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </section>
            );
          })}

          <div className="mt-10 text-center">
            <Link
              href={`/contact?subject=${encodeURIComponent(title)}`}
              className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-700"
            >
              <Icon name="mail" size={16} />
              {dict.jobs.cta}
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
