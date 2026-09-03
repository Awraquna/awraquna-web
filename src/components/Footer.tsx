import Link from "next/link";
import type { Category, Locale, Settings } from "@/lib/types";
import { pick } from "@/lib/utils";
import { apiGet, imageUrl } from "@/lib/api";
import { getDict } from "@/i18n";
import Icon from "./Icon";
import SiteLogo from "./SiteLogo";
import Container from "./ui/Container";
import Reveal from "./ui/Reveal";

type Props = { locale: Locale; settings: Settings | null };

export default async function Footer({ locale, settings }: Props) {
  const dict = getDict(locale);
  const s = settings ?? {};
  const siteName = s.site_name || dict.siteName;
  const logoUrl = imageUrl(s.logo_url);
  const about = pick(s, "footer_text", locale);
  const copyright = pick(s, "copyright", locale) || `© ${siteName}`;
  const address = pick(s, "address", locale);
  const hours = pick(s, "working_hours", locale);
  const year = new Date().getFullYear();

  // Same request the header's mega-menu makes, so Next serves it from the
  // per-render fetch cache rather than hitting the API twice.
  const categories = (await apiGet<Category[]>("/api/public/categories", { revalidate: 300 })) ?? [];

  const columns: { title: string; links: { href: string; label: string }[] }[] = [
    {
      title: dict.common.quickLinks,
      links: [
        { href: "/", label: dict.nav.home },
        { href: "/products", label: dict.nav.products },
        { href: "/about-us", label: dict.nav.about },
        { href: "/news", label: dict.nav.news },
        { href: "/jobs", label: dict.nav.jobs },
        { href: "/contact", label: dict.nav.contact },
      ],
    },
    {
      title: dict.common.categories,
      links: categories
        .filter((c) => c.isActive !== false)
        .slice(0, 6)
        .map((c) => ({ href: `/products?category=${encodeURIComponent(c.slug)}`, label: pick(c, "name", locale) })),
    },
  ].filter((col) => col.links.length > 0);

  const socials = [
    { key: "facebook", url: s.facebook_url, label: "Facebook" },
    { key: "linkedin", url: s.linkedin_url, label: "LinkedIn" },
    { key: "instagram", url: s.instagram_url, label: "Instagram" },
    { key: "x", url: s.twitter_url, label: "X" },
    { key: "youtube", url: s.youtube_url, label: "YouTube" },
  ].filter((x) => !!x.url);

  const waDigits = (s.whatsapp || "").replace(/\D/g, "");

  const contactRows = [
    address ? { icon: "pin", value: address, href: null, ltr: false } : null,
    s.phone ? { icon: "phone", value: s.phone, href: `tel:${s.phone.replace(/\s+/g, "")}`, ltr: true } : null,
    s.email ? { icon: "mail", value: s.email, href: `mailto:${s.email}`, ltr: true } : null,
    hours ? { icon: "clock", value: hours, href: null, ltr: false } : null,
  ].filter(Boolean) as { icon: string; value: string; href: string | null; ltr: boolean }[];

  return (
    <footer className="relative overflow-hidden border-t border-border bg-surface text-foreground">
      {/* Brand hairline + a soft glow anchoring the footer to the page above it. */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-500/50 to-transparent" />
      <div className="pointer-events-none absolute -top-32 start-1/4 h-72 w-72 rounded-full bg-[var(--brand-soft)] blur-3xl" />

      <Container className="relative py-14 lg:py-16">
        <div className="grid gap-x-8 gap-y-10 md:grid-cols-2 lg:grid-cols-12">
          {/* Brand + contact */}
          <Reveal className="lg:col-span-5">
            <Link href="/" aria-label={siteName} className="inline-flex">
              <SiteLogo src={logoUrl} siteName={siteName} className="h-10" />
            </Link>
            {about ? <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground">{about}</p> : null}

            <ul className="mt-6 space-y-3 text-sm text-muted-foreground">
              {contactRows.map((r) => (
                <li key={r.icon} className="flex gap-3">
                  <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                    <Icon name={r.icon} size={16} />
                  </span>
                  {r.href ? (
                    <a href={r.href} dir={r.ltr ? "ltr" : undefined} className="self-center transition-colors hover:text-brand-600">
                      {r.value}
                    </a>
                  ) : (
                    <span className="self-center">{r.value}</span>
                  )}
                </li>
              ))}
            </ul>

            {waDigits ? (
              <a
                href={`https://wa.me/${waDigits}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 inline-flex items-center gap-2 rounded-full border border-border px-4 py-2.5 text-sm font-semibold transition-colors hover:border-[#25D366] hover:text-[#25D366]"
              >
                <Icon name="whatsapp" size={16} />
                {dict.actions.whatsapp}
              </a>
            ) : null}
          </Reveal>

          {/* Link columns */}
          {columns.map((col, i) => (
            <Reveal key={col.title} delay={80 + i * 60} className="lg:col-span-2">
              <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-foreground">{col.title}</h3>
              <ul className="space-y-2.5">
                {col.links.map((l) => (
                  <li key={l.href + l.label}>
                    <Link
                      href={l.href}
                      className="group inline-flex items-center text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      <span className="me-0 h-px w-0 bg-brand-500 transition-all duration-300 group-hover:me-2 group-hover:w-4" />
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </Reveal>
          ))}

          {/* Closing CTA */}
          <Reveal delay={200} className="lg:col-span-3">
            <div className="brand-panel rounded-2xl p-5">
              <h3 className="text-base font-bold">{dict.common.needHelp}</h3>
              <p className="mt-1.5 text-sm text-white/80">{dict.common.needHelpHint}</p>
              <Link
                href="/contact"
                className="brand-panel-btn mt-4 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-transform hover:scale-[1.03]"
              >
                {dict.actions.requestQuote}
                <Icon name="arrow-right" size={15} className="rtl:rotate-180" />
              </Link>
            </div>
          </Reveal>
        </div>

        <div className="mt-12 flex flex-col-reverse items-start justify-between gap-5 border-t border-border pt-6 sm:flex-row sm:items-center">
          <p className="text-xs text-muted-foreground">
            {copyright} {year}
            {pick(s, "tagline", locale) ? <span className="mx-2 opacity-40">·</span> : null}
            <span className="opacity-80">{pick(s, "tagline", locale)}</span>
          </p>
          {socials.length ? (
            <div className="flex items-center gap-2.5">
              <span className="me-1 text-xs uppercase tracking-wider text-muted-foreground">{dict.common.followUs}</span>
              {socials.map((x) => (
                <a
                  key={x.key}
                  href={x.url!}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={x.label}
                  title={x.label}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted-foreground transition-all hover:-translate-y-0.5 hover:border-brand-500/60 hover:text-brand-600"
                >
                  <Icon name={x.key} size={16} />
                </a>
              ))}
            </div>
          ) : null}
        </div>
      </Container>
    </footer>
  );
}
