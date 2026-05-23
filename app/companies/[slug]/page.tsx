import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { allCompanySlugs, getCompanyMeta, getEditorial } from "@/lib/companies";
import { getCompanyData } from "@/lib/providers";
import { getAnalystView } from "@/lib/analyst";
import { CompanyDashboard } from "@/app/components/company/CompanyDashboard";

// Pre-render all known companies at build; refresh data hourly (ISR).
export const revalidate = 3600;
export const dynamicParams = true;

export function generateStaticParams() {
  return allCompanySlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const meta = getCompanyMeta(slug);
  if (!meta) return { title: "Company — Fabuless" };
  return {
    title: `${meta.name} (${meta.ticker}) — Fabuless`,
    description: `${meta.name}: ${meta.sector}. Live price, earnings, analyst consensus, supply-chain map, and the AI-ecosystem deep-dive.`,
  };
}

export default async function CompanyPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const meta = getCompanyMeta(slug);
  if (!meta) notFound();

  const editorial = getEditorial(meta.slug);
  const [data, analyst] = await Promise.all([
    getCompanyData(meta.yahooSymbol),
    getAnalystView(meta),
  ]);

  return (
    <CompanyDashboard
      meta={meta}
      editorial={editorial}
      data={data}
      analyst={analyst}
    />
  );
}
