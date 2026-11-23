import { useCallback, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { InsightsAchievement } from '../types';

const STORAGE_PREFIX = 'insights.seenAchievements.v1:';

/**
 * Finds achievements unlocked since the user last opened insights. The first
 * visit only records what is already unlocked, so nobody gets a pile of
 * celebrations for old milestones.
 */
export function useNewAchievements(
  achievements: InsightsAchievement[] | undefined,
  accountKey: string | undefined,
) {
  const [fresh, setFresh] = useState<InsightsAchievement[]>([]);

  useEffect(() => {
    if (!achievements || !accountKey) {
      return;
    }
    let cancelled = false;
    const storageKey = STORAGE_PREFIX + accountKey;
    const unlocked = achievements.filter((achievement) => achievement.achieved);

    void (async () => {
      try {
        const raw = await AsyncStorage.getItem(storageKey);
        if (raw == null) {
          await AsyncStorage.setItem(storageKey, JSON.stringify(unlocked.map((a) => a.id)));
          return;
        }
        const seen = new Set<string>(JSON.parse(raw) as string[]);
        const newlyUnlocked = unlocked.filter((achievement) => !seen.has(achievement.id));
        if (!cancelled && newlyUnlocked.length > 0) {
          setFresh(newlyUnlocked);
        }
      } catch {
        // Storage unavailable: skip the celebration rather than risk repeating it.
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [achievements, accountKey]);

  const dismiss = useCallback(() => {
    const ids = (achievements ?? []).filter((a) => a.achieved).map((a) => a.id);
    setFresh([]);
    if (accountKey) {
      void AsyncStorage.setItem(STORAGE_PREFIX + accountKey, JSON.stringify(ids)).catch(
        () => undefined,
      );
    }
  }, [achievements, accountKey]);

  return { fresh, dismiss };
}
