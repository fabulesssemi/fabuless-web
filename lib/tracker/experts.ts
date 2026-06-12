import type { ExpertId } from "./predictions";

export interface ExpertMeta {
  id: ExpertId;
  name: string;
  subtitle: string;
  accent: string;
}

export const EXPERTS: ExpertMeta[] = [
  { id: "dylan",   name: "Dylan Patel",     subtitle: "SemiAnalysis",         accent: "#9A3412" },
  { id: "circuit", name: "The Circuit",     subtitle: "Bajarin & Goldberg",   accent: "#1C1917" },
  { id: "baker",   name: "Gavin Baker",     subtitle: "Atreides Management",  accent: "#1D4ED8" },
  { id: "doug",    name: "Doug O'Laughlin", subtitle: "Fabricated Knowledge", accent: "#065F46" },
  { id: "stacy",   name: "Stacy Rasgon",    subtitle: "Bernstein Research",   accent: "#0F4C81" },
];

export function getExpert(id: string): ExpertMeta | undefined {
  return EXPERTS.find((e) => e.id === id);
}
