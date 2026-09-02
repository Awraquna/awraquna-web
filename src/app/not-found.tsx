import Link from "next/link";
import { getLocale } from "@/lib/i18n";
import { getDict } from "@/i18n";
import Icon from "@/components/Icon";

export default async function NotFound() {
  const locale = await getLocale();
  const dict = getDict(locale);
  return (
    <div className="mx-auto flex max-w-3xl flex-col items-center px-4 py-24 text-center sm:px-6">
      <p className="text-7xl font-bold text-brand-600">404</p>
      <h1 className="mt-4 text-2xl font-bold text-gray-900">{dict.common.pageNotFound}</h1>
      <p className="mt-2 text-gray-500">{dict.common.pageNotFoundHint}</p>
      <Link href="/" className="mt-8 inline-flex items-center gap-2 rounded-xl bg-brand-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-700">
        <Icon name="arrow-right" size={16} className="rotate-180 rtl:rotate-0" />
        {dict.actions.backHome}
      </Link>
    </div>
  );
}
