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
import PageHeader from "@/components/PageHeader";
import ProductsSearch from "@/components/products/ProductsSearch";
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
            read as one control surface. It filters as you type. */}
        <ProductsSearch
          initial={filters.search}
          params={{ category: filters.category, subCategory: filters.subCategory, area: filters.area }}
          placeholder={dict.common.searchPlaceholder}
          labels={{ search: dict.actions.search, searching: dict.common.searching }}
        />
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
