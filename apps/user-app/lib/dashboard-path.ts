/**
 * Dashboard path for a given role. Used to redirect logged-in users.
 */
export function getDashboardPath(role?: string | null): string {
  return role === "merchant" ? "/merchant" : "/user";
}
