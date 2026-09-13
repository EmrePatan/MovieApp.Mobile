export function isContentInAnyWatchlist(
  membership: Record<string, boolean>,
): boolean {
  return Object.values(membership).some(Boolean);
}
