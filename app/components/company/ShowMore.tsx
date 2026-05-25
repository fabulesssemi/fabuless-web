"use client";
import { useState, Children } from "react";
import type { ReactNode } from "react";

export function ShowMore({
  children,
  max = 3,
}: {
  children: ReactNode;
  max?: number;
}) {
  const [open, setOpen] = useState(false);
  const all = Children.toArray(children);
  const visible = open ? all : all.slice(0, max);
  const hiddenCount = all.length - max;

  return (
    <div>
      <div className="space-y-4">{visible}</div>
      {hiddenCount > 0 && (
        <button
          onClick={() => setOpen(!open)}
          className="mt-4 inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full border border-gray-300 text-[12px] text-gray-500 hover:bg-gray-50 transition-colors"
        >
          {open ? "Show less ↑" : `Show more ↓`}
        </button>
      )}
    </div>
  );
}
