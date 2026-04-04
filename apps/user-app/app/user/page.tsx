import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { prisma } from "@repo/db/client";

import { authOptions } from "../../lib/auth";
import { reconcileStalePeerTransfers } from "../../lib/reconcilePeerTransfer";
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
  await reconcileStalePeerTransfers(session.user.id);

  const transactions = await prisma.onRampTransaction.findMany({
    where: { userId: session.user.id },
    orderBy: { startTime: "desc" },
    take: 50,
  });

  const peerTransfers = await prisma.peerTransfer.findMany({
    where: {
      OR: [{ fromUserId: session.user.id }, { toUserId: session.user.id }],
    },
    orderBy: { startTime: "desc" },
    take: 50,
    include: {
      fromUser: { select: { email: true, name: true } },
      toUser: { select: { email: true, name: true } },
    },
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
            Peer transfers and on-ramp deposits with live status.
          </p>

          <h3 className="mt-[clamp(1.25rem,2.5vh,1.75rem)] text-[clamp(0.95rem,1.6vw,1.05rem)] font-semibold text-white">
            Peer transfers
          </h3>
          {peerTransfers.length === 0 ? (
            <p className="mt-[clamp(0.65rem,1.5vh,1rem)] text-[clamp(0.85rem,1.35vw,0.9rem)] text-[#888888]">
              No peer transfers yet.
            </p>
          ) : (
            <ul className="mt-[clamp(0.65rem,1.5vh,1rem)] grid gap-[clamp(0.85rem,1.8vw,1.25rem)] sm:grid-cols-2 xl:grid-cols-3">
              {peerTransfers.map((tx) => {
                const outgoing = tx.fromUserId === session.user.id;
                const counterparty = outgoing ? tx.toUser : tx.fromUser;
                const label = outgoing ? "Sent to" : "Received from";
                const amountPrefix = outgoing ? "−" : "+";
                return (
                  <li
                    key={`peer-${tx.id}`}
                    className={`flex flex-col gap-3 rounded-[clamp(18px,2.2vw,26px)] p-[clamp(1rem,2vw,1.35rem)] ring-1 ${
                      outgoing
                        ? "bg-[#f9d5a5]/08 ring-[hotpink]/18"
                        : "bg-[#d0e1f9]/08 ring-[#82e6ef]/18"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white ${outgoing ? "bg-[hotpink]/35" : "bg-[#82e6ef]/35"}`}
                        aria-hidden
                      >
                        {outgoing ? "→" : "←"}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-[0.7rem] uppercase tracking-[0.1em] text-[#888888]">P2P</p>
                        <p className="truncate font-semibold text-white">
                          {label} {counterparty.email}
                        </p>
                        <p className="text-[0.75rem] text-[#888888]">{tx.startTime.toLocaleString()}</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-baseline justify-between gap-2 border-t border-white/[0.06] pt-3">
                      <span
                        className={`text-lg font-semibold ${outgoing ? "text-[hotpink]" : "text-[#82e6ef]"}`}
                      >
                        {amountPrefix}₹{tx.amount.toLocaleString()}
                      </span>
                      <span className={`text-sm font-medium ${statusStyle(tx.status)}`}>{tx.status}</span>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}

          <h3 className="mt-[clamp(1.5rem,3vh,2rem)] text-[clamp(0.95rem,1.6vw,1.05rem)] font-semibold text-white">
            On-ramp deposits
          </h3>
          {transactions.length === 0 ? (
            <p className="mt-[clamp(0.65rem,1.5vh,1rem)] text-center text-[clamp(0.85rem,1.35vw,0.9rem)] text-[#888888]">
              No on-ramp deposits yet.
            </p>
          ) : (
            <ul className="mt-[clamp(0.65rem,1.5vh,1rem)] grid gap-[clamp(0.85rem,1.8vw,1.25rem)] sm:grid-cols-2 xl:grid-cols-3">
              {transactions.map((tx, i) => (
                <li
                  key={tx.id}
                  className={`flex flex-col gap-3 rounded-[clamp(18px,2.2vw,26px)] p-[clamp(1rem,2vw,1.35rem)] ring-1 ${
                    i % 2 === 0
                      ? "bg-[#d0e1f9]/08 ring-[#82e6ef]/18"
                      : "bg-[#f9d5a5]/08 ring-[hotpink]/18"
                  }`}
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

        <div className="rounded-[clamp(22px,3vw,36px)] bg-[#d4f1e5]/10 px-[clamp(1.25rem,2.5vw,2rem)] py-[clamp(1.25rem,2.5vh,1.75rem)] ring-1 ring-[#d4f1e5]/28">
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
