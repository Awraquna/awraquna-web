import type { Metadata } from "next";
import { getLocale } from "@/lib/i18n";
import { apiGet } from "@/lib/api";
import type { Category, ProductDetail, Settings } from "@/lib/types";
import { firstParam, pick } from "@/lib/utils";
import { getDict } from "@/i18n";
import QuoteWizard, { type QuotePreset } from "@/components/contact/QuoteWizard";
import Icon from "@/components/Icon";
import PageHeader from "@/components/PageHeader";
import Container from "@/components/ui/Container";
import Reveal from "@/components/ui/Reveal";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Contact" };

export default async function ContactPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  const locale = await getLocale();
  const dict = getDict(locale);
  // `?product=<slug>` comes from a product page's "Request a quote": the product
  // and the category it belongs to are resolved here, on the server, so the
  // wizard opens already ticked instead of flashing an empty first step.
  const productSlug = firstParam(sp.product).slice(0, 200);
  const [settingsData, categories, product] = await Promise.all([
    apiGet<Settings>("/api/public/settings", { revalidate: 120 }),
    apiGet<Category[]>("/api/public/categories", { revalidate: 300 }),
    productSlug ? apiGet<ProductDetail>(`/api/public/products/${encodeURIComponent(productSlug)}`, { revalidate: 60 }) : null,
  ]);

  const settings = settingsData ?? {};
  const presetCategory = firstParam(sp.category).slice(0, 200) || product?.categorySlug || "";
  const preset: QuotePreset = {
    categories: presetCategory ? [presetCategory] : [],
    product: product
      ? {
          id: product.id,
          slug: product.slug,
          sku: product.sku,
          nameEn: product.nameEn,
          nameAr: product.nameAr,
          imageUrl: product.imageUrl,
          price: product.price,
          unit: product.unit,
          categorySlug: product.categorySlug,
          categoryNameEn: product.categoryNameEn,
          categoryNameAr: product.categoryNameAr,
        }
      : undefined,
  };

  const address = pick(settings, "address", locale);
  const hours = pick(settings, "working_hours", locale);
  const waDigits = (settings.whatsapp || "").replace(/\D/g, "");

  const rows = [
    { icon: "pin", label: dict.common.address, value: address, href: null as string | null, ltr: false },
    { icon: "phone", label: dict.common.phone, value: settings.phone || "", href: settings.phone ? `tel:${settings.phone}` : null, ltr: true },
    { icon: "mail", label: dict.common.email, value: settings.email || "", href: settings.email ? `mailto:${settings.email}` : null, ltr: true },
    { icon: "clock", label: dict.common.workingHours, value: hours, href: null as string | null, ltr: false },
  ].filter((r) => !!r.value);

  return (
    <>
      <PageHeader eyebrow={dict.actions.contactUs} icon="mail" title={dict.common.contactTitle} subtitle={dict.common.contactSubtitle} size="sm" />
      <Container className="py-10 lg:py-14">
      <div className="grid gap-8 lg:grid-cols-5">
        <aside className="space-y-6 lg:col-span-2">
          <Reveal dir="start" className="rounded-3xl border border-border bg-surface p-6 shadow-[0_24px_60px_-44px_rgb(16_24_40_/_0.45)]">
            <h2 className="mb-4 text-lg font-semibold text-foreground">{dict.common.contactInfo}</h2>
            {rows.length ? (
              <ul className="space-y-4">
                {rows.map((r) => (
                  <li key={r.label} className="flex gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                      <Icon name={r.icon} size={18} />
                    </span>
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground/70">{r.label}</p>
                      {r.href ? (
                        <a href={r.href} dir={r.ltr ? "ltr" : undefined} className="text-sm text-foreground hover:text-brand-700">
                          {r.value}
                        </a>
                      ) : (
                        <p className="text-sm text-foreground">{r.value}</p>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground/70">{dict.common.notAvailable}</p>
            )}
            {waDigits ? (
              <a
                href={`https://wa.me/${waDigits}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#25D366] px-4 py-3 text-sm font-semibold text-white transition hover:opacity-90"
              >
                <Icon name="whatsapp" size={18} />
                {dict.actions.whatsapp}
              </a>
            ) : null}
          </Reveal>

          {settings.map_embed_url ? (
            <Reveal dir="start" delay={120} className="overflow-hidden rounded-3xl border border-border bg-surface">
              <iframe
                src={settings.map_embed_url}
                title="Map"
                className="h-64 w-full"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                  allowFullScreen
              />
            </Reveal>
          ) : null}
        </aside>

        <Reveal delay={80} className="rounded-3xl border border-border bg-surface p-6 shadow-[0_24px_60px_-44px_rgb(16_24_40_/_0.45)] sm:p-8 lg:col-span-3">
          <QuoteWizard
            categories={(categories ?? []).filter((c) => c.isActive !== false)}
            locale={locale}
            preset={preset}
            labels={{
              steps: [dict.quote.step1, dict.quote.step2, dict.quote.step3],
              categoriesTitle: dict.quote.categoriesTitle,
              categoriesHint: dict.quote.categoriesHint,
              productsTitle: dict.quote.productsTitle,
              productsHint: dict.quote.productsHint,
              detailsTitle: dict.quote.detailsTitle,
              detailsHint: dict.quote.detailsHint,
              searchProducts: dict.quote.searchProducts,
              noProducts: dict.quote.noProducts,
              loading: dict.quote.loading,
              selected: dict.quote.selected,
              next: dict.quote.next,
              back: dict.quote.back,
              skip: dict.quote.skip,
              addMore: dict.quote.addMore,
              summary: dict.quote.summary,
              wholeCategory: dict.quote.wholeCategory,
              qty: dict.quote.qty,
              remove: dict.quote.remove,
              quoteSubject: dict.quote.subject,
              categoriesLine: dict.quote.categoriesLine,
              productsLine: dict.quote.productsLine,
              name: dict.form.name,
              phone: dict.form.phone,
              email: dict.form.email,
              company: dict.form.company,
              message: dict.form.message,
              messageHint: dict.quote.messageHint,
              send: dict.form.send,
              sending: dict.form.sending,
              success: dict.form.success,
              successHint: dict.quote.successHint,
              again: dict.quote.again,
              error: dict.form.error,
            }}
          />
        </Reveal>
      </div>
      </Container>
    </>
  );
}
