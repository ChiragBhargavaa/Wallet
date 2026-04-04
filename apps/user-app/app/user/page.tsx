import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { prisma } from "@repo/db/client";

import { authOptions } from "../../lib/auth";
import { reconcileStaleOnRampTransactions } from "../../lib/reconcileOnRamp";
import { AddMoneyForm } from "./add-money-form";

function statusStyle(status: string) {
  switch (status) {
    case "Success":
      return "text-[#82e6ef]";
    case "Failure":
      return "text-[hotpink]";
    default:
      return "text-white/70";
  }
}

/** Decorative bars only — not tied to data */
function ActivityBars() {
  const heights = ["45%", "72%", "55%", "88%", "40%", "95%", "62%"];
  return (
    <div className="flex h-[min(12vh,7rem)] items-end gap-[0.35rem] md:gap-2" aria-hidden>
      {heights.map((h, i) => (
        <div
          key={i}
          className={`w-[clamp(0.35rem,1vw,0.55rem)] rounded-full ${i % 2 === 0 ? "bg-[#82e6ef]/45" : "bg-[hotpink]/45"}`}
          style={{ height: h }}
        />
      ))}
    </div>
  );
}

export default async function UserHome() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect("/login");
  }

  await reconcileStaleOnRampTransactions(session.user.id);

  const transactions = await prisma.onRampTransaction.findMany({
    where: { userId: session.user.id },
    orderBy: { startTime: "desc" },
    take: 50,
  });
  const balance = await prisma.balance.findUnique({
    where: { userId: session.user.id },
    select: { amount: true, locked: true },
  });

  return (
    <div className="box-border flex h-full min-h-0 w-full flex-col overflow-y-auto overflow-x-hidden p-[clamp(1rem,2.5vw,2rem)] text-white">
      <div className="mx-auto flex w-full max-w-[min(72rem,100%)] flex-col gap-[clamp(1.25rem,2.5vh,2rem)]">
        <section
          className="rounded-[clamp(24px,3.5vw,40px)] bg-[#121212] p-[clamp(1.25rem,2.8vw,2rem)] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)] ring-1 ring-white/[0.05]"
          aria-label="Balance and activity"
        >
          <div className="flex flex-col gap-[clamp(1.25rem,2.5vh,2rem)] lg:flex-row lg:items-end lg:justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-[clamp(0.75rem,1.3vw,0.875rem)] text-[#888888]">Wallet balance</p>
              <p className="mt-2 text-[clamp(2rem,6.5vw,3.5rem)] font-bold leading-none tracking-tight text-white">
                ₹{(balance?.amount ?? 0).toLocaleString()}
              </p>
              <p className="mt-3 text-[clamp(0.75rem,1.25vw,0.8125rem)] text-[#888888]">
                Locked: ₹{(balance?.locked ?? 0).toLocaleString()}
              </p>
            </div>
            <ActivityBars />
          </div>

          <div className="mt-[clamp(1.25rem,2.5vh,2rem)] grid gap-[clamp(1rem,2vw,1.5rem)] sm:grid-cols-3">
            <div className="rounded-[clamp(18px,2.2vw,26px)] bg-[#d0e1f9]/18 p-[clamp(1rem,2vw,1.35rem)] ring-1 ring-[#82e6ef]/20">
              <p className="text-[0.7rem] uppercase tracking-[0.12em] text-white/90">Available</p>
              <p className="mt-2 text-[clamp(1.15rem,2.5vw,1.35rem)] font-semibold text-white">
                ₹{(balance?.amount ?? 0).toLocaleString()}
              </p>
            </div>
            <div className="rounded-[clamp(18px,2.2vw,26px)] bg-[#f9d5a5]/14 p-[clamp(1rem,2vw,1.35rem)] ring-1 ring-[hotpink]/25">
              <p className="text-[0.7rem] uppercase tracking-[0.12em] text-white/90">Locked</p>
              <p className="mt-2 text-[clamp(1.15rem,2.5vw,1.35rem)] font-semibold text-white">
                ₹{(balance?.locked ?? 0).toLocaleString()}
              </p>
            </div>
            <div className="rounded-[clamp(18px,2.2vw,26px)] bg-[#d4f1e5]/14 p-[clamp(1rem,2vw,1.35rem)] ring-1 ring-white/10">
              <p className="text-[0.7rem] uppercase tracking-[0.12em] text-white/90">On-ramp</p>
              <p className="mt-2 text-[clamp(1.15rem,2.5vw,1.35rem)] font-semibold text-white">Bank deposit</p>
            </div>
          </div>
        </section>

        <section
          className="rounded-[clamp(22px,3vw,36px)] border border-[hotpink]/25 bg-[hotpink]/[0.08] px-[clamp(1.25rem,3vw,2rem)] py-[clamp(1.5rem,3.5vh,2.25rem)] text-center ring-1 ring-[hotpink]/15"
          aria-label="P2P transfer"
        >
          <p className="text-[clamp(1.35rem,4vw,2rem)] font-semibold tracking-tight text-white">P2P transfer</p>
          <p className="mx-auto mt-2 max-w-md text-[clamp(0.8rem,1.4vw,0.9rem)] text-white/85">
            Send to other users from your balance.
          </p>
        </section>

        <section id="add-money" className="scroll-mt-4">
          <h2 className="text-[clamp(1.05rem,2vw,1.35rem)] font-semibold text-white">Add money</h2>
          <p className="mt-2 text-[clamp(0.8rem,1.4vw,0.875rem)] text-[#888888]">
            Start an on-ramp deposit from your bank.
          </p>
          <AddMoneyForm />
        </section>

        <section id="history" className="scroll-mt-4 pb-[1vh]">
          <h2 className="text-[clamp(1.05rem,2vw,1.35rem)] font-semibold text-white">Transaction history</h2>
          <p className="mt-2 text-[clamp(0.8rem,1.4vw,0.875rem)] text-[#888888]">
            On-ramp deposits and their status.
          </p>

          {transactions.length === 0 ? (
            <p className="mt-[clamp(1rem,2vh,1.5rem)] text-center text-[clamp(0.85rem,1.35vw,0.9rem)] text-[#888888]">
              No transactions yet.
            </p>
          ) : (
            <ul className="mt-[clamp(1rem,2vh,1.5rem)] grid gap-[clamp(0.85rem,1.8vw,1.25rem)] sm:grid-cols-2 xl:grid-cols-3">
              {transactions.map((tx, i) => (
                <li
                  key={tx.id}
                  className="flex flex-col gap-3 rounded-[clamp(18px,2.2vw,26px)] bg-[#1c1c1c] p-[clamp(1rem,2vw,1.35rem)] ring-1 ring-white/[0.05]"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white ${i % 2 === 0 ? "bg-[#82e6ef]/35" : "bg-[hotpink]/35"}`}
                      aria-hidden
                    >
                      {tx.provider.slice(0, 1)}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold text-white">{tx.provider}</p>
                      <p className="text-[0.75rem] text-[#888888]">{tx.startTime.toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-baseline justify-between gap-2 border-t border-white/[0.06] pt-3">
                    <span className="text-lg font-semibold text-white">
                      +₹{tx.amount.toLocaleString()}
                    </span>
                    <span className={`text-sm font-medium ${statusStyle(tx.status)}`}>{tx.status}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <div className="rounded-[clamp(22px,3vw,36px)] border border-white/15 bg-[#141414] px-[clamp(1.25rem,2.5vw,2rem)] py-[clamp(1.25rem,2.5vh,1.75rem)]">
          <p className="text-[clamp(0.95rem,1.6vw,1.1rem)] font-semibold text-white">On-ramp deposits</p>
          <p className="mt-2 max-w-2xl text-[clamp(0.8rem,1.35vw,0.875rem)] leading-relaxed text-[#888888]">
            New deposits appear here as Processing until your bank confirms. You can add money anytime from the form
            above.
          </p>
        </div>
      </div>
    </div>
  );
}
