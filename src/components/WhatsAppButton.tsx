import Icon from "./Icon";

type Props = { number: string | null | undefined; label: string; text?: string };

export default function WhatsAppButton({ number, label, text }: Props) {
  const digits = (number || "").replace(/\D/g, "");
  if (!digits) return null;
  const href = `https://wa.me/${digits}${text ? `?text=${encodeURIComponent(text)}` : ""}`;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      title={label}
      className="fixed bottom-5 end-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition hover:scale-105 hover:shadow-xl"
    >
      <Icon name="whatsapp" size={28} strokeWidth={2} />
    </a>
  );
}
