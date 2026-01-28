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
    <span className="text-2xl font-normal text-white drop-shadow-lg">
      Wallet
    </span>
  </div>
);

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="relative min-h-screen">
      <div className="absolute left-[4vw] h-[10vh] top-[4vh] z-20">
        <Logo />
      </div>
      {children}
    </div>
  );
}
