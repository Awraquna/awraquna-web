import type { Metadata } from "next";
import { getLocale } from "@/lib/i18n";
import { apiGet } from "@/lib/api";
import type { Settings } from "@/lib/types";
import { firstParam, pick } from "@/lib/utils";
import { getDict } from "@/i18n";
import ContactForm from "@/components/contact/ContactForm";
import Icon from "@/components/Icon";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Contact" };

export default async function ContactPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  const locale = await getLocale();
  const dict = getDict(locale);
  const settings = (await apiGet<Settings>("/api/public/settings", { revalidate: 120 })) ?? {};
  const subject = firstParam(sp.subject).slice(0, 300);

  const address = pick(settings, "address", locale);
  const hours = pick(settings, "working_hours", locale);
  const waDigits = (settings.whatsapp || "").replace(/\D/g, "");

  const rows = [
    { icon: "pin", label: dict.common.address, value: address, href: null as string | null, ltr: false },
    { icon: "phone", label: dict.common.phone, value: settings.phone || "", href: settings.phone ? `tel:${settings.phone}` : null, ltr: true },
    { icon: "mail", label: dict.common.email, value: settings.email || "", href: settings.email ? `mailto:${settings.email}` : null, ltr: true },
    { icon: "clock", label: dict.common.workingHours, value: hours, href: null as string | null, ltr: false },
  ].filter((r) => !!r.value);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">{dict.common.contactTitle}</h1>
        <p className="mt-1 text-gray-500">{dict.common.contactSubtitle}</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-5">
        <aside className="space-y-6 lg:col-span-2">
          <div className="rounded-2xl border border-gray-200 bg-white p-6">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">{dict.common.contactInfo}</h2>
            {rows.length ? (
              <ul className="space-y-4">
                {rows.map((r) => (
                  <li key={r.label} className="flex gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                      <Icon name={r.icon} size={18} />
                    </span>
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-gray-400">{r.label}</p>
                      {r.href ? (
                        <a href={r.href} dir={r.ltr ? "ltr" : undefined} className="text-sm text-gray-800 hover:text-brand-700">
                          {r.value}
                        </a>
                      ) : (
                        <p className="text-sm text-gray-800">{r.value}</p>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-400">{dict.common.notAvailable}</p>
            )}
            {waDigits ? (
              <a
                href={`https://wa.me/${waDigits}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#25D366] px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
              >
                <Icon name="whatsapp" size={18} />
                {dict.actions.whatsapp}
              </a>
            ) : null}
          </div>

          {settings.map_embed_url ? (
            <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
              <iframe
                src={settings.map_embed_url}
                title="Map"
                className="h-64 w-full"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
              />
            </div>
          ) : null}
        </aside>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 sm:p-8 lg:col-span-3">
          <ContactForm
            initialSubject={subject}
            labels={{
              name: dict.form.name,
              phone: dict.form.phone,
              email: dict.form.email,
              company: dict.form.company,
              subject: dict.form.subject,
              message: dict.form.message,
              send: dict.form.send,
              sending: dict.form.sending,
              success: dict.form.success,
              error: dict.form.error,
            }}
          />
        </div>
      </div>
    </div>
  );
}
