import { colors } from '@/theme/colors';
import type { InsightsActivityDayState } from '../types';
import { normalizeActivityDayState } from './insights-format';

export function getHeatmapCellColor(
  state: InsightsActivityDayState,
  intensityBucket: number,
): string {
  const normalized = normalizeActivityDayState(state);

  if (normalized === 'beforeJoin') {
    return colors.surface;
  }

  if (normalized === 'noActivity') {
    return colors.progressTrack;
  }

  switch (intensityBucket) {
    case 1:
      return 'rgba(196, 163, 90, 0.22)';
    case 2:
      return 'rgba(196, 163, 90, 0.38)';
    case 3:
      return 'rgba(196, 163, 90, 0.56)';
    case 4:
      return colors.accent;
    default:
      return colors.progressTrack;
  }
}

export function getHeatmapCellBorderColor(state: InsightsActivityDayState): string | undefined {
  if (normalizeActivityDayState(state) === 'beforeJoin') {
    return colors.borderSubtle;
  }

  return undefined;
}
