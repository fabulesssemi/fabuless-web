"use client";
import { useSession, signIn, signOut } from "next-auth/react";
import Image from "next/image";

export function AuthButton() {
  const { data: session, status } = useSession();

  if (status === "loading") return null;

  if (session?.user) {
    return (
      <div className="relative group">
        <button className="flex items-center gap-2">
          {session.user.image ? (
            <Image src={session.user.image} alt="avatar" width={28} height={28} className="rounded-full" />
          ) : (
            <div className="w-7 h-7 rounded-full bg-amber-500 flex items-center justify-center text-xs font-bold text-white">
              {(session.user.name?.[0] || session.user.email?.[0] || "U").toUpperCase()}
            </div>
          )}
        </button>
        <div className="absolute right-0 top-full pt-2 hidden group-hover:block z-50">
          <div className="bg-[#111827] border border-gray-700 py-1.5 w-44 shadow-lg">
            <div className="px-4 py-2 text-xs text-gray-400 border-b border-gray-700 truncate">{session.user.email}</div>
            <button
              onClick={() => signOut()}
              className="block w-full text-left px-4 py-2 text-sm text-gray-400 hover:text-amber-400 hover:bg-white/5 transition-colors"
            >
              Sign out
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={() => signIn("google")}
      className="text-sm px-3 py-1.5 rounded border border-gray-600 text-gray-300 hover:border-amber-400 hover:text-amber-400 transition-colors"
    >
      Sign in
    </button>
  );
}
