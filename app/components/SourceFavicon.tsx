"use client";

import { useState } from "react";
import { getFaviconUrl } from "@/lib/source-domains";

export function SourceFavicon({ source }: { source: string }) {
  const [failed, setFailed] = useState(false);
  const url = getFaviconUrl(source);

  if (!url || failed) return null;

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={url}
      alt=""
      width={12}
      height={12}
      className="inline-block rounded-sm shrink-0 opacity-70"
      onError={() => setFailed(true)}
    />
  );
}
