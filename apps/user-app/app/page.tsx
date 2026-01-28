import Image from "next/image";
import Link from "next/link";
import Hyperspeed from "@repo/ui/Hyperspeed";

const Logo = ({ className = "" }: { className?: string }) => (
  <div className={`flex items-center gap-2 ${className}`}>
    <Image
      src="/wallet-clean.png"
      alt="Wallet logo"
      width={28}
      height={28}
      priority
    />
    <span className="text-2xl font-normal text-white drop-shadow-lg">Wallet</span>
  </div>
);

export default function Home() {
  return (
    <main
      className="relative min-h-screen w-full"
      style={{
        height: "100dvh",
        position: "relative",
        width: "100%",
        overflow: "hidden",
      }}
    >
      <div
        className="fixed inset-0 z-0"
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
          height: "100dvh",
          width: "100%",
          overflow: "hidden",
        }}
      >
        <div style={{ width: "100%", height: "100dvh" }}>
          <Hyperspeed />
        </div>
      </div>

      <div className="relative h-[10vh] z-10 flex items-center justify-between px-[4vw]">
        <Logo />
        <div className="flex items-center gap-2">
          <Link
            href="/register"
            className="rounded-md px-4 py-2 text-white transition hover:bg-white/10"
          >
            Sign Up
          </Link>
          <Link
            href="/login"
            className="rounded-3xl bg-white px-5 py-1.5 text-black transition hover:bg-white/90"
          >
            Login
          </Link>
        </div>
      </div>

      <div className=" mt-[10vh] relative  flex flex-col  items-center justify-between">
        <p
          className="text-6xl font-medium text-[#82e6ef] drop-shadow-lg"
        >
          <span className="underline">Send</span>{" "}
          <span className="text-white">money</span>{" "}
          <span className="underline">faster</span>
        </p>
        <p className="text-6xl font-medium text-white drop-shadow-lg">than sending a message.</p>

        <p className="text-[#e0e0e0] text-center mt-[4vh] font-medium drop-shadow-lg">A real time payment wallet that delivers instant transfers, seamless tracking,</p>
        <p className="text-[#e0e0e0] text-center font-medium drop-shadow-lg"> and secure transactions in one place.</p>
      
      <Link
        href="/register"
        className="mt-[4vh] rounded-3xl border border-white/5 bg-white/10 px-10 py-2 text-white shadow-lg shadow-black/20 transition hover:bg-white/20"
      >
        Get Started
      </Link>
      </div>

      <p className="absolute bottom-4 left-1/2 -translate-x-1/2 text-center text-sm text-gray-400 font-medium drop-shadow-lg">
        Copyright © 2026 Wallet. All rights reserved.
      </p>

      
      
    </main>
  );
}
