"use client";

import Link from "next/link";
import Image from "next/image";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function UserLayout({
  children,
}: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login");
    } else if (status === "authenticated" && session?.user?.role === "merchant") {
      router.replace("/merchant");
    }
  }, [status, session, router]);

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950 text-white">
        Loading…
      </div>
    );
  }

  if (!session) return null;

  return (
    <div className="flex min-h-screen bg-zinc-950 text-white">
      <aside className="w-[5vw] min-w-16 border-r border-white/10 bg-black/40" />
      <div className="flex flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-white/10 px-4 py-3 md:px-6">
          <Link href="/user" className="flex items-center gap-2">
            <Image src="/wallet-clean.png" alt="Wallet" width={28} height={28} />
            <span className="text-xl font-medium text-white">Wallet</span>
          </Link>
          <div className="flex items-center gap-3">
            <span className="max-w-[180px] truncate text-sm text-zinc-400">
              {session.user?.email}
            </span>
            <button
              type="button"
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="rounded-lg border border-red-500/50 bg-red-950/80 px-4 py-2 text-sm font-medium text-red-300 transition hover:bg-red-900/80 hover:text-red-200"
            >
              Logout
            </button>
          </div>
        </header>
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
