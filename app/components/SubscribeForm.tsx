"use client";

import { useState } from "react";

export function SubscribeForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error" | "duplicate">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    const res = await fetch("/api/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    if (res.ok) {
      setStatus("success");
      setEmail("");
    } else if (res.status === 409) {
      setStatus("duplicate");
    } else {
      setStatus("error");
    }
  }

  if (status === "success") {
    return <p className="text-sm text-emerald-700 font-medium">You&apos;re in. See you Friday.</p>;
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="flex gap-2 max-w-sm">
        <input
          type="email"
          placeholder="your@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="flex-1 px-3 py-2 border border-gray-300 bg-white text-sm focus:outline-none focus:border-[#B45309] transition-colors"
        />
        <button
          type="submit"
          disabled={status === "loading"}
          className="px-4 py-2 bg-[#111827] text-white text-sm hover:bg-[#1f2937] transition-colors whitespace-nowrap disabled:opacity-60"
        >
          {status === "loading" ? "..." : "Subscribe"}
        </button>
      </form>
      {status === "duplicate" && (
        <p className="mt-2 text-sm text-gray-400">That email is already subscribed.</p>
      )}
      {status === "error" && (
        <p className="mt-2 text-sm text-red-600">Something went wrong — try again.</p>
      )}
    </>
  );
}
