import { unstable_cache } from "next/cache";
import { COMPANY_UNIVERSE, type CompanyMeta } from "@/lib/companies";
import { assembleView } from "./core";
import type { AnalystView } from "./types";

/** Cached analyst view for one company (1h). Never throws. */
export function getAnalystView(meta: CompanyMeta): Promise<AnalystView> {
  const cached = unstable_cache(
    () => assembleView(meta),
    ["analyst-view", meta.yahooSymbol],
    { tags: [`analyst:${meta.yahooSymbol}`], revalidate: 3600 },
  );
  return cached();
}

/** All tracked companies, for the global dashboard. Failures are skipped. */
export async function getAllAnalystViews(): Promise<AnalystView[]> {
  const settled = await Promise.allSettled(
    COMPANY_UNIVERSE.map((m) => getAnalystView(m)),
  );
  return settled
    .filter(
      (r): r is PromiseFulfilledResult<AnalystView> => r.status === "fulfilled",
    )
    .map((r) => r.value);
}

export type { AnalystView } from "./types";
