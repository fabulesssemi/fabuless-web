import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Link from "next/link";
import { MobileNav } from "@/app/components/MobileNav";
import { NavWrapper } from "@/app/components/NavWrapper";
import { FloatingChat } from "@/app/components/FloatingChat";
import { SessionProviderWrapper } from "@/app/components/SessionProviderWrapper";
import { AuthButton } from "@/app/components/AuthButton";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://fabuless.ai"),
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
  title: "Fabuless — Semiconductor Intelligence",
  description:
    "A weekly briefing on the fabless semiconductor industry — for investors who track chips seriously.",
  openGraph: {
    title: "Fabuless — Semiconductor Intelligence",
    description: "The semiconductor briefing for serious investors. Every weekday.",
    url: "https://fabuless.ai",
    siteName: "Fabuless",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Fabuless — Semiconductor Intelligence",
    description: "The semiconductor briefing for serious investors. Every weekday.",
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
        <SessionProviderWrapper>
        <header className="relative z-40">
          <div className="h-[3px] bg-[#B45309]" />
          <NavWrapper>
            <nav className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
              <Link
                href="/"
                className="flex items-center gap-2.5 font-sans text-[1.6rem] font-extrabold text-white tracking-tight"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/logo.svg" alt="" width={32} height={32} className="rounded-[5px]" />
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
                <Link href="/portfolio" className="hover:text-amber-400 transition-colors">My Portfolio</Link>
                <Link href="/companies" className="hover:text-amber-400 transition-colors">Companies</Link>
                <Link href="/supply-chain" className="hover:text-amber-400 transition-colors">Supply Chain</Link>
                <Link href="/analysts" className="hover:text-amber-400 transition-colors">Analysts</Link>
                <Link href="/tracker" className="hover:text-amber-400 transition-colors">Tracker</Link>
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

              <AuthButton />

              {/* Mobile hamburger */}
              <MobileNav />
            </nav>
          </NavWrapper>
        </header>

        <main className="flex-1 overflow-y-auto min-h-0">
          {children}
        </main>

        <FloatingChat />
        </SessionProviderWrapper>
      </body>
    </html>
  );
}
