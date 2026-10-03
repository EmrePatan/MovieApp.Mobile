import { layout } from '@/theme/layout';
import { spacing } from '@/theme/spacing';
import {
  DISCOVER_HUB_RAIL_GAP,
  DISCOVER_HUB_RAIL_VISIBLE_COLUMNS,
  resolveDiscoverHubRailTileSize,
} from '@/features/discover/discover-hub-rail-tile';

describe('resolveDiscoverHubRailTileSize', () => {
  it('fits three portrait tiles between discover gutters', () => {
    const width = 390;
    const { width: tileWidth, height: tileHeight } = resolveDiscoverHubRailTileSize(width);
    const innerWidth = Math.min(width, layout.maxContentWidth) - spacing.lg * 2;
    const expectedWidth =
      (innerWidth - DISCOVER_HUB_RAIL_GAP * (DISCOVER_HUB_RAIL_VISIBLE_COLUMNS - 1)) /
      DISCOVER_HUB_RAIL_VISIBLE_COLUMNS;

    expect(tileWidth).toBe(expectedWidth);
    expect(tileHeight).toBe(tileWidth / layout.posterAspectRatio);
    expect(
      tileWidth * DISCOVER_HUB_RAIL_VISIBLE_COLUMNS +
        DISCOVER_HUB_RAIL_GAP * (DISCOVER_HUB_RAIL_VISIBLE_COLUMNS - 1),
    ).toBeCloseTo(innerWidth, 5);
  });
});
