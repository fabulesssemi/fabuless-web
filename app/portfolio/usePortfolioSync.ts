"use client";

import { useSession } from "next-auth/react";
import { readPortfolio, writePortfolio, type Holding } from "./storage";

export function usePortfolioSync() {
  const { data: session } = useSession();
  const signedIn = !!session?.user;

  async function load(): Promise<Holding[]> {
    if (signedIn) {
      try {
        const res = await fetch("/api/portfolio");
        if (res.ok) {
          const data = await res.json();
          if (data.holdings?.length > 0) {
            writePortfolio({ holdings: data.holdings });
            return data.holdings;
          }
        }
      } catch { /* fall through to localStorage */ }
    }
    return readPortfolio().holdings;
  }

  async function save(holdings: Holding[]) {
    writePortfolio({ holdings });
    if (signedIn) {
      try {
        await fetch("/api/portfolio", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ holdings }),
        });
      } catch { /* non-fatal */ }
    }
  }

  return { load, save, signedIn };
}
