import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getLocale } from "@/lib/i18n";
import { apiFetch, apiGet } from "@/lib/api";
import type { ProductDetail } from "@/lib/types";
import { formatPrice, pick } from "@/lib/utils";
import { getDict } from "@/i18n";
import Gallery from "@/components/products/Gallery";
import ProductCard from "@/components/ProductCard";
import EmptyState from "@/components/EmptyState";
import Icon from "@/components/Icon";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const locale = await getLocale();
  const product = await apiGet<ProductDetail>(`/api/public/products/${encodeURIComponent(slug)}`);
  if (!product) return { title: "Product" };
  const name = pick(product, "name", locale);
  return { title: name, description: pick(product, "shortDesc", locale) || undefined };
}

export default async function ProductPage({ params }: Params) {
  const { slug } = await params;
  const locale = await getLocale();
  const dict = getDict(locale);
  const settings = await apiGet<Record<string, string | null>>("/api/public/settings", { revalidate: 120 });
  const res = await apiFetch<ProductDetail>(`/api/public/products/${encodeURIComponent(slug)}`);

  if (!res.ok && res.status === 404) notFound();

  if (!res.ok) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <EmptyState title={dict.common.notAvailable} hint={dict.common.notAvailableHint} />
        <div className="mt-6 text-center">
          <Link href="/products" className="text-sm font-semibold text-brand-700 hover:underline">
            {dict.actions.backToProducts}
          </Link>
        </div>
      </div>
    );
  }

  const p = res.data;
  const name = pick(p, "name", locale);
  const shortDesc = pick(p, "shortDesc", locale);
  const description = pick(p, "description", locale);
  const category = pick(p, "categoryName", locale);
  const subCategory = pick(p, "subCategoryName", locale);
  const price = formatPrice(p.price, locale);

  const images = [p.imageUrl, ...(p.images ?? []).sort((a, b) => a.sortOrder - b.sortOrder).map((i) => i.imageUrl)].filter(
    (u, i, arr): u is string => !!u && arr.indexOf(u) === i,
  );
  const specs = (p.specs ?? []).slice().sort((a, b) => a.sortOrder - b.sortOrder);
  const quoteHref = `/contact?subject=${encodeURIComponent(`${dict.actions.requestQuote}: ${name}${p.sku ? ` (${p.sku})` : ""}`)}`;
  const waDigits = (settings?.whatsapp || "").replace(/\D/g, "");
  const waHref = waDigits ? `https://wa.me/${waDigits}?text=${encodeURIComponent(`${dict.actions.requestQuote}: ${name}${p.sku ? ` (${p.sku})` : ""}`)}` : null;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <nav className="mb-6 flex flex-wrap items-center gap-1 text-sm text-muted-foreground" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-brand-700">
          {dict.nav.home}
        </Link>
        <Icon name="chevron-right" size={14} className="rtl:rotate-180" />
        <Link href="/products" className="hover:text-brand-700">
          {dict.nav.products}
        </Link>
        {p.categorySlug && category ? (
          <>
            <Icon name="chevron-right" size={14} className="rtl:rotate-180" />
            <Link href={`/products?category=${encodeURIComponent(p.categorySlug)}`} className="hover:text-brand-700">
              {category}
            </Link>
          </>
        ) : null}
        <Icon name="chevron-right" size={14} className="rtl:rotate-180" />
        <span className="text-foreground">{name}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-2">
        <Gallery images={images} alt={name} />

        <div>
          <div className="flex flex-wrap gap-2">
            {category ? (
              <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700">{category}</span>
            ) : null}
            {subCategory ? <span className="rounded-full bg-surface-2 px-3 py-1 text-xs font-medium text-muted-foreground">{subCategory}</span> : null}
          </div>
          <h1 className="mt-3 text-3xl font-bold text-foreground">{name}</h1>
          {p.sku ? (
            <p className="mt-2 text-sm text-muted-foreground/70">
              {dict.common.sku}: <span className="font-mono text-muted-foreground">{p.sku}</span>
            </p>
          ) : null}

          <p className="mt-5 text-2xl font-bold text-foreground">
            {price ? (
              <>
                {price}
                {p.unit ? <span className="ms-2 text-sm font-normal text-muted-foreground/70">/ {p.unit}</span> : null}
              </>
            ) : (
              <span className="text-brand-700">{dict.common.quoteOnRequest}</span>
            )}
          </p>

          {shortDesc ? <p className="mt-4 text-muted-foreground">{shortDesc}</p> : null}

          <div className="mt-6 flex flex-wrap gap-3">
            <Link href={quoteHref} className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-6 py-3 text-sm font-semibold text-white dark:text-[#0a1017] transition hover:bg-brand-700">
              <Icon name="mail" size={16} />
              {dict.actions.requestQuote}
            </Link>
            {waHref ? (
              <a
                href={waHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl border border-[#25D366] px-6 py-3 text-sm font-semibold text-[#128C7E] transition hover:bg-[#25D366]/10"
              >
                <Icon name="whatsapp" size={16} />
                {dict.actions.whatsapp}
              </a>
            ) : null}
          </div>

          {p.businessAreas?.length ? (
            <div className="mt-8">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground/70">{dict.common.suitableFor}</p>
              <div className="flex flex-wrap gap-2">
                {p.businessAreas.map((a) => (
                  <Link
                    key={a.id}
                    href={`/products?area=${encodeURIComponent(a.slug)}`}
                    className="inline-flex items-center gap-1 rounded-full border border-border bg-surface px-3 py-1 text-xs font-medium text-muted-foreground hover:border-brand-400 hover:text-brand-700"
                  >
                    <Icon name="building" size={12} />
                    {pick(a, "name", locale)}
                  </Link>
                ))}
              </div>
            </div>
          ) : null}

          {specs.length ? (
            <div className="mt-8 overflow-hidden rounded-2xl border border-border bg-surface">
              <h2 className="border-b border-border bg-surface-2 px-4 py-2.5 text-sm font-semibold text-foreground">{dict.common.specs}</h2>
              <table className="w-full text-sm">
                <tbody>
                  {specs.map((s) => (
                    <tr key={s.id} className="border-b border-border last:border-0">
                      <th scope="row" className="w-1/3 px-4 py-2.5 text-start font-medium text-muted-foreground">
                        {pick(s, "label", locale)}
                      </th>
                      <td className="px-4 py-2.5 text-foreground">{pick(s, "value", locale)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}
        </div>
      </div>

      {description ? (
        <section className="mt-12 rounded-2xl border border-border bg-surface p-6">
          <h2 className="mb-3 text-lg font-semibold text-foreground">{dict.common.description}</h2>
          <div className="prose-cms text-muted-foreground" dangerouslySetInnerHTML={{ __html: description }} />
        </section>
      ) : null}

      {p.related?.length ? (
        <section className="mt-16">
          <h2 className="mb-6 text-2xl font-bold text-foreground">{dict.common.related}</h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {p.related.map((r) => (
              <ProductCard key={r.id} product={r} locale={locale} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
