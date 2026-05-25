"use client";

import { useState } from "react";
import type { ProductImage } from "@/lib/companies";

export function HardwareSpotlight({ image }: { image: ProductImage }) {
  const [failed, setFailed] = useState(false);

  if (failed) return null;

  return (
    <div className="border-t border-gray-200 pt-3 mt-3">
      <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">
        Hardware Spotlight
      </div>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={image.url}
        alt={image.caption}
        className="w-full object-cover border border-gray-200"
        style={{ maxHeight: "180px" }}
        onError={() => setFailed(true)}
      />
      <p className="text-[11px] text-gray-400 leading-snug mt-1.5">{image.caption}</p>
    </div>
  );
}
