/** Keşfet rail order. General trending is not part of this catalog. */
export const DISCOVER_RAIL_CATALOG = [
  'platforms',
  'genres',
  'world-cinema',
  'hidden-gems',
  'popular',
  'new-releases',
  'top-rated',
] as const;

export type DiscoverRailSlug = (typeof DISCOVER_RAIL_CATALOG)[number];
