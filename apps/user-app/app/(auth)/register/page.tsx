"use client";

import React, { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const registered = searchParams.get("registered") === "1";

  const [role, setRole] = useState<"user" | "merchant">("user");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const isUser = role === "user";
  const accentRing = isUser
    ? "focus:border-[#82e6ef]/60 focus:ring-2 focus:ring-[#82e6ef]/20"
    : "focus:border-[hotpink]/60 focus:ring-2 focus:ring-[hotpink]/20";
  const accentCheckbox = isUser
    ? "text-[#82e6ef] focus:ring-[#82e6ef]/40"
    : "text-[hotpink] focus:ring-[hotpink]/40";
  const accentButton = isUser
    ? "bg-[#82e6ef] text-black hover:bg-[#82e6ef]/90"
    : "bg-[hotpink] text-black hover:bg-[hotpink]/90";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name || undefined, email, password, role }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        error?: string | { email?: string[]; password?: string[] };
      };

      if (!res.ok) {
        if (typeof data.error === "string") {
          setError(data.error);
        } else if (data.error && typeof data.error === "object") {
          const msg =
            (data.error as { email?: string[] }).email?.[0] ??
            (data.error as { password?: string[] }).password?.[0] ??
            "Something went wrong. Please try again.";
          setError(msg);
        } else {
          setError("Something went wrong. Please try again.");
        }
        return;
      }

      const signInRes = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });
      if (signInRes?.error) {
        router.push("/login?registered=1");
        return;
      }
      router.push("/");
      router.refresh();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-linear-to-br from-zinc-950 via-black to-zinc-900 px-4 py-12 text-white">
      <div
        className={`absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full blur-3xl ${
          isUser ? "bg-[#82e6ef]/20" : "bg-[hotpink]/20"
        }`}
      />
      <div className="absolute -bottom-24 right-12 h-64 w-64 rounded-full bg-indigo-500/20 blur-3xl" />

      <div className="relative grid w-full max-w-4xl gap-6 overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-2xl shadow-black/50 backdrop-blur-xl md:grid-cols-[36vw_minmax(0,1fr)]">
        <div className="relative hidden h-full bg-black md:block">
          <img
            src="/login.jpg"
            alt="Login"
            className="h-full w-full object-contain"
          />
          <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/10 to-transparent" />
        </div>

        <div className="flex flex-col gap-6 p-8 md:p-10">
          <div>
            <span className="text-xs uppercase tracking-[0.35em] text-white/40">
              Get started
            </span>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight">
              Create your Wallet account
            </h1>
          </div>

          {registered && (
            <p className="rounded-xl bg-green-500/20 px-4 py-2 text-sm text-green-300">
              Account created. Please sign in.
            </p>
          )}

          <div className="flex gap-2 rounded-2xl border border-white/10 bg-white/5 p-1 text-sm">
            <button
              type="button"
              onClick={() => setRole("user")}
              className={`flex-1 rounded-xl px-4 py-2 shadow-sm shadow-black/30 transition ${
                isUser
                  ? "bg-[#82e6ef] text-black hover:bg-[#82e6ef]/90"
                  : "text-white/70 hover:bg-white/10 hover:text-white"
              }`}
            >
              User
            </button>
            <button
              type="button"
              onClick={() => setRole("merchant")}
              className={`flex-1 rounded-xl px-4 py-2 transition ${
                isUser
                  ? "text-white/70 hover:bg-white/10 hover:text-white"
                  : "bg-[hotpink] text-black hover:bg-[hotpink]/90"
              }`}
            >
              Merchant
            </button>
          </div>

          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-4 text-white"
          >
            {error && (
              <p className="rounded-xl bg-red-500/20 px-4 py-2 text-sm text-red-300">
                {error}
              </p>
            )}
            <label className="flex flex-col gap-2 text-sm text-white/70">
              Full name
              <input
                name="name"
                type="text"
                placeholder="Your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={`rounded-xl border border-white/15 bg-black/40 px-4 py-3 text-white outline-none transition ${accentRing}`}
              />
            </label>
            <label className="flex flex-col gap-2 text-sm text-white/70">
              Email address
              <input
                name="email"
                type="email"
                placeholder="you@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className={`rounded-xl border border-white/15 bg-black/40 px-4 py-3 text-white outline-none transition ${accentRing}`}
              />
            </label>
            <label className="flex flex-col gap-2 text-sm text-white/70">
              Password
              <div className="relative">
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a strong password (min 8 characters)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  className={`w-full rounded-xl border border-white/15 bg-black/40 px-4 py-3 pr-20 text-white outline-none transition ${accentRing}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-white/60 transition hover:text-white"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </label>

            <div className="flex items-center gap-3 text-xs text-white/60">
              <input
                type="checkbox"
                className={`h-4 w-4 rounded border-white/30 bg-black/40 ${accentCheckbox}`}
              />
              I agree to the Terms and Privacy Policy
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`rounded-2xl px-6 py-3 text-sm font-semibold shadow-lg transition disabled:opacity-60 ${accentButton}`}
            >
              {isLoading ? "Creating account…" : "Create account"}
            </button>
          </form>

          <p className="text-center text-sm text-white/60">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-medium text-white underline hover:no-underline"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-zinc-950 text-white">Loading…</div>}>
      <RegisterForm />
    </Suspense>
  );
}
