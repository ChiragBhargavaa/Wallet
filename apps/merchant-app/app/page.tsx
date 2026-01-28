import Image from "next/image";

const Logo = ({ className = "" }: { className?: string }) => (
  <div className={`flex items-center gap-2 ${className}`}>
    <Image
      src="/wallet-clean.png"
      alt="Wallet logo"
      width={28}
      height={28}
      priority
    />
    <span className="text-xl font-semibold text-slate-900">Wallet Merchant</span>
  </div>
);

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col bg-white text-slate-900">
      <header className="flex items-center justify-between px-8 py-6">
        <Logo />
        <button className="rounded-full border border-slate-200 px-5 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
          Sign in
        </button>
      </header>

      <section className="flex flex-1 flex-col items-center justify-center gap-6 px-8 text-center">
        <h1 className="text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
          Accept payments and manage payouts in minutes.
        </h1>
        <p className="max-w-2xl text-base text-slate-600 sm:text-lg">
          Wallet Merchant gives you real-time insights, automated settlements, and
          unified reporting across every channel.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <button className="rounded-full bg-slate-900 px-6 py-2 text-sm font-medium text-white hover:bg-slate-800">
            Create merchant account
          </button>
          <button className="rounded-full border border-slate-200 px-6 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
            View dashboard demo
          </button>
        </div>
      </section>
    </main>
  );
}
