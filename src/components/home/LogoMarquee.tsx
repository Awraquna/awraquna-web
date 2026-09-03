import type { Client } from "@/lib/types";
import { imageUrl } from "@/lib/api";

type Props = {
  clients: Client[];
  /** Seconds per logo for one full pass, so a long list does not race past and a
      short one does not crawl. */
  secondsPerLogo?: number;
};

/**
 * Client logos as one continuously scrolling, full-bleed strip.
 *
 * The list is rendered twice inside a track that animates to -50%: at the end of
 * the cycle the second copy sits exactly where the first started, so the loop is
 * seamless with no snap. It pauses on hover and on keyboard focus.
 *
 * Built to cost one composited layer. Everything that would make the compositor
 * re-rasterise the strip every frame is deliberately kept off it:
 *  - the greyscale filter lives on the track, not on 44 individual images;
 *  - the edges are two static gradient overlays, not a mask on the moving box
 *    (a mask over the animated element was the single largest jank source
 *    measured on this page, and it cost frames even off screen);
 *  - the tiles carry no transitions or shadows of their own.
 *
 * Short lists are repeated until the track is comfortably wider than any
 * viewport; otherwise a half-empty track would leave a visible gap mid-cycle.
 */
export default function LogoMarquee({ clients, secondsPerLogo = 3.2 }: Props) {
  const active = clients.filter((c) => c.isActive !== false);
  if (!active.length) return null;

  const reps = Math.max(1, Math.ceil(16 / active.length));
  const half = Array.from({ length: reps }, () => active).flat();
  const duration = Math.round(half.length * secondsPerLogo);

  return (
    <div className="marquee relative w-full overflow-hidden">
      <div
        className="marquee-track flex w-max items-center gap-3"
        style={{ "--marquee-duration": `${duration}s` } as React.CSSProperties}
      >
        {/* Two identical halves. The copy is decorative — only the first is
            exposed to assistive tech, so the client list is announced once. */}
        {half.map((c, i) => (
          <LogoTile key={`a-${c.id}-${i}`} client={c} />
        ))}
        {half.map((c, i) => (
          <LogoTile key={`b-${c.id}-${i}`} client={c} ariaHidden />
        ))}
      </div>

      {/* Physical left/right (not logical) so the fade sits on the viewport edges
          in both reading directions. */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-surface to-transparent sm:w-28" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-surface to-transparent sm:w-28" />
    </div>
  );
}

function LogoTile({ client: c, ariaHidden }: { client: Client; ariaHidden?: boolean }) {
  const logo = imageUrl(c.logoUrl);

  const inner = logo ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={logo}
      alt={ariaHidden ? "" : c.name}
      loading="lazy"
      draggable={false}
      className="h-10 w-auto max-w-[140px] object-contain"
    />
  ) : (
    <span className="whitespace-nowrap text-sm font-semibold text-slate-500">{c.name}</span>
  );

  // The tile stays white in both themes: client logos are dark-on-transparent
  // and would disappear against the dark surface.
  const cls =
    "flex h-16 w-40 shrink-0 items-center justify-center rounded-2xl border border-border bg-white px-6";

  if (c.websiteUrl && !ariaHidden) {
    return (
      <a href={c.websiteUrl} target="_blank" rel="noopener noreferrer" className={cls} title={c.name}>
        {inner}
      </a>
    );
  }
  return (
    <div className={cls} title={ariaHidden ? undefined : c.name} aria-hidden={ariaHidden || undefined}>
      {inner}
    </div>
  );
}
