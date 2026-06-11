import type { Metadata } from "next";
import { SupplyChainWeb } from "./SupplyChainWeb";

export const metadata: Metadata = {
  title: "Supply Chain Web — Fabuless",
  description:
    "How the AI silicon supply chain actually fits together — who depends on whom, and where the chokepoints are.",
};

export default function SupplyChainPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-6 border-b border-gray-200 pb-4">
        <h1 className="text-2xl font-bold text-[#111827]">Supply Chain Web</h1>
        <p className="mt-1 font-serif text-[15px] text-[#4a4a4a]">
          How the AI silicon supply chain actually fits together — who depends on
          whom, where the chokepoints are, and how 20 investor scenarios play out
          across every company in the chain.
        </p>
      </div>
      <SupplyChainWeb />
    </div>
  );
}
