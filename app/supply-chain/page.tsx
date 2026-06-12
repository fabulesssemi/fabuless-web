import type { Metadata } from "next";
import { SupplyChainWeb } from "./SupplyChainWeb";

export const metadata: Metadata = {
  title: "Supply Chain Web — Fabuless",
  description:
    "The AI silicon supply chain mapped out. Who depends on whom, where the chokepoints are, and how investor scenarios ripple through every company.",
};

export default function SupplyChainPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-6 border-b border-gray-200 pb-4">
        <h1 className="text-2xl font-bold text-[#111827]">Supply Chain Web</h1>
        <p className="mt-1 font-serif text-[15px] text-[#4a4a4a]">
          The AI silicon supply chain mapped out. Who depends on whom, where the chokepoints are, and how 20 investor scenarios ripple through every company in the chain.
        </p>
      </div>
      <SupplyChainWeb />
    </div>
  );
}
