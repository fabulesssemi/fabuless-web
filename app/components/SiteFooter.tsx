"use client";

import { usePathname } from "next/navigation";

export function SiteFooter() {
  const pathname = usePathname();
  // Hide footer on all lens pages — they have their own contained scroll layout
  if (pathname.startsWith("/lenses/")) return null;

  return (
    <footer className="border-t border-gray-200 py-6 mt-12">
      <div className="max-w-6xl mx-auto px-6 flex justify-between items-center text-sm text-gray-400">
        <span>© 2026 Fabuless Information Services</span>
        <span>fabuless.ai</span>
      </div>
    </footer>
  );
}
