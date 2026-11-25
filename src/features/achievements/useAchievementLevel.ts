import { useMemo } from 'react';
import { useInsightsV3 } from '@/features/insights/hooks/useInsightsV3';
import {
  computeLevel,
  groupAchievements,
  totalPoints,
  type AchievementLevel,
} from './achievement-model';

/** The signed-in user's achievement level, or null until insights have loaded. */
export function useAchievementLevel(): AchievementLevel | null {
  const achievements = useInsightsV3().data?.achievements;
  return useMemo(() => {
    if (!achievements || achievements.length === 0) return null;
    return computeLevel(totalPoints(groupAchievements(achievements)));
  }, [achievements]);
}
