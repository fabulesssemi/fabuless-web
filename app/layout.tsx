import type { Metadata } from "next";
import { Instrument_Serif, Instrument_Sans } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const instrumentSerif = Instrument_Serif({
  weight: "400",
  variable: "--font-instrument-serif",
  subsets: ["latin"],
});

const instrumentSans = Instrument_Sans({
  variable: "--font-instrument-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Fabuless — Semiconductor Intelligence",
  description:
    "A weekly briefing on the fabless semiconductor industry — for investors who track chips seriously.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${instrumentSerif.variable} ${instrumentSans.variable}`}
    >
      <body className="min-h-screen flex flex-col bg-white text-[#374151] font-sans">
        <header className="border-b border-gray-200">
          <nav className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
            <Link
              href="/"
              className="font-serif text-2xl text-[#0E7490] tracking-tight"
            >
              Fabuless
            </Link>
            <div className="flex gap-8 text-sm text-[#374151]">
              <Link
                href="/about"
                className="hover:text-[#0E7490] transition-colors"
              >
                About
              </Link>
              <Link
                href="/earnings"
                className="hover:text-[#0E7490] transition-colors"
              >
                Earnings
              </Link>
            </div>
          </nav>
        </header>

        <main className="flex-1">{children}</main>

        <footer className="border-t border-gray-200 py-8 mt-16">
          <div className="max-w-4xl mx-auto px-6 flex justify-between items-center text-sm text-gray-400">
            <span>© 2026 Fabuless Information Services</span>
            <span>fabuless.ai</span>
          </div>
        </footer>
      </body>
    </html>
  );
}
