import Icon from "./Icon";

type Props = {
  title: string;
  hint?: string;
  icon?: string;
  compact?: boolean;
};

export default function EmptyState({ title, hint, icon = "box", compact }: Props) {
  return (
    <div
      className={
        compact
          ? "rounded-xl border border-dashed border-gray-300 bg-white px-6 py-8 text-center"
          : "rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-16 text-center"
      }
    >
      <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-brand-50 text-brand-600">
        <Icon name={icon} size={24} />
      </div>
      <p className="text-base font-semibold text-gray-800">{title}</p>
      {hint ? <p className="mt-1 text-sm text-gray-500">{hint}</p> : null}
    </div>
  );
}
