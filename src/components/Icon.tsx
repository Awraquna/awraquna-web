import type { SVGProps } from "react";

/**
 * Inline SVG icon set (stroke-based, 24x24 viewbox).
 * Names used by CMS ContentItems: award, truck, leaf, shield, box, printer, headset, compass,
 * clipboard, refresh, ruler, puzzle, settings, flag, map, check, handshake, pin, and digits 1-4.
 * Extra UI icons: image, phone, mail, clock, whatsapp, menu, close, search, chevron-down,
 * arrow-right, facebook, linkedin, instagram, globe, tag, calendar, file, news, building.
 */
const PATHS: Record<string, string> = {
  award:
    "M12 15a6 6 0 1 0 0-12 6 6 0 0 0 0 12Z M8.2 13.8 7 22l5-3 5 3-1.2-8.2",
  truck:
    "M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2 M15 18H9 M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.62l-3.48-4.35A1 1 0 0 0 17.52 8H14 M7 20a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z M17 20a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z",
  leaf:
    "M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12",
  shield:
    "M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1Z M9 12l2 2 4-4",
  box:
    "M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z M3.3 7 12 12l8.7-5 M12 22V12",
  printer:
    "M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2 M6 9V3h12v6 M6 14h12v8H6Z",
  headset:
    "M3 11h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H3Z M21 11h-3a2 2 0 0 0-2 2v3a2 2 0 0 0 2 2h3Z M3 11a9 9 0 0 1 18 0 M21 16v1a3 3 0 0 1-3 3h-4",
  compass:
    "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z M16.24 7.76l-2.12 6.36-6.36 2.12 2.12-6.36Z",
  clipboard:
    "M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2 M9 2h6a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1Z M9 12h6 M9 16h6",
  refresh:
    "M3 12a9 9 0 0 1 15.36-6.36L21 8 M21 3v5h-5 M21 12a9 9 0 0 1-15.36 6.36L3 16 M3 21v-5h5",
  ruler:
    "M21.3 8.7 8.7 21.3a1 1 0 0 1-1.4 0l-4.6-4.6a1 1 0 0 1 0-1.4L15.3 2.7a1 1 0 0 1 1.4 0l4.6 4.6a1 1 0 0 1 0 1.4Z M14.5 12.5 12 10 M11.5 15.5 9 13 M8.5 18.5 6 16 M17.5 9.5 15 7",
  puzzle:
    "M19.4 11.7c.4-.2.6-.4.6-.7a1 1 0 0 0-1-1h-1.2a.8.8 0 0 1-.8-.8V7a2 2 0 0 0-2-2h-2.2a.8.8 0 0 1-.8-.8V3a1 1 0 0 0-1-1c-.3 0-.5.2-.7.6a2 2 0 0 1-3.6 0C7.5 2.2 7.3 2 7 2a1 1 0 0 0-1 1v1.2a.8.8 0 0 1-.8.8H3a1 1 0 0 0-1 1v2.2c0 .3.2.5.6.7a2 2 0 0 1 0 3.6c-.4.2-.6.4-.6.7V16a1 1 0 0 0 1 1h2.2a.8.8 0 0 1 .8.8V21a1 1 0 0 0 1 1h2.2c.3 0 .5-.2.7-.6a2 2 0 0 1 3.6 0c.2.4.4.6.7.6H16a2 2 0 0 0 2-2v-2.2a.8.8 0 0 1 .8-.8H20a1 1 0 0 0 1-1c0-.3-.2-.5-.6-.7a2 2 0 0 1 0-3.6Z",
  settings:
    "M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2Z M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z",
  flag: "M4 22V4a1 1 0 0 1 .4-.8A6 6 0 0 1 8 2c3 0 5 2 7.33 2A6 6 0 0 0 20 2.95v11.1a6 6 0 0 1-4.67 1c-2.33 0-4.33-2-7.33-2a6 6 0 0 0-4 1.5",
  map:
    "M14.1 4.1 9.9 2 3.5 4.3a1 1 0 0 0-.5.9v14.4a1 1 0 0 0 1.4.9L9.9 22l4.2-2.1 6.4-2.3a1 1 0 0 0 .5-.9V2.3a1 1 0 0 0-1.4-.9Z M9.9 2v20 M14.1 4.1v15.8",
  check: "M20 6 9 17l-5-5",
  handshake:
    "m11 17 2 2a1 1 0 1 0 3-3 M14 14l2.5 2.5a1 1 0 1 0 3-3l-3.88-3.88a3 3 0 0 0-4.24 0l-.88.88a1 1 0 1 1-3-3l2.81-2.81a5.79 5.79 0 0 1 7.06-.54l.44.3a2 2 0 0 0 2.71-.36L22 6 M16 3l2 2 M2 6l4 4 M10 13l-2-2 M3 21l2-2",
  pin: "M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z M12 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z",
  image:
    "M19 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2Z M9 11a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z M21 15l-3.09-3.09a2 2 0 0 0-2.82 0L6 21",
  phone:
    "M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92Z",
  mail: "M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z M22 7l-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7",
  clock: "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z M12 6v6l4 2",
  whatsapp:
    "M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21 M9 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1a5 5 0 0 0 5 5h1a.5.5 0 0 0 0-1h-1a.5.5 0 0 0 0 1",
  menu: "M4 6h16 M4 12h16 M4 18h16",
  close: "M18 6 6 18 M6 6l12 12",
  search: "M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z M21 21l-4.35-4.35",
  "chevron-down": "m6 9 6 6 6-6",
  "chevron-right": "m9 18 6-6-6-6",
  "arrow-right": "M5 12h14 M12 5l7 7-7 7",
  facebook: "M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3Z",
  linkedin:
    "M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6Z M2 9h4v12H2Z M4 6a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z",
  instagram:
    "M17 2H7a5 5 0 0 0-5 5v10a5 5 0 0 0 5 5h10a5 5 0 0 0 5-5V7a5 5 0 0 0-5-5Z M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37Z M17.5 6.5h.01",
  globe: "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z M2 12h20 M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10Z",
  tag: "M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42Z M7 7h.01",
  calendar: "M8 2v4 M16 2v4 M3 10h18 M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z",
  news: "M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2 M18 14h-8 M15 18h-5 M10 6h8v4h-8Z",
  building: "M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2 M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2 M10 6h4 M10 10h4 M10 14h4 M10 18h4",
  star: "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01Z",
  spark: "M12 3v18 M3 12h18 M5.6 5.6l12.8 12.8 M18.4 5.6 5.6 18.4",
  // ---- chrome / navigation ----
  home: "M3 10.2 12 3l9 7.2V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1Z",
  sun: "M12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10Z M12 1v2 M12 21v2 M4.22 4.22l1.42 1.42 M18.36 18.36l1.42 1.42 M1 12h2 M21 12h2 M4.22 19.78l1.42-1.42 M18.36 5.64l1.42-1.42",
  moon: "M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z",
  layers: "M12 2 2 7l10 5 10-5Z M2 17l10 5 10-5 M2 12l10 5 10-5",
  grid: "M4 4h6v6H4Z M14 4h6v6h-6Z M4 14h6v6H4Z M14 14h6v6h-6Z",
  briefcase: "M4 7h16a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1Z M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2 M3 12h18",
  "arrow-up-right": "M7 17 17 7 M8 7h9v9",
  sparkles: "M12 3l1.6 4.4L18 9l-4.4 1.6L12 15l-1.6-4.4L6 9l4.4-1.6Z M19 14l.8 2.2L22 17l-2.2.8L19 20l-.8-2.2L16 17l2.2-.8Z M5 15l.6 1.6L7.2 17l-1.6.6L5 19l-.6-1.4L2.8 17l1.6-.4Z",
  plus: "M12 5v14 M5 12h14",
  minus: "M5 12h14",
  quote: "M9 7H6a2 2 0 0 0-2 2v3a2 2 0 0 0 2 2h1v1a2 2 0 0 1-2 2H4 M19 7h-3a2 2 0 0 0-2 2v3a2 2 0 0 0 2 2h1v1a2 2 0 0 1-2 2h-1",
  target: "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z M12 18a6 6 0 1 0 0-12 6 6 0 0 0 0 12Z M12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z",
  users: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2 M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z M22 21v-2a4 4 0 0 0-3-3.87 M16 3.13a4 4 0 0 1 0 7.75",
  x: "M4 4l16 16 M20 4 4 20",
  youtube:
    "M22 8.2a3 3 0 0 0-2.1-2.1C18 5.5 12 5.5 12 5.5s-6 0-7.9.6A3 3 0 0 0 2 8.2 31 31 0 0 0 1.5 12 31 31 0 0 0 2 15.8a3 3 0 0 0 2.1 2.1c1.9.6 7.9.6 7.9.6s6 0 7.9-.6a3 3 0 0 0 2.1-2.1 31 31 0 0 0 .5-3.8 31 31 0 0 0-.5-3.8Z M10 15V9l5 3Z",
};

const DEFAULT = "star";

export type IconProps = Omit<SVGProps<SVGSVGElement>, "name"> & { name?: string | null; size?: number };

export default function Icon({ name, size = 24, className, ...rest }: IconProps) {
  const key = (name || "").trim().toLowerCase();

  // Numeric icons ("1".."9") render as a number inside a circle.
  if (/^\d$/.test(key)) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        aria-hidden="true"
        {...rest}
      >
        <circle cx="12" cy="12" r="10" />
        <text
          x="12"
          y="12.5"
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize="11"
          fontWeight="700"
          fill="currentColor"
          stroke="none"
        >
          {key}
        </text>
      </svg>
    );
  }

  const d = PATHS[key] ?? PATHS[DEFAULT];
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...rest}
    >
      <path d={d} />
    </svg>
  );
}
