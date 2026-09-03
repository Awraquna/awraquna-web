import type { Metadata } from "next";
import { getLocale } from "@/lib/i18n";
import { apiGet, buildQuery } from "@/lib/api";
import type { BusinessArea, Category, Paged, ProductCard as ProductCardType } from "@/lib/types";
import { firstParam, pick, toInt } from "@/lib/utils";
import { getDict } from "@/i18n";
import ProductsSidebar from "@/components/products/ProductsSidebar";
import ProductCard from "@/components/ProductCard";
import Pagination from "@/components/Pagination";
import EmptyState from "@/components/EmptyState";
import Icon from "@/components/Icon";
import PageHeader from "@/components/PageHeader";
import Container from "@/components/ui/Container";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Products" };

const PAGE_SIZE = 12;

type SearchParams = Record<string, string | string[] | undefined>;

export default async function ProductsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const sp = await searchParams;
  const locale = await getLocale();
  const dict = getDict(locale);

  const filters = {
    search: firstParam(sp.search).trim(),
    category: firstParam(sp.category).trim(),
    subCategory: firstParam(sp.subCategory).trim(),
    area: firstParam(sp.area).trim(),
  };
  const page = toInt(firstParam(sp.page), 1);

  const [categories, areas, products] = await Promise.all([
    apiGet<Category[]>("/api/public/categories"),
    apiGet<BusinessArea[]>("/api/public/business-areas"),
    apiGet<Paged<ProductCardType>>(
      `/api/public/products${buildQuery({ ...filters, page, pageSize: PAGE_SIZE })}`,
      { revalidate: 30 },
    ),
  ]);

  const items = products?.items ?? [];
  const total = products?.total ?? 0;

  // Human-readable heading for the current filter.
  const currentCategory = categories?.find((c) => c.slug === filters.category);
  const currentSub = currentCategory?.subCategories?.find((s) => s.slug === filters.subCategory);
  const currentArea = areas?.find((a) => a.slug === filters.area);
  const heading =
    (currentSub && pick(currentSub, "name", locale)) ||
    (currentCategory && pick(currentCategory, "name", locale)) ||
    (currentArea && pick(currentArea, "name", locale)) ||
    dict.common.productsTitle;

  return (
    <>
      <PageHeader
        eyebrow={dict.nav.products}
        icon="box"
        title={heading}
        subtitle={dict.common.productsSubtitle}
        size="sm"
      >
        {/* The search lives in the banner so the filter state and the page title
            read as one control surface. */}
        <form action="/products" method="get" className="mt-7 flex max-w-2xl gap-2" role="search">
          {filters.category ? <input type="hidden" name="category" value={filters.category} /> : null}
          {filters.subCategory ? <input type="hidden" name="subCategory" value={filters.subCategory} /> : null}
          {filters.area ? <input type="hidden" name="area" value={filters.area} /> : null}
          <div className="relative flex-1">
            <Icon name="search" size={18} className="pointer-events-none absolute start-4 top-1/2 -translate-y-1/2 text-muted-foreground/70" />
            <input
              type="search"
              name="search"
              defaultValue={filters.search}
              placeholder={dict.common.searchPlaceholder}
              className="h-12 w-full rounded-full border border-border bg-surface pe-4 ps-11 text-sm text-foreground shadow-sm outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-500/25"
            />
          </div>
          <button
            type="submit"
            className="h-12 shrink-0 rounded-full bg-brand-600 px-6 text-sm font-semibold text-white shadow-[0_12px_28px_-14px_var(--brand-600)] transition hover:bg-brand-700 dark:text-[#0a1017]"
          >
            {dict.actions.search}
          </button>
        </form>
      </PageHeader>

      <Container className="py-10 lg:py-14">
      <div className="flex flex-col gap-8 lg:flex-row">
        <ProductsSidebar
          categories={categories ?? []}
          areas={areas ?? []}
          filters={filters}
          locale={locale}
          labels={{
            filters: dict.actions.filters,
            categories: dict.common.categories,
            businessAreas: dict.common.businessAreas,
            allProducts: dict.common.allProducts,
            clear: dict.actions.clearFilters,
          }}
        />

        <div className="min-w-0 flex-1">
          {products ? (
            <p className="mb-4 text-sm text-muted-foreground">
              {total} {dict.common.results}
              {filters.search ? (
                <>
                  {" "}
                  · &quot;{filters.search}&quot;
                </>
              ) : null}
            </p>
          ) : null}

          {!products ? (
            <EmptyState title={dict.common.notAvailable} hint={dict.common.notAvailableHint} />
          ) : items.length === 0 ? (
            <EmptyState title={dict.common.noProducts} icon="search" />
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {items.map((p) => (
                <ProductCard key={p.id} product={p} locale={locale} />
              ))}
            </div>
          )}

          <Pagination basePath="/products" params={filters} page={page} pageSize={products?.pageSize || PAGE_SIZE} total={total} dict={dict} />
        </div>
      </div>
      </Container>
    </>
  );
}
