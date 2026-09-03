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
          ? "rounded-2xl border border-dashed border-border bg-surface px-6 py-8 text-center"
          : "rounded-3xl border border-dashed border-border bg-surface px-6 py-16 text-center"
      }
    >
      {/* Halo behind the glyph so the empty state still feels designed. */}
      <div className="relative mx-auto mb-4 flex h-14 w-14 items-center justify-center">
        <span aria-hidden="true" className="absolute inset-0 rounded-full bg-[var(--brand-soft)] blur-md" />
        <span className="relative flex h-12 w-12 items-center justify-center rounded-full bg-brand-50 text-brand-600">
          <Icon name={icon} size={24} />
        </span>
      </div>
      <p className="text-base font-semibold text-foreground">{title}</p>
      {hint ? <p className="mx-auto mt-1.5 max-w-sm text-sm text-muted-foreground">{hint}</p> : null}
    </div>
  );
}
