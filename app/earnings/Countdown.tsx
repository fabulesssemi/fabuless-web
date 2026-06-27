"use client";

import { useEffect, useState } from "react";

function parts(targetMs: number) {
  const diff = Math.max(0, targetMs - Date.now());
  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff % 86400000) / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  return { d, h, m, s, done: diff === 0 };
}

export function Countdown({ iso }: { iso: string }) {
  // Treat the report time as ~4pm ET (after market close) on the given date.
  const target = new Date(iso + "T20:00:00Z").getTime();
  const [t, setT] = useState<ReturnType<typeof parts> | null>(null);

  useEffect(() => {
    setT(parts(target));
    const id = setInterval(() => setT(parts(target)), 1000);
    return () => clearInterval(id);
  }, [target]);

  if (!t) return null;

  if (t.done) {
    return (
      <span className="text-[11px] font-semibold uppercase tracking-widest text-amber-400">
        Reporting now / reported
      </span>
    );
  }

  const cell = (val: number, label: string) => (
    <div className="flex flex-col items-center">
      <span className="font-mono text-2xl font-bold text-[#111827] tabular-nums leading-none">
        {String(val).padStart(2, "0")}
      </span>
      <span className="text-[9px] uppercase tracking-widest text-gray-500 mt-1">{label}</span>
    </div>
  );

  return (
    <div className="flex items-center gap-4">
      {cell(t.d, "days")}
      <span className="text-gray-600 text-xl -mt-2">:</span>
      {cell(t.h, "hrs")}
      <span className="text-gray-600 text-xl -mt-2">:</span>
      {cell(t.m, "min")}
      <span className="text-gray-600 text-xl -mt-2">:</span>
      {cell(t.s, "sec")}
    </div>
  );
}
