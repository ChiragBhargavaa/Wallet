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
      className="mt-[clamp(0.85rem,2vh,1.25rem)] flex w-full flex-col gap-[clamp(1rem,2vh,1.35rem)] rounded-[clamp(22px,3vw,36px)] bg-[#d0e1f9]/10 p-[clamp(1.15rem,2.5vw,1.85rem)] ring-1 ring-[#82e6ef]/22"
    >
      <label className="flex flex-col gap-[0.5vh] text-[clamp(0.8rem,1.4vw,0.875rem)] text-white">
        Amount (INR)
        <input
          name="amount"
          type="number"
          min={1}
          step={1}
          required
          className="rounded-[clamp(14px,1.8vw,20px)] border border-white/10 bg-black/50 px-[clamp(0.85rem,2vw,1.1rem)] py-[clamp(0.55rem,1.4vh,0.75rem)] text-[clamp(0.9rem,1.5vw,1rem)] text-white outline-none transition placeholder:text-[#888888] focus:border-[#82e6ef]/55 focus:ring-2 focus:ring-[#82e6ef]/25"
          placeholder="Amount"
        />
      </label>
      <label className="flex flex-col gap-[0.5vh] text-[clamp(0.8rem,1.4vw,0.875rem)] text-white">
        Bank
        <select
          name="provider"
          id="bank"
          className="rounded-[clamp(14px,1.8vw,20px)] border border-white/10 bg-black/50 px-[clamp(0.85rem,2vw,1.1rem)] py-[clamp(0.55rem,1.4vh,0.75rem)] text-[clamp(0.9rem,1.5vw,1rem)] text-white outline-none transition focus:border-[hotpink]/50 focus:ring-2 focus:ring-[hotpink]/20"
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
        className="rounded-[clamp(16px,2vw,24px)] bg-[#82e6ef] px-[clamp(1rem,2.5vw,1.35rem)] py-[clamp(0.75rem,1.8vh,1rem)] text-[clamp(0.85rem,1.45vw,0.95rem)] font-semibold text-black transition hover:bg-[#82e6ef]/90 disabled:opacity-50"
      >
        {pending ? "Adding…" : "Add money"}
      </button>
      {message ? (
        <p className="text-center text-[clamp(0.75rem,1.3vw,0.875rem)] leading-snug text-[#888888]">{message}</p>
      ) : null}
    </form>
  );
}
