"use client";
import { usePathname } from "next/navigation";

export function NavWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isQuantum = pathname === "/quantum";

  if (isQuantum) {
    return (
      <div
        className="relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #0f0c29 0%, #1a1040 50%, #0f172a 100%)" }}
      >
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "linear-gradient(#6366F1 1px, transparent 1px), linear-gradient(90deg, #6366F1 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
        <div className="relative">{children}</div>
      </div>
    );
  }

  return <div className="bg-[#111827]">{children}</div>;
}
