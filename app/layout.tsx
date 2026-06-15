import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Link from "next/link";
import { MobileNav } from "@/app/components/MobileNav";
import { FloatingChat } from "@/app/components/FloatingChat";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://fabuless.ai"),
  title: "Fabuless — Semiconductor Intelligence",
  description:
    "A weekly briefing on the fabless semiconductor industry — for investors who track chips seriously.",
  openGraph: {
    title: "Fabuless — Semiconductor Intelligence",
    description: "The semiconductor briefing for serious investors. Every Friday.",
    url: "https://fabuless.ai",
    siteName: "Fabuless",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Fabuless — Semiconductor Intelligence",
    description: "The semiconductor briefing for serious investors. Every Friday.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="h-screen flex flex-col text-[#18181B] font-sans overflow-hidden">
        <header className="relative z-40">
          <div className="h-[3px] bg-[#B45309]" />
          <div className="bg-[#111827]">
            <nav className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
              <Link
                href="/"
                className="font-sans text-[1.6rem] font-extrabold text-white tracking-tight"
              >
                Fabuless
              </Link>

              {/* Desktop nav */}
              <div className="hidden md:flex items-center gap-8 text-sm text-gray-400">
                <Link
                  href="/quantum"
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-indigo-600/25 text-indigo-300 border border-indigo-500/40 hover:bg-indigo-600/50 hover:text-white transition-all text-[14px] font-bold"
                >
                  ✦ Quantum
                </Link>
                <Link href="/companies" className="hover:text-amber-400 transition-colors">Companies</Link>
                <Link href="/supply-chain" className="hover:text-amber-400 transition-colors">Supply Chain</Link>
                <Link href="/analysts" className="hover:text-amber-400 transition-colors">Analysts</Link>
                <Link href="/tracker" className="hover:text-amber-400 transition-colors">Tracker</Link>
                <Link href="/portfolio" className="hover:text-amber-400 transition-colors">Portfolio</Link>
                <Link href="/earnings" className="hover:text-amber-400 transition-colors">Earnings</Link>
                <div className="relative group">
                  <span className="cursor-default hover:text-amber-400 transition-colors py-4">More ▾</span>
                  <div className="absolute right-0 top-full pt-2 hidden group-hover:block z-50">
                    <div className="bg-[#111827] border border-gray-700 py-1.5 w-44 shadow-lg">
                      <Link href="/insider-trading" className="block px-4 py-2 hover:text-amber-400 hover:bg-white/5 transition-colors">Insider Trades</Link>
                      <Link href="/archive" className="block px-4 py-2 hover:text-amber-400 hover:bg-white/5 transition-colors">Archive</Link>
                      <Link href="/about" className="block px-4 py-2 hover:text-amber-400 hover:bg-white/5 transition-colors">About</Link>
                    </div>
                  </div>
                </div>
              </div>

              {/* Mobile hamburger */}
              <MobileNav />
            </nav>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto min-h-0">
          {children}
        </main>

        <FloatingChat />
      </body>
    </html>
  );
}
