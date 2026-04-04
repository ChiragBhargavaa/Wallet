"use client";

import Link from "next/link";
import Image from "next/image";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { IoMdSettings } from "react-icons/io";
import { FaList } from "react-icons/fa6";
import { GoHomeFill } from "react-icons/go";

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
      <aside className="flex w-[5vw] min-w-16 shrink-0 flex-col items-center justify-center gap-[2vh] border-r border-white/[0.06] bg-black text-white/35">
        <GoHomeFill className="h-8 w-8 transition hover:text-white/80" />
        <FaList className="h-8 w-8 transition hover:text-white/80" />
        <IoMdSettings className="h-8 w-8 transition hover:text-white/80" />
      </aside>

      {/* Overview column — layout only; live data stays on the home page */}
      <div className="hidden min-h-0 w-[min(28vw,22rem)] shrink-0 flex-col gap-[clamp(1.25rem,2.5vh,2rem)] overflow-y-auto border-r border-white/[0.06] bg-[#1a1a1a] px-[clamp(1.1rem,2.2vw,1.75rem)] py-[clamp(1.5rem,3vh,2.5rem)] lg:flex">
        <h2 className="text-[clamp(1.35rem,2.4vw,1.75rem)] font-semibold tracking-tight text-white">
          Overview
        </h2>
        <div className="rounded-[clamp(22px,3vw,36px)] bg-[#0c0c0c] p-[clamp(1.1rem,2vw,1.5rem)] shadow-[0_20px_40px_-20px_rgba(0,0,0,0.8)] ring-1 ring-white/[0.07]">
          <p className="text-[0.7rem] uppercase tracking-[0.14em] text-[#888888]">Wallet</p>
          <p className="mt-3 text-lg font-medium text-white">Digital balance</p>
          <div className="mt-5 flex items-center justify-between gap-3">
            <span className="h-9 w-12 rounded-[10px] bg-[#82e6ef]/35" aria-hidden />
            <span className="h-9 w-12 rounded-[10px] bg-[hotpink]/35" aria-hidden />
          </div>
        </div>
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
              className="rounded-[14px] border border-white/15 bg-white px-4 py-2 text-sm font-semibold text-black transition hover:bg-white/90"
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
