import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Link from "next/link";
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
    <html
      lang="en"
      className={inter.variable}
    >
      <body className="min-h-screen flex flex-col bg-[#FAFAF8] text-[#18181B] font-sans">
        <header>
          {/* Amber accent line — publication masthead signature */}
          <div className="h-[3px] bg-[#B45309]" />
          <div className="bg-[#111827]">
            <nav className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
              <Link
                href="/"
                className="font-sans text-[1.6rem] font-extrabold text-white tracking-tight"
              >
                Fabuless
              </Link>
              <div className="flex gap-8 text-sm text-gray-400">
                <Link href="/companies" className="hover:text-amber-400 transition-colors">
                  Companies
                </Link>
                <Link href="/analyst-consensus" className="hover:text-amber-400 transition-colors">
                  Analysts
                </Link>
                <Link href="/insider-trading" className="hover:text-amber-400 transition-colors">
                  Insider Trades
                </Link>
                <Link href="/earnings" className="hover:text-amber-400 transition-colors">
                  Earnings
                </Link>
                <Link href="/voices" className="hover:text-amber-400 transition-colors">
                  Top Voices
                </Link>
                <Link href="/about" className="hover:text-amber-400 transition-colors">
                  About
                </Link>
                <Link href="/archive" className="hover:text-amber-400 transition-colors">
                  Archive
                </Link>
              </div>
            </nav>
          </div>
        </header>

        <main className="flex-1">{children}</main>

        <footer className="border-t border-gray-200 py-6 mt-12">
          <div className="max-w-6xl mx-auto px-6 flex justify-between items-center text-sm text-gray-400">
            <span>© 2026 Fabuless Information Services</span>
            <span>fabuless.ai</span>
          </div>
        </footer>
      </body>
    </html>
  );
}
