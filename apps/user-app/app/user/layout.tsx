"use client";

import Link from "next/link";
import Image from "next/image";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { PeerTransferForm } from "./peer-transfer-form";

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
      <div className="flex min-h-screen items-center justify-center bg-black text-white">
        Loading…
      </div>
    );
  }

  if (!session) return null;

  return (
    <div className="flex h-[100dvh] max-h-[100dvh] w-full overflow-hidden bg-black text-white">
      {/* Overview column — wallet summary and P2P transfer */}
      <div className="hidden min-h-0 w-[min(28vw,22rem)] shrink-0 flex-col gap-[clamp(1.25rem,2.5vh,2rem)] overflow-y-auto border-r border-white/[0.06] bg-[#1a1a1a] px-[clamp(1.1rem,2.2vw,1.75rem)] py-[clamp(1.5rem,3vh,2.5rem)] lg:flex">
        <h2 className="text-[clamp(1.35rem,2.4vw,1.75rem)] font-semibold tracking-tight text-white">
          Overview
        </h2>
        <div className="rounded-[clamp(22px,3vw,36px)] bg-[#0c0c0c] p-[clamp(1.1rem,2vw,1.5rem)] shadow-[0_20px_40px_-20px_rgba(0,0,0,0.8)]">
          <p className="text-[0.7rem] uppercase tracking-[0.14em] text-[#888888]">Wallet</p>
          <p className="mt-3 text-lg font-medium text-white">Digital balance</p>
          <div className="mt-5 flex items-center justify-between gap-3">
            <span className="h-9 w-12 rounded-[10px] bg-[#82e6ef]/35" aria-hidden />
            <span className="h-9 w-12 rounded-[10px] bg-[hotpink]/35" aria-hidden />
          </div>
        </div>

        <section className="min-w-0" aria-label="P2P transfer">
          <h3 className="text-[clamp(1.05rem,2vw,1.35rem)] font-semibold text-white">P2P transfer</h3>
          <p className="mt-2 text-[clamp(0.75rem,1.25vw,0.8125rem)] leading-snug text-[#888888]">
            Search by email, pick a user, send from your available balance.
          </p>
          <PeerTransferForm />
        </section>

        <div className="flex flex-wrap gap-2">
          {(["INR", "USD", "EUR"] as const).map((c) => (
            <span
              key={c}
              className="rounded-full bg-[#252525] px-[clamp(0.65rem,1.4vw,0.85rem)] py-[0.35rem] text-[clamp(0.65rem,1.1vw,0.75rem)] font-medium text-white"
            >
              {c}
            </span>
          ))}
        </div>
      </div>

      <div className="flex min-h-0 min-w-0 flex-1 flex-col bg-black">
        <header className="flex shrink-0 items-center justify-between border-b border-white/[0.06] px-[clamp(1rem,3vw,2rem)] py-[clamp(0.65rem,1.5vh,1rem)]">
          <Link href="/user" className="flex items-center gap-2">
            <Image src="/wallet-clean.png" alt="Wallet" width={28} height={28} />
            <span className="text-xl font-medium text-white">Wallet</span>
          </Link>
          <div className="flex items-center gap-3">
            <span className="max-w-[min(200px,40vw)] truncate text-sm text-[#888888]">
              {session.user?.email}
            </span>
            <button
              type="button"
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="rounded-[14px] border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:border-white/25 hover:bg-white/10"
            >
              Logout
            </button>
          </div>
        </header>
        <main className="flex min-h-0 flex-1 flex-col overflow-hidden">{children}</main>
      </div>
    </div>
  );
}
