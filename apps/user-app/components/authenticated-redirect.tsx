"use client";

import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { getDashboardPath } from "../lib/dashboard-path";

/**
 * When mounted, redirects to /user or /merchant if the user is authenticated.
 * Renders nothing. Use on the home page so logged-in users are sent to their dashboard.
 */
export function AuthenticatedRedirect() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (status !== "authenticated" || !session) return;
    const path = getDashboardPath(session.user?.role);
    const fromOAuth = searchParams.get("from_oauth");
    const url = fromOAuth ? `${path}?from_oauth=${fromOAuth}` : path;
    router.replace(url);
  }, [status, session, router, searchParams]);

  return null;
}
