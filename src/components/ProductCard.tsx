import Link from "next/link";
import type { Locale, ProductCard as ProductCardType } from "@/lib/types";
import { formatPrice, pick } from "@/lib/utils";
import { getDict } from "@/i18n";
import AppImage from "./AppImage";
import Icon from "./Icon";

type Props = { product: ProductCardType; locale: Locale };

export default function ProductCard({ product, locale }: Props) {
  const dict = getDict(locale);
  const name = pick(product, "name", locale);
  const shortDesc = pick(product, "shortDesc", locale);
  const category = pick(product, "categoryName", locale);
  const price = formatPrice(product.price, locale);
  const href = `/products/${product.slug}`;

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-3xl border border-border bg-surface transition-all duration-300 hover:-translate-y-1 hover:border-brand-300 hover:shadow-[0_28px_60px_-32px_rgb(16_24_40_/_0.45)]">
      <Link href={href} className="relative block overflow-hidden" aria-label={name}>
        <AppImage
          src={product.imageUrl}
          alt={name}
          className="aspect-[4/3] w-full"
          imgClassName="transition-transform duration-500 group-hover:scale-105"
          icon="box"
          iconSize={40}
        />
        {product.isFeatured ? (
          <span className="absolute start-3 top-3 inline-flex items-center gap-1 rounded-full bg-surface/90 px-2.5 py-1 text-[11px] font-semibold text-brand-700 shadow-sm backdrop-blur">
            <Icon name="star" size={11} />
            {dict.common.featured}
          </span>
        ) : null}
      </Link>
      <div className="flex flex-1 flex-col p-5">
        {category ? (
          <span className="mb-2 inline-flex w-fit items-center rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-medium text-brand-700">
            {category}
          </span>
        ) : null}
        <h3 className="text-base font-semibold leading-snug text-foreground">
          <Link href={href} className="transition-colors hover:text-brand-600">
            {name}
          </Link>
        </h3>
        {product.sku ? (
          <p className="mt-1 text-xs text-muted-foreground/70">
            {dict.common.sku}: <span className="font-mono">{product.sku}</span>
          </p>
        ) : null}
        {shortDesc ? <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{shortDesc}</p> : null}
        <div className="mt-auto flex items-center justify-between gap-3 border-t border-border pt-4">
          <span className="text-sm font-semibold text-foreground">
            {price ? (
              <>
                {price}
                {product.unit ? <span className="ms-1 text-xs font-normal text-muted-foreground/70">/ {product.unit}</span> : null}
              </>
            ) : (
              <span className="text-brand-600">{dict.common.quoteOnRequest}</span>
            )}
          </span>
          <Link
            href={href}
            className="inline-flex items-center gap-1 rounded-full bg-brand-600 px-3.5 py-2 text-xs font-semibold text-white transition-all hover:bg-brand-700 dark:text-[#0a1017]"
          >
            {dict.actions.viewProduct}
            <Icon name="arrow-right" size={14} className="transition-transform group-hover:translate-x-0.5 rtl:rotate-180" />
          </Link>
        </div>
      </div>
    </article>
  );
}
