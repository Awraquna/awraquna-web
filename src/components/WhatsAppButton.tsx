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
      className="group fixed bottom-5 end-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_16px_34px_-12px_rgb(37_211_102_/_0.7)] transition-transform duration-300 hover:scale-110"
    >
      {/* Slow pulse ring so the button reads as "live chat" without animating the icon itself. */}
      <span
        aria-hidden="true"
        className="absolute inset-0 -z-10 rounded-full bg-[#25D366]/45 transition-transform duration-500 group-hover:scale-125"
      />
      <Icon name="whatsapp" size={28} strokeWidth={2} />
    </a>
  );
}
