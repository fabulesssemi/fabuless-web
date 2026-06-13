import Link from "next/link";

export default function NotFound() {
  return (
    <div className="max-w-2xl mx-auto px-6 pt-32 pb-16 text-center">
      <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#B45309] mb-4">
        404
      </p>
      <h1 className="font-sans text-4xl font-bold text-[#111827] tracking-tight mb-4">
        Page not found
      </h1>
      <p className="text-[15px] text-gray-500 mb-10">
        This page doesn't exist. The chip you were looking for may have been discontinued.
      </p>
      <div className="flex gap-4 justify-center flex-wrap">
        <Link
          href="/"
          className="px-5 py-2.5 bg-[#111827] text-white text-[13px] font-medium hover:bg-[#1f2937] transition-colors"
        >
          Back to home
        </Link>
        <Link
          href="/tracker"
          className="px-5 py-2.5 border border-gray-200 text-[#111827] text-[13px] font-medium hover:border-gray-400 transition-colors"
        >
          Expert Tracker
        </Link>
      </div>
    </div>
  );
}
