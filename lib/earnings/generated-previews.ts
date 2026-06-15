import rawData from "@/data/earnings-previews.json";
import type { EarningsPreviewGenerated, PreviewsStore } from "@/scripts/update-earnings-previews";

const store = rawData as PreviewsStore;

export function getGeneratedPreview(ticker: string): EarningsPreviewGenerated | null {
  return store[ticker] ?? null;
}

export function getAllGeneratedPreviews(): PreviewsStore {
  return store;
}
