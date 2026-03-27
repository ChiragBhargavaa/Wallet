import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { prisma } from "@repo/db/client";

import { authOptions } from "../../lib/auth";
import { AddMoneyForm } from "./add-money-form";

function statusStyle(status: string) {
  switch (status) {
    case "Success":
      return "text-emerald-400";
    case "Failure":
      return "text-red-400";
    default:
      return "text-amber-400";
  }
}

export default async function UserHome() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect("/login");
  }

  const transactions = await prisma.onRampTransaction.findMany({
    where: { userId: session.user.id },
    orderBy: { startTime: "desc" },
    take: 50,
  });

  return (
    <div className="p-6 text-white">
      <h2 className="text-lg font-semibold tracking-tight">Add money</h2>
      <p className="mt-1 text-sm text-zinc-400">Start an on-ramp deposit from your bank.</p>
      <AddMoneyForm />

      <div className="mt-10">
        <h2 className="text-lg font-semibold tracking-tight">Transaction history</h2>
        <p className="mt-1 text-sm text-zinc-400">On-ramp deposits and their status.</p>

        {transactions.length === 0 ? (
          <p className="mt-4 text-sm text-zinc-500">No transactions yet.</p>
        ) : (
          <ul className="mt-4 divide-y divide-white/10 rounded-lg border border-white/10">
            {transactions.map((tx) => (
              <li
                key={tx.id}
                className="flex flex-wrap items-baseline justify-between gap-2 px-4 py-3 text-sm"
              >
                <div className="flex flex-col gap-0.5">
                  <span className="font-medium text-zinc-100">
                    +₹{tx.amount.toLocaleString()} · {tx.provider}
                  </span>
                  <span className="text-xs text-zinc-500">
                    {tx.startTime.toLocaleString()}
                  </span>
                </div>
                <span className={`font-medium ${statusStyle(tx.status)}`}>{tx.status}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
