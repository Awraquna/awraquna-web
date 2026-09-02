import { NextResponse } from "next/server";
import { LOCALE_COOKIE } from "@/lib/i18n";

/** POST { locale: "en" | "ar" } -> sets the locale cookie. */
export async function POST(req: Request) {
  let locale = "en";
  try {
    const body = (await req.json()) as { locale?: string };
    if (body?.locale === "ar") locale = "ar";
  } catch {
    // ignore malformed body; default to en
  }
  const res = NextResponse.json({ locale });
  res.cookies.set(LOCALE_COOKIE, locale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });
  return res;
}
