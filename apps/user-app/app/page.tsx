import Hyperspeed from "@repo/ui/Hyperspeed";

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

      <div className="relative h-[10vh] z-10 flex  items-center justify-between px-[4vw] px-4">
        <h1 className="text-2xl font-normal text-white drop-shadow-lg">
          WALLET.COM
        </h1>
        <div>
          <button className="text-white px-4 py-2 rounded-md">Sign Up</button>
          <button className="bg-white text-black px-5 py-1.5 rounded-3xl">Login</button>
        </div>
        

      </div>
      
    </main>
  );
}
