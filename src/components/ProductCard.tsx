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
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white transition hover:-translate-y-0.5 hover:shadow-md">
      <Link href={href} className="block" aria-label={name}>
        <AppImage src={product.imageUrl} alt={name} className="aspect-[4/3] w-full" icon="box" iconSize={40} />
      </Link>
      <div className="flex flex-1 flex-col p-4">
        {category ? (
          <span className="mb-2 inline-flex w-fit items-center rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-medium text-brand-700">
            {category}
          </span>
        ) : null}
        <h3 className="text-base font-semibold leading-snug text-gray-900">
          <Link href={href} className="hover:text-brand-700">
            {name}
          </Link>
        </h3>
        {product.sku ? (
          <p className="mt-1 text-xs text-gray-400">
            {dict.common.sku}: <span className="font-mono">{product.sku}</span>
          </p>
        ) : null}
        {shortDesc ? <p className="mt-2 line-clamp-2 text-sm text-gray-500">{shortDesc}</p> : null}
        <div className="mt-auto flex items-center justify-between gap-3 pt-4">
          <span className="text-sm font-semibold text-gray-900">
            {price ? (
              <>
                {price}
                {product.unit ? <span className="ms-1 text-xs font-normal text-gray-400">/ {product.unit}</span> : null}
              </>
            ) : (
              <span className="text-brand-700">{dict.common.quoteOnRequest}</span>
            )}
          </span>
          <Link
            href={href}
            className="inline-flex items-center gap-1 rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-brand-700"
          >
            {dict.actions.viewProduct}
            <Icon name="arrow-right" size={14} className="rtl:rotate-180" />
          </Link>
        </div>
      </div>
    </article>
  );
}
