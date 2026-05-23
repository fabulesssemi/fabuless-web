// Public interface: prefers live Supabase-stored editorial, falls back to static.
// Safe to call from any server component or route — never throws.

import { getEditorial } from "@/lib/companies";
import { getStoredEditorial } from "./supabase";
import type { CompanyEditorial } from "@/lib/companies";

const FALLBACK: CompanyEditorial = {
  slug: "unknown",
  quickTake: "",
  ecosystemRole: "",
  investorFocus: "",
  whyItMatters: { business: "", investment: "", ecosystem: "" },
  keyThemes: [],
  bullCase: [],
  bearCase: [],
  supplyChain: {},
  related: [],
  updated: "",
};

export async function getEditorialForSlug(slug: string): Promise<CompanyEditorial> {
  try {
    const stored = await getStoredEditorial(slug);
    if (stored) return stored;
  } catch {
    // fall through to static
  }
  return getEditorial(slug) ?? FALLBACK;
}
