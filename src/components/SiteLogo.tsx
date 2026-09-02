/* eslint-disable @next/next/no-img-element */

/**
 * The Awraquna logo. Uses whatever the admin uploaded in Settings → logo_url and
 * falls back to the bundled /logo.png, so the header still shows the real logo
 * when the API is unreachable.
 *
 * Responsive: the full lockup (mark + wordmark) on sm and up, the "A" mark alone
 * on very small screens where the wordmark would squeeze the nav.
 */
export default function SiteLogo({
  src,
  siteName,
  className = "",
  markOnly = false,
}: {
  src?: string | null;
  siteName: string;
  /** Height utilities, e.g. "h-8 sm:h-9". */
  className?: string;
  markOnly?: boolean;
}) {
  const full = src || "/logo.png";
  const mark = src ? src : "/logo-mark.png";

  if (markOnly) {
    return <img src={mark} alt={siteName} width={141} height={168} className={`w-auto ${className}`} decoding="async" />;
  }

  return (
    <>
      <img
        src={full}
        alt={siteName}
        width={419}
        height={180}
        className={`hidden w-auto xs:block ${className}`}
        decoding="async"
        fetchPriority="high"
      />
      <img
        src={mark}
        alt={siteName}
        width={141}
        height={168}
        className={`w-auto xs:hidden ${className}`}
        decoding="async"
        fetchPriority="high"
      />
    </>
  );
}
