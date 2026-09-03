import type { ContentSection, Locale } from "./types";

/**
 * pick(obj, "name", "ar") returns obj.nameAr when present, otherwise obj.nameEn.
 *
 * Two key shapes are in play and both must work: the entity DTOs are camelCase
 * (`nameEn` / `nameAr`), while the settings bag is a flat key/value table keyed
 * snake_case (`address_en` / `address_ar`). Checking both is what makes
 * `pick(settings, "address", locale)` resolve — without the snake_case fallback
 * the address, working hours, footer text and copyright all render empty.
 */
export function pick(obj: unknown, field: string, locale: Locale): string {
  if (!obj || typeof obj !== "object") return "";
  const o = obj as Record<string, unknown>;
  const str = (v: unknown) => (typeof v === "string" && v.trim() ? v : "");
  const ar = str(o[`${field}Ar`]) || str(o[`${field}_ar`]);
  const en = str(o[`${field}En`]) || str(o[`${field}_en`]);
  return (locale === "ar" && ar) || en;
}

export function sectionBy(sections: ContentSection[] | null | undefined, key: string): ContentSection | undefined {
  return sections?.find((s) => s.sectionKey === key);
}

export function activeItems(section: ContentSection | undefined | null) {
  return (section?.items ?? [])
    .filter((i) => i.isActive !== false)
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

export function formatDate(iso: string | null | undefined, locale: Locale): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return new Intl.DateTimeFormat(locale === "ar" ? "ar-SA-u-nu-latn" : "en-GB", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(d);
}

export function formatPrice(price: number | null | undefined, locale: Locale): string | null {
  if (price === null || price === undefined) return null;
  const n = new Intl.NumberFormat(locale === "ar" ? "ar-SA-u-nu-latn" : "en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(price);
  return locale === "ar" ? `${n} ر.س` : `SAR ${n}`;
}

export function firstParam(v: string | string[] | undefined): string {
  if (Array.isArray(v)) return v[0] ?? "";
  return v ?? "";
}

export function toInt(v: string, fallback: number): number {
  const n = parseInt(v, 10);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

export function cx(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}
