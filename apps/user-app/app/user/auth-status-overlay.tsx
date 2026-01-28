'use client'

import { useSession, signOut } from 'next-auth/react'

export function AuthStatusOverlay() {
  const { data: session, status } = useSession()

  if (status === 'loading') {
    return (
      <div className="fixed top-4 right-4 z-50 flex items-center gap-2 rounded-lg border border-zinc-600 bg-zinc-900/95 px-4 py-2 text-sm text-zinc-400 backdrop-blur">
        Checking auth…
      </div>
    )
  }

  return (
    <>
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
        <div
          className={`flex items-center gap-2 rounded-lg border px-4 py-2 text-sm backdrop-blur ${
            session
              ? 'border-emerald-500/50 bg-emerald-950/90 text-emerald-300'
              : 'border-amber-500/50 bg-amber-950/90 text-amber-300'
          }`}
        >
          <span
            className={`h-2 w-2 shrink-0 rounded-full ${
              session ? 'bg-emerald-400' : 'bg-amber-400'
            }`}
          />
          <span className="font-medium">
            {session ? 'Logged in' : 'Not logged in'}
          </span>
          {session?.user?.email && (
            <span className="max-w-[180px] truncate text-xs opacity-80">
              ({session.user.email})
            </span>
          )}
        </div>
        {session && (
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="rounded-lg border border-red-500/50 bg-red-950/80 px-4 py-2 text-sm font-medium text-red-300 transition hover:bg-red-900/80 hover:text-red-200"
          >
            Log out
          </button>
        )}
      </div>
    </>
  )
}
