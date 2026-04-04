"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import {
  initiatePeerTransfer,
  searchPeerUsers,
  type PeerUserSearchResult,
} from "../../lib/createPeerTransfer";

export function PeerTransferForm() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<PeerUserSearchResult[]>([]);
  const [selected, setSelected] = useState<PeerUserSearchResult | null>(null);
  const [pending, setPending] = useState(false);
  const [searching, setSearching] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      return;
    }

    const handle = setTimeout(async () => {
      setSearching(true);
      try {
        const r = await searchPeerUsers(query);
        setResults(r);
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Search failed");
        setResults([]);
      } finally {
        setSearching(false);
      }
    }, 320);

    return () => clearTimeout(handle);
  }, [query]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage(null);
    if (!selected) {
      const err = "Search by email and select a recipient.";
      setMessage(err);
      toast.error(err);
      return;
    }

    const form = e.currentTarget;
    const data = new FormData(form);
    const amount = Number(data.get("amount"));

    setPending(true);
    try {
      const result = await initiatePeerTransfer(selected.id, amount);
      setMessage(
        result.status === "Processing"
          ? "Transfer is still processing — refresh in a moment if balance looks off."
          : "Transfer completed."
      );
      toast.success("Transfer submitted.");
      form.reset();
      setSelected(null);
      setQuery("");
      setResults([]);
      router.refresh();
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
      className="mt-[clamp(0.85rem,2vh,1.25rem)] flex w-full min-w-0 flex-col gap-[clamp(1rem,2vh,1.35rem)] rounded-[clamp(22px,3vw,36px)] bg-[#1c1c1c] p-[clamp(1.15rem,2.5vw,1.85rem)] ring-1 ring-white/[0.06]"
    >
      <label className="flex flex-col gap-[0.5vh] text-[clamp(0.8rem,1.4vw,0.875rem)] text-white">
        Find user by email
        <input
          type="search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setSelected(null);
          }}
          autoComplete="off"
          className="rounded-[clamp(14px,1.8vw,20px)] border border-white/10 bg-black/50 px-[clamp(0.85rem,2vw,1.1rem)] py-[clamp(0.55rem,1.4vh,0.75rem)] text-[clamp(0.9rem,1.5vw,1rem)] text-white outline-none transition placeholder:text-[#888888] focus:border-[#82e6ef]/55 focus:ring-2 focus:ring-[#82e6ef]/25"
          placeholder="Type at least 2 characters"
        />
        {searching ? (
          <span className="text-[0.75rem] text-[#888888]">Searching…</span>
        ) : null}
      </label>

      {results.length > 0 ? (
        <div className="flex flex-col gap-2 rounded-[clamp(14px,1.8vw,20px)] border border-white/10 bg-black/30 p-3">
          <p className="text-[0.7rem] uppercase tracking-[0.12em] text-white/70">Matches</p>
          <ul className="max-h-[min(10rem,28vh)] space-y-1 overflow-y-auto">
            {results.map((u) => {
              const isSelected = selected?.id === u.id;
              return (
                <li key={u.id}>
                  <button
                    type="button"
                    onClick={() => setSelected(u)}
                    className={`w-full rounded-[clamp(12px,1.5vw,16px)] px-3 py-2 text-left text-[clamp(0.85rem,1.35vw,0.9rem)] transition ${
                      isSelected
                        ? "bg-[#82e6ef]/25 ring-1 ring-[#82e6ef]/40"
                        : "bg-white/[0.04] hover:bg-white/[0.08]"
                    }`}
                  >
                    <span className="block font-medium text-white">{u.email}</span>
                    {u.name ? <span className="block text-[0.8rem] text-[#888888]">{u.name}</span> : null}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      ) : query.trim().length >= 2 && !searching ? (
        <p className="text-[0.8rem] text-[#888888]">No users match that email.</p>
      ) : null}

      <label className="flex flex-col gap-[0.5vh] text-[clamp(0.8rem,1.4vw,0.875rem)] text-white">
        Amount (INR)
        <input
          name="amount"
          type="number"
          min={1}
          step={1}
          required
          disabled={!selected}
          className="rounded-[clamp(14px,1.8vw,20px)] border border-white/10 bg-black/50 px-[clamp(0.85rem,2vw,1.1rem)] py-[clamp(0.55rem,1.4vh,0.75rem)] text-[clamp(0.9rem,1.5vw,1rem)] text-white outline-none transition placeholder:text-[#888888] focus:border-[hotpink]/50 focus:ring-2 focus:ring-[hotpink]/20 disabled:opacity-45"
          placeholder="Amount"
        />
      </label>

      <button
        type="submit"
        disabled={pending || !selected}
        className="rounded-[clamp(16px,2vw,24px)] bg-[hotpink] px-[clamp(1rem,2.5vw,1.35rem)] py-[clamp(0.75rem,1.8vh,1rem)] text-[clamp(0.85rem,1.45vw,0.95rem)] font-semibold text-black transition hover:bg-[hotpink]/90 disabled:opacity-50"
      >
        {pending ? "Sending…" : "Send money"}
      </button>
      {message ? (
        <p className="text-center text-[clamp(0.75rem,1.3vw,0.875rem)] leading-snug text-[#888888]">{message}</p>
      ) : null}
    </form>
  );
}
