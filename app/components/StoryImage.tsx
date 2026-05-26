"use client";

import { useState } from "react";

// Pipeline pre-filters to image-bearing articles only, so the fallback
// should rarely fire — it's just a safety net for broken CDN URLs.
export function StoryImage({ image, source, headline, height = 180 }: {
  image: string | null;
  source: string;
  headline: string;
  height?: number;
}) {
  const [broken, setBroken] = useState(false);

  if (image && !broken) {
    return (
      <img
        src={image}
        alt={headline}
        className="w-full object-cover"
        style={{ height }}
        onError={() => setBroken(true)}
      />
    );
  }

  return (
    <div className="w-full bg-gray-100 flex items-center justify-center" style={{ height }}>
      <span className="text-[11px] font-bold text-gray-300 uppercase tracking-widest">{source}</span>
    </div>
  );
}
