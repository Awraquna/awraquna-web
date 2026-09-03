import { imageUrl } from "@/lib/api";
import { cx } from "@/lib/utils";
import Icon from "./Icon";

type Props = {
  src: string | null | undefined;
  alt: string;
  className?: string;
  imgClassName?: string;
  /** Icon shown inside the placeholder when there is no image. */
  icon?: string;
  iconSize?: number;
};

/**
 * Renders an API image (relative `/uploads/..` URLs are prefixed with the API base).
 * When there is no image, a neutral placeholder box with an icon is rendered instead.
 */
export default function AppImage({ src, alt, className, imgClassName, icon = "image", iconSize = 36 }: Props) {
  const url = imageUrl(src);
  if (!url) {
    return (
      <div
        className={cx(
          "flex items-center justify-center bg-surface-2 text-muted-foreground/50 border border-border",
          className,
        )}
        role="img"
        aria-label={alt}
      >
        <Icon name={icon} size={iconSize} />
      </div>
    );
  }
  return (
    <div className={cx("overflow-hidden bg-surface-2", className)}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={url} alt={alt} loading="lazy" className={cx("h-full w-full object-cover", imgClassName)} />
    </div>
  );
}
