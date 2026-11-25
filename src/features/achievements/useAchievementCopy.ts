import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { FAMILY_ORDER } from './achievement-model';

const KNOWN = new Set<string>(FAMILY_ORDER);

/** Localised names for families, tiers and levels, with a safe fallback for unknown categories. */
export function useAchievementCopy() {
  const { t } = useTranslation();

  const familyName = useCallback(
    (category: string) =>
      KNOWN.has(category)
        ? t(`achievements.families.${category}.name`)
        : category.charAt(0).toUpperCase() + category.slice(1),
    [t],
  );

  const goal = useCallback(
    (category: string, count: number) =>
      KNOWN.has(category)
        ? t(`achievements.families.${category}.goal`, { count })
        : `${count.toLocaleString()}`,
    [t],
  );

  const tierName = useCallback((tier: number) => t(`achievements.tiers.${tier}`), [t]);
  const levelName = useCallback((level: number) => t(`achievements.levels.${level}`), [t]);

  return { t, familyName, goal, tierName, levelName };
}
