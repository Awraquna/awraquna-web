import type { Metadata } from "next";
import Link from "next/link";
import { getLocale } from "@/lib/i18n";
import { apiGet } from "@/lib/api";
import type { ContentSection } from "@/lib/types";
import { activeItems, pick, sectionBy } from "@/lib/utils";
import { getDict } from "@/i18n";
import EmptyState from "@/components/EmptyState";
import Icon from "@/components/Icon";
import PageHeader from "@/components/PageHeader";
import Container from "@/components/ui/Container";
import Reveal from "@/components/ui/Reveal";

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
    <>
      <PageHeader eyebrow={dict.common.jobsTitle} icon="briefcase" title={title} subtitle={subtitle} align="center" />
      <Container size="sm" className="py-10 lg:py-14">

      {!sections ? (
        <EmptyState title={dict.common.notAvailable} hint={dict.common.notAvailableHint} icon="clipboard" />
      ) : (
        <Reveal className="rounded-3xl border border-border bg-surface p-6 shadow-[0_24px_60px_-40px_rgb(16_24_40_/_0.45)] sm:p-10">
          {body ? <div className="prose-cms leading-relaxed text-muted-foreground" dangerouslySetInnerHTML={{ __html: body }} /> : null}

          {others.map((s) => {
            const items = activeItems(s);
            return (
              <section key={s.id} className="mt-10 border-t border-border pt-8">
                {pick(s, "title", locale) ? <h2 className="text-xl font-bold text-foreground">{pick(s, "title", locale)}</h2> : null}
                {pick(s, "subtitle", locale) ? <p className="mt-1 text-muted-foreground">{pick(s, "subtitle", locale)}</p> : null}
                {pick(s, "body", locale) ? (
                  <div className="prose-cms mt-3 text-muted-foreground" dangerouslySetInnerHTML={{ __html: pick(s, "body", locale) }} />
                ) : null}
                {items.length ? (
                  <ul className="mt-4 space-y-3">
                    {items.map((it) => (
                      <li key={it.id} className="flex gap-3 rounded-xl border border-border p-4">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                          <Icon name={it.icon || "clipboard"} size={18} />
                        </span>
                        <div>
                          <p className="font-semibold text-foreground">{pick(it, "title", locale)}</p>
                          {pick(it, "text", locale) ? <p className="mt-1 text-sm text-muted-foreground">{pick(it, "text", locale)}</p> : null}
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
              className="inline-flex items-center gap-2 rounded-full bg-brand-600 px-6 py-3 text-sm font-semibold text-white shadow-[0_12px_28px_-14px_var(--brand-600)] transition hover:bg-brand-700 dark:text-[#0a1017]"
            >
              <Icon name="mail" size={16} />
              {dict.jobs.cta}
            </Link>
          </div>
        </Reveal>
      )}
      </Container>
    </>
  );
}
