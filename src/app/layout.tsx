import type { Metadata } from "next";
import { Inter, Tajawal } from "next/font/google";
import "./globals.css";
import { getLocale } from "@/lib/i18n";
import { apiGet } from "@/lib/api";
import type { Settings } from "@/lib/types";
import { getDict } from "@/i18n";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import ScrollProgress from "@/components/ui/ScrollProgress";
import { THEME_INIT_SCRIPT } from "@/lib/theme";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const tajawal = Tajawal({
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "700", "800"],
  variable: "--font-tajawal",
  display: "swap",
});

export const metadata: Metadata = {
  title: { default: "Awraquna", template: "%s | Awraquna" },
  description: "Your one supplier for thermal paper rolls, thermal labels, ribbons and labelers in Saudi Arabia.",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/logo-mark.png", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale();
  const dict = getDict(locale);
  const settings = await apiGet<Settings>("/api/public/settings", { revalidate: 120 });

  return (
    <html
      lang={locale}
      dir={locale === "ar" ? "rtl" : "ltr"}
      className={`${inter.variable} ${tajawal.variable} h-full antialiased`}
      // The theme script below writes `class="dark"` onto this element before
      // React hydrates, which is exactly the mismatch this attribute is for.
      suppressHydrationWarning
    >
      <head>
        {/* Runs before the first paint: applies the stored (or system) theme so a
            dark-mode visitor never sees a white flash. */}
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body className="flex min-h-full flex-col bg-background text-foreground">
        <ScrollProgress />
        <Header locale={locale} settings={settings} />
        <main className="page-enter flex-1">{children}</main>
        <Footer locale={locale} settings={settings} />
        <WhatsAppButton number={settings?.whatsapp} label={dict.actions.whatsapp} />
      </body>
    </html>
  );
}
