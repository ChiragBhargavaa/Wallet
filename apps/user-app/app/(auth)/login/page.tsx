'use client'
import React, { useState } from "react";


const LoginPage = () => {
  const [role, setRole] = useState<"user" | "merchant">("user");
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
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-linear-to-br from-zinc-950 via-black to-zinc-900 px-4 py-12 text-white">
      <div
        className={`absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full blur-3xl ${
          isUser ? "bg-[#82e6ef]/20" : "bg-[hotpink]/20"
        }`}
      />
      <div className="absolute -bottom-24 right-12 h-64 w-64 rounded-full bg-indigo-500/20 blur-3xl" />

      <div className="relative grid w-full max-w-4xl gap-6 overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-2xl shadow-black/50 backdrop-blur-xl md:grid-cols-[minmax(0,1fr)_36vw]">
        <div className="flex flex-col gap-6 p-8 md:p-10">
          <div>
            
            <h1 className="mt-3 text-3xl  font-semibold tracking-tight">
              Welcome back!
            </h1>
           
          </div>

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

          <form className="flex flex-col gap-4 text-white">
            <label className="flex flex-col gap-2 text-sm text-white/70">
              Email address
              <input
                type="email"
                placeholder="you@email.com"
                className={`rounded-xl border border-white/15 bg-black/40 px-4 py-3 text-white outline-none transition ${accentRing}`}
              />
            </label>
            <label className="flex flex-col gap-2 text-sm text-white/70">
              Password
              <input
                type="password"
                placeholder="••••••••"
                className={`rounded-xl border border-white/15 bg-black/40 px-4 py-3 text-white outline-none transition ${accentRing}`}
              />
            </label>

            <div className="flex items-center justify-between text-xs text-white/60">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  className={`h-4 w-4 rounded border-white/30 bg-black/40 ${accentCheckbox}`}
                />
                Remember me
              </label>
              <button type="button" className="transition hover:text-white">
                Forgot password?
              </button>
            </div>

            <button
              type="submit"
              className={`rounded-2xl px-6 py-3 text-sm font-semibold shadow-lg transition ${accentButton}`}
            >
              Login
            </button>
          </form>

          <div className="flex items-center gap-4 text-xs uppercase tracking-[0.2em] text-white/40">
            <span className="h-px flex-1 bg-white/10" />
            or
            <span className="h-px flex-1 bg-white/10" />
          </div>

          <button
            type="button"
            className="flex items-center justify-center gap-3 rounded-2xl border border-white/15 bg-white/5 px-6 py-3 text-sm font-medium text-white transition hover:bg-white/15"
          >
            <img src="/google-login.png" alt="Google Logo" className="h-5 w-5" />
            Continue with Google
          </button>
        </div>

        <div className="relative hidden h-full bg-black md:block">
          <img
            src="/login.jpg"
            alt="Login"
            className="h-full w-full object-contain"
          />
          <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/10 to-transparent" />
        </div>
      </div>
    </div>
  );
}

export default LoginPage;