import { layout } from '@/theme/layout';
import { spacing } from '@/theme/spacing';

/** Posters sized so three fit in a discover hub rail (between screen gutters). */
export const DISCOVER_HUB_RAIL_VISIBLE_COLUMNS = 3;

export const DISCOVER_HUB_RAIL_GAP = spacing.sm;

export interface DiscoverHubRailTileSize {
  width: number;
  height: number;
}

export function resolveDiscoverHubRailTileSize(
  windowWidth: number,
): DiscoverHubRailTileSize {
  const contentWidth = Math.min(windowWidth, layout.maxContentWidth);
  const innerWidth = contentWidth - spacing.lg * 2;
  const tileWidth =
    (innerWidth - DISCOVER_HUB_RAIL_GAP * (DISCOVER_HUB_RAIL_VISIBLE_COLUMNS - 1)) /
    DISCOVER_HUB_RAIL_VISIBLE_COLUMNS;

  return {
    width: tileWidth,
    height: tileWidth / layout.posterAspectRatio,
  };
}
