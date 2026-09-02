"use client";

import { useState } from "react";
import { imageUrl } from "@/lib/api";
import { cx } from "@/lib/utils";
import Icon from "@/components/Icon";

type Props = { images: string[]; alt: string };

export default function Gallery({ images, alt }: Props) {
  const urls = images.map((u) => imageUrl(u)).filter((u): u is string => !!u);
  const [index, setIndex] = useState(0);
  const current = urls[Math.min(index, Math.max(0, urls.length - 1))];

  return (
    <div>
      <div className="flex aspect-square w-full items-center justify-center overflow-hidden rounded-2xl border border-gray-200 bg-white">
        {current ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={current} alt={alt} className="h-full w-full object-contain" />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gray-100 text-gray-300">
            <Icon name="box" size={64} />
          </div>
        )}
      </div>
      {urls.length > 1 ? (
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {urls.map((u, i) => (
            <button
              key={u + i}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`${alt} ${i + 1}`}
              className={cx(
                "h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 bg-white transition",
                i === index ? "border-brand-600" : "border-gray-200 hover:border-brand-300",
              )}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={u} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
