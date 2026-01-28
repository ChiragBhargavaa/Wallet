import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Wallet",
  description: "Wallet for instant, secure transfers.",
  icons: {
    icon: "/wallet-black-ring.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" style={{ height: "100%", width: "100%", overflow: "hidden" }}>
      <body style={{ margin: 0, minHeight: "100vh", height: "100%", width: "100%", overflow: "hidden" }}>
        {children}
      </body>
    </html>
  );
}
