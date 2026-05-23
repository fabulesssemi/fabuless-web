// Supabase persistence for generated editorial content.
// Graceful — never throws; reads return null on any error.

import { supabase } from "@/lib/supabase";
import type { CompanyEditorial } from "@/lib/companies";

type EditorialRow = {
  slug: string;
  data: CompanyEditorial;
  generated_at: string;
};

export async function getStoredEditorial(slug: string): Promise<CompanyEditorial | null> {
  try {
    const { data, error } = await supabase
      .from("company_editorial")
      .select("data, generated_at")
      .eq("slug", slug)
      .single();
    if (error || !data) return null;
    return data.data as CompanyEditorial;
  } catch {
    return null;
  }
}

export async function saveEditorial(editorial: CompanyEditorial): Promise<{ ok: boolean; error?: string }> {
  try {
    const row: Omit<EditorialRow, "generated_at"> = {
      slug: editorial.slug,
      data: editorial,
    };
    const { error } = await supabase
      .from("company_editorial")
      .upsert({ ...row, generated_at: new Date().toISOString() }, { onConflict: "slug" });
    return { ok: !error, error: error?.message };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}
