import type { Locale, Settings } from "@/lib/types";
import { imageUrl } from "@/lib/api";
import { getDict } from "@/i18n";
import HeaderClient from "./HeaderClient";

type Props = { locale: Locale; settings: Settings | null };

export default function Header({ locale, settings }: Props) {
  const dict = getDict(locale);
  const links = [
    { href: "/", label: dict.nav.home },
    { href: "/products", label: dict.nav.products },
    { href: "/about-us", label: dict.nav.about },
    { href: "/news", label: dict.nav.news },
    { href: "/contact", label: dict.nav.contact },
    { href: "/jobs", label: dict.nav.jobs },
  ];

  return (
    <HeaderClient
      locale={locale}
      siteName={settings?.site_name || dict.siteName}
      logoUrl={imageUrl(settings?.logo_url)}
      phone={settings?.phone || null}
      links={links}
      labels={{
        callUs: dict.actions.callUs,
        openMenu: dict.actions.openMenu,
        closeMenu: dict.actions.closeMenu,
        switchLanguage: dict.actions.switchLanguage,
      }}
    />
  );
}
