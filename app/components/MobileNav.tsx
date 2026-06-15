"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/portfolio",        label: "My Portfolio" },
  { href: "/companies",        label: "Companies" },
  { href: "/supply-chain",     label: "Supply Chain" },
  { href: "/analyst-consensus",label: "Analysts" },
  { href: "/tracker",          label: "Tracker" },
  { href: "/insider-trading",  label: "Insider Trades" },
  { href: "/earnings",         label: "Earnings" },
  { href: "/about",            label: "About" },
  { href: "/archive",          label: "Archive" },
];

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      {/* Hamburger button — only visible on mobile */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="md:hidden flex flex-col gap-1.5 p-1"
        aria-label="Toggle menu"
      >
        <span className={`block w-5 h-0.5 bg-gray-400 transition-transform duration-200 ${open ? "translate-y-2 rotate-45" : ""}`} />
        <span className={`block w-5 h-0.5 bg-gray-400 transition-opacity duration-200 ${open ? "opacity-0" : ""}`} />
        <span className={`block w-5 h-0.5 bg-gray-400 transition-transform duration-200 ${open ? "-translate-y-2 -rotate-45" : ""}`} />
      </button>

      {/* Dropdown menu */}
      {open && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-[#111827] border-t border-gray-700 z-50 pb-2">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className={`block px-6 py-3 text-sm transition-colors ${
                pathname === link.href
                  ? "text-amber-400 font-semibold"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
