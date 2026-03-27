"use client";

import { useState } from "react";
import { toast } from "sonner";

import { createOnRamp } from "../../lib/createOnRamp";

const BANKS = [
  { value: "HDFC", label: "HDFC" },
  { value: "ICICI", label: "ICICI" },
  { value: "SBI", label: "SBI" },
  { value: "PNB", label: "PNB" },
  { value: "AMX", label: "AMX" },
] as const;

export function AddMoneyForm() {
  const [message, setMessage] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage(null);
    const form = e.currentTarget;
    const data = new FormData(form);
    const amount = Number(data.get("amount"));
    const provider = String(data.get("provider") ?? "HDFC");

    setPending(true);
    try {
      await createOnRamp(amount, provider);
      setMessage("Deposit started — status appears below as Processing until the bank confirms.");
      toast.success("Deposit request submitted.");
      form.reset();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Something went wrong";
      setMessage(errorMessage);
      toast.error(errorMessage);
    } finally {
      setPending(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-4 flex max-w-md flex-col gap-3 rounded-lg border border-white/10 bg-zinc-900/50 p-4"
    >
      <label className="flex flex-col gap-1 text-sm text-zinc-300">
        Amount (INR)
        <input
          name="amount"
          type="number"
          min={1}
          step={1}
          required
          className="rounded-md border border-white/15 bg-black px-3 py-2 text-white outline-none focus:border-white/40"
          placeholder="Amount"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm text-zinc-300">
        Bank
        <select
          name="provider"
          id="bank"
          className="rounded-md border border-white/15 bg-black px-3 py-2 text-white outline-none focus:border-white/40"
        >
          {BANKS.map((b) => (
            <option key={b.value} value={b.value}>
              {b.label}
            </option>
          ))}
        </select>
      </label>
      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-500 disabled:opacity-50"
      >
        {pending ? "Adding…" : "Add money"}
      </button>
      {message ? <p className="text-sm text-zinc-400">{message}</p> : null}
    </form>
  );
}
