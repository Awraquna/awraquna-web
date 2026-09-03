import type { BusinessArea, Category, Locale, Settings } from "@/lib/types";
import { apiGet, imageUrl } from "@/lib/api";
import { getDict } from "@/i18n";
import HeaderClient, { type NavLink } from "./HeaderClient";

type Props = { locale: Locale; settings: Settings | null };

export default async function Header({ locale, settings }: Props) {
  const dict = getDict(locale);

  // Feeds the Products mega-menu. Both are cached for 5 minutes and shared with
  // the products page's own fetch, so opening the menu costs no request.
  const [categories, areas] = await Promise.all([
    apiGet<Category[]>("/api/public/categories", { revalidate: 300 }),
    apiGet<BusinessArea[]>("/api/public/business-areas", { revalidate: 300 }),
  ]);

  const links: NavLink[] = [
    { href: "/", label: dict.nav.home, icon: "home" },
    { href: "/products", label: dict.nav.products, icon: "box", panel: "products" },
    { href: "/about-us", label: dict.nav.about, icon: "building" },
    { href: "/news", label: dict.nav.news, icon: "news" },
    { href: "/jobs", label: dict.nav.jobs, icon: "briefcase" },
    { href: "/contact", label: dict.nav.contact, icon: "mail" },
  ];

  return (
    <HeaderClient
      locale={locale}
      siteName={settings?.site_name || dict.siteName}
      logoUrl={imageUrl(settings?.logo_url)}
      phone={settings?.phone || null}
      links={links}
      categories={(categories ?? []).filter((c) => c.isActive !== false)}
      areas={(areas ?? []).filter((a) => a.isActive !== false)}
      labels={{
        callUs: dict.actions.callUs,
        openMenu: dict.actions.openMenu,
        closeMenu: dict.actions.closeMenu,
        switchLanguage: dict.actions.switchLanguage,
        theme: dict.actions.toggleTheme,
        search: dict.actions.search,
        searchPlaceholder: dict.common.searchPlaceholder,
        contactUs: dict.actions.contactUs,
        mega: {
          categories: dict.common.categories,
          businessAreas: dict.common.businessAreas,
          allProducts: dict.common.allProducts,
          viewAll: dict.actions.viewAll,
          products: dict.common.products,
          blurbTitle: dict.common.needHelp,
          blurbText: dict.common.needHelpHint,
        },
      }}
    />
  );
}
