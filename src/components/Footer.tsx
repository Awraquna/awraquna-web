import Link from "next/link";
import type { Locale, Settings } from "@/lib/types";
import { pick } from "@/lib/utils";
import { imageUrl } from "@/lib/api";
import { getDict } from "@/i18n";
import Icon from "./Icon";
import SiteLogo from "./SiteLogo";

type Props = { locale: Locale; settings: Settings | null };

export default function Footer({ locale, settings }: Props) {
  const dict = getDict(locale);
  const s = settings ?? {};
  const siteName = s.site_name || dict.siteName;
  const logoUrl = imageUrl(s.logo_url);
  const about = pick(s, "footer_text", locale);
  const copyright = pick(s, "copyright", locale) || `© ${siteName}`;
  const address = pick(s, "address", locale);
  const hours = pick(s, "working_hours", locale);
  const year = new Date().getFullYear();

  const links = [
    { href: "/", label: dict.nav.home },
    { href: "/products", label: dict.nav.products },
    { href: "/about-us", label: dict.nav.about },
    { href: "/news", label: dict.nav.news },
    { href: "/contact", label: dict.nav.contact },
    { href: "/jobs", label: dict.nav.jobs },
  ];

  const socials = [
    { key: "facebook", url: s.facebook_url, label: "Facebook" },
    { key: "linkedin", url: s.linkedin_url, label: "LinkedIn" },
    { key: "instagram", url: s.instagram_url, label: "Instagram" },
  ].filter((x) => !!x.url);

  return (
    <footer className="mt-16 border-t border-gray-200 bg-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-2 lg:grid-cols-4 lg:px-8">
        <div>
          <SiteLogo src={logoUrl} siteName={siteName} className="h-9" />
          {about ? <p className="mt-4 text-sm leading-relaxed text-gray-500">{about}</p> : null}
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-900">{dict.common.quickLinks}</h3>
          <ul className="mt-4 space-y-2">
            {links.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="text-sm text-gray-500 transition hover:text-brand-700">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-900">{dict.common.contactInfo}</h3>
          <ul className="mt-4 space-y-3 text-sm text-gray-500">
            {address ? (
              <li className="flex gap-2">
                <Icon name="pin" size={18} className="mt-0.5 shrink-0 text-brand-600" />
                <span>{address}</span>
              </li>
            ) : null}
            {s.phone ? (
              <li className="flex gap-2">
                <Icon name="phone" size={18} className="mt-0.5 shrink-0 text-brand-600" />
                <a href={`tel:${s.phone}`} dir="ltr" className="hover:text-brand-700">
                  {s.phone}
                </a>
              </li>
            ) : null}
            {s.email ? (
              <li className="flex gap-2">
                <Icon name="mail" size={18} className="mt-0.5 shrink-0 text-brand-600" />
                <a href={`mailto:${s.email}`} className="hover:text-brand-700">
                  {s.email}
                </a>
              </li>
            ) : null}
            {hours ? (
              <li className="flex gap-2">
                <Icon name="clock" size={18} className="mt-0.5 shrink-0 text-brand-600" />
                <span>{hours}</span>
              </li>
            ) : null}
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-900">{dict.common.followUs}</h3>
          {socials.length ? (
            <div className="mt-4 flex gap-2">
              {socials.map((x) => (
                <a
                  key={x.key}
                  href={x.url!}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={x.label}
                  className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition hover:border-brand-400 hover:text-brand-700"
                >
                  <Icon name={x.key} size={18} />
                </a>
              ))}
            </div>
          ) : (
            <p className="mt-4 text-sm text-gray-400">—</p>
          )}
        </div>
      </div>
      <div className="border-t border-gray-100">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-4 text-xs text-gray-400 sm:flex-row sm:px-6 lg:px-8">
          <span>
            {copyright} {year}
          </span>
          <span>{pick(s, "tagline", locale)}</span>
        </div>
      </div>
    </footer>
  );
}
