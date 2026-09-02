import type { Locale } from "@/lib/types";
import en from "./en";
import ar from "./ar";
import type { Dictionary } from "./types";

export type { Dictionary };

/** Usable from both server and client components. */
export function getDict(locale: Locale): Dictionary {
  return locale === "ar" ? ar : en;
}
