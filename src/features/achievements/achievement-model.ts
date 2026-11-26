import type { MaterialCommunityIcons } from '@expo/vector-icons';
import type { InsightsAchievement } from '@/features/insights/types';

/** Display order of the achievement families. Unknown categories sort after these. */
export const FAMILY_ORDER = [
  'movies',
  'episodes',
  'ratings',
  'shows',
  'genres',
  'eras',
  'classics',
  'streak',
  'hours',
  'tenure',
] as const;

/** Points per tier: bronze → legend. A level is just the running total. */
export const TIER_POINTS = [1, 2, 3, 5, 8] as const;

/**
 * Minimum points for levels 1..10 (Viewer … Masterpiece); the full set of tiers is worth 119.
 * Early floors are steeper than before: back-filling ~50 past movies used to reach level 4 in half
 * an hour, now it lands around level 2-3 and the upper levels need time-based families.
 */
export const LEVEL_FLOORS = [0, 6, 15, 26, 38, 52, 67, 82, 97, 112] as const;

/** Each family owns a hue: light (glyph top) → base (accent) → deep (glyph bottom / disk tint). */
export interface FamilyHue {
  light: string;
  base: string;
  deep: string;
}

const GOLD: FamilyHue = { light: '#F6E2A8', base: '#D9B25A', deep: '#7A5A18' };

type IconName = keyof typeof MaterialCommunityIcons.glyphMap;

const FAMILY_ICONS: Record<string, IconName> = {
  movies: 'movie-open',
  episodes: 'television-classic',
  ratings: 'star',
  shows: 'check-decagram',
  genres: 'compass-rose',
  eras: 'timer-sand',
  classics: 'movie-roll',
  streak: 'fire',
  hours: 'clock-time-four',
  tenure: 'heart',
};

export function getFamilyIcon(category: string): IconName {
  return FAMILY_ICONS[category] ?? 'crown';
}

/** One champagne-gold hue for every family, so the set stays on theme. */
export function getFamilyHue(_category: string): FamilyHue {
  return GOLD;
}

/**
 * The tier is told by the rim finish alone:
 * 1 smoked bronze · 2 pale silver · 3 champagne foil · 4 foil + inlay + glow · 5 white-gold foil + sparkles.
 */
export interface RimFinish {
  /** Rim gradient: highlight → body → shadow. */
  stops: readonly [string, string, string];
  /** Optional inlay line drawn inside the rim (tier 4+). */
  inlay: boolean;
}

const RIMS: readonly RimFinish[] = [
  { stops: ['#B79A6B', '#7A6139', '#30261A'], inlay: false },
  { stops: ['#F4F5F8', '#A9AFBB', '#5B6270'], inlay: false },
  { stops: ['#FFF3C9', '#D9B25A', '#7A5A18'], inlay: false },
  { stops: ['#FFF3C9', '#D9B25A', '#7A5A18'], inlay: true },
  { stops: ['#FFFFFF', '#F6DFA0', '#C9A04A'], inlay: true },
];

export function getRimFinish(tier: number, _hue?: FamilyHue): RimFinish {
  return RIMS[Math.max(1, Math.min(RIMS.length, tier)) - 1];
}

export const LOCKED_LOOK = {
  rim: ['#4A4A56', '#33333C', '#22222A'] as const,
  disk: ['#20202A', '#111116'] as const,
  glyph: '#5E5E6A',
};

export interface AchievementTier {
  id: string;
  /** 1-based rung of the ladder. */
  tier: number;
  target: number;
  achieved: boolean;
  achievedAt: string | null;
}

export interface AchievementFamily {
  category: string;
  currentValue: number;
  tiers: AchievementTier[];
  unlockedCount: number;
  /** Highest unlocked tier (0 when none). */
  topTier: number;
  /** First locked tier, or null when the ladder is complete. */
  next: AchievementTier | null;
  /** 0..1 progress toward `next` (1 when complete). */
  progress: number;
  points: number;
}

function familyRank(category: string) {
  const index = (FAMILY_ORDER as readonly string[]).indexOf(category);
  return index === -1 ? FAMILY_ORDER.length : index;
}

/** Groups the flat API list into ladders. Older servers send no `tier`: it is inferred by target order. */
export function groupAchievements(achievements: InsightsAchievement[]): AchievementFamily[] {
  const byCategory = new Map<string, InsightsAchievement[]>();
  for (const achievement of achievements) {
    const list = byCategory.get(achievement.category) ?? [];
    list.push(achievement);
    byCategory.set(achievement.category, list);
  }

  const families: AchievementFamily[] = [];
  for (const [category, list] of byCategory) {
    const sorted = [...list].sort((a, b) => a.targetValue - b.targetValue);
    const tiers: AchievementTier[] = sorted.map((item, index) => ({
      id: item.id,
      tier: item.tier ?? index + 1,
      target: item.targetValue,
      achieved: item.achieved,
      achievedAt: item.achievedAt,
    }));
    const currentValue = sorted[0]?.currentValue ?? 0;
    const unlocked = tiers.filter((tier) => tier.achieved);
    const next = tiers.find((tier) => !tier.achieved) ?? null;
    const previousTarget = unlocked.length > 0 ? unlocked[unlocked.length - 1].target : 0;
    const progress = next
      ? Math.max(
          0,
          Math.min(1, (currentValue - previousTarget) / Math.max(1, next.target - previousTarget)),
        )
      : 1;
    families.push({
      category,
      currentValue,
      tiers,
      unlockedCount: unlocked.length,
      topTier: unlocked.length > 0 ? unlocked[unlocked.length - 1].tier : 0,
      next,
      progress,
      points: unlocked.reduce((sum, tier) => sum + (TIER_POINTS[tier.tier - 1] ?? 1), 0),
    });
  }

  return families.sort((a, b) => familyRank(a.category) - familyRank(b.category));
}

export interface AchievementLevel {
  /** 1-based level. */
  level: number;
  points: number;
  floor: number;
  /** Points needed for the next level, null at the top. */
  ceiling: number | null;
  /** 0..1 progress inside the current level. */
  progress: number;
  pointsToNext: number;
}

export function computeLevel(points: number): AchievementLevel {
  let level = 1;
  for (let index = 0; index < LEVEL_FLOORS.length; index += 1) {
    if (points >= LEVEL_FLOORS[index]) level = index + 1;
  }
  const floor = LEVEL_FLOORS[level - 1];
  const ceiling = level < LEVEL_FLOORS.length ? LEVEL_FLOORS[level] : null;
  const progress = ceiling == null ? 1 : (points - floor) / (ceiling - floor);
  return {
    level,
    points,
    floor,
    ceiling,
    progress: Math.max(0, Math.min(1, progress)),
    pointsToNext: ceiling == null ? 0 : ceiling - points,
  };
}

export function totalPoints(families: AchievementFamily[]) {
  return families.reduce((sum, family) => sum + family.points, 0);
}

/** Locked tiers ordered by how close the user is: the "next up" shortlist. */
export function nextUp(families: AchievementFamily[], limit: number): AchievementFamily[] {
  return families
    .filter((family) => family.next != null)
    .sort((a, b) => b.progress - a.progress)
    .slice(0, limit);
}

export interface RecentUnlock {
  category: string;
  tier: AchievementTier;
}

/** Newest unlocks first; only tiers with a known date, so nothing is fabricated. */
export function recentUnlocks(families: AchievementFamily[], limit: number): RecentUnlock[] {
  return families
    .flatMap((family) =>
      family.tiers
        .filter((tier) => tier.achieved && tier.achievedAt)
        .map((tier) => ({ category: family.category, tier })),
    )
    .sort(
      (a, b) =>
        new Date(b.tier.achievedAt as string).getTime() -
        new Date(a.tier.achievedAt as string).getTime(),
    )
    .slice(0, limit);
}
