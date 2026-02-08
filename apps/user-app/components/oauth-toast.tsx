"use client";

import { useSession } from "next-auth/react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";
import { toast } from "sonner";

const OAUTH_PARAM = "from_oauth";

export function OAuthToast() {
  const { status } = useSession();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const shown = useRef(false);

  useEffect(() => {
    if (status !== "authenticated") return;
    const fromOAuth = searchParams.get(OAUTH_PARAM);
    if (!fromOAuth || shown.current) return;

    shown.current = true;
    toast.success("Signed in with Google!");
    const next = new URLSearchParams(searchParams);
    next.delete(OAUTH_PARAM);
    const query = next.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }, [status, searchParams, pathname, router]);

  return null;
}
