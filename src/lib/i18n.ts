import { cookies } from "next/headers";
import type { Locale } from "./types";

export const LOCALE_COOKIE = "locale";

/** Server-only: reads the `locale` cookie (defaults to `en`). */
export async function getLocale(): Promise<Locale> {
  const store = await cookies();
  return store.get(LOCALE_COOKIE)?.value === "ar" ? "ar" : "en";
}
