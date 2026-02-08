"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Image from "next/image";

export default function MerchantLayout({
  children,
}: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login");
    } else if (status === "authenticated" && session?.user?.role !== "merchant") {
      router.replace("/user");
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
    <div className="min-h-screen bg-zinc-950 text-white">
      <header className="flex items-center justify-between border-b border-white/10 px-4 py-3 md:px-6">
        <Link href="/merchant" className="flex items-center gap-2">
          <Image src="/wallet-clean.png" alt="Wallet" width={28} height={28} />
          <span className="text-xl font-medium text-white">Merchant</span>
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
      {children}
    </div>
  );
}
