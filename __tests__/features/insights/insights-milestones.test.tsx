import { render, screen } from '@testing-library/react-native';
import { AchievementsShowcase } from '@/features/achievements/components/AchievementsShowcase';
import {
  computeLevel,
  groupAchievements,
  nextUp,
  recentUnlocks,
  totalPoints,
} from '@/features/achievements/achievement-model';
import type { InsightsAchievement } from '@/features/insights/types';
import { insightsV3Fixture } from '@/features/insights/utils/insights-fixtures';

function achievement(
  id: string,
  category: string,
  tier: number,
  target: number,
  current: number,
  achievedAt: string | null = null,
): InsightsAchievement {
  return {
    id,
    category,
    title: id,
    tier,
    targetValue: target,
    currentValue: current,
    achieved: current >= target,
    achievedAt: current >= target ? achievedAt : null,
  };
}

describe('achievement model', () => {
  const list = [
    achievement('movies-1', 'movies', 1, 1, 60, '2026-01-01T00:00:00Z'),
    achievement('movies-10', 'movies', 2, 10, 60, '2026-02-01T00:00:00Z'),
    achievement('movies-50', 'movies', 3, 50, 60, '2026-03-01T00:00:00Z'),
    achievement('movies-100', 'movies', 4, 100, 60),
    achievement('streak-3', 'streak', 1, 3, 2),
    achievement('streak-7', 'streak', 2, 7, 2),
  ];

  it('groups tiers into ladders with shared progress', () => {
    const [movies, streak] = groupAchievements(list);

    expect(movies.category).toBe('movies');
    expect(movies.unlockedCount).toBe(3);
    expect(movies.topTier).toBe(3);
    expect(movies.next?.target).toBe(100);
    expect(movies.progress).toBeCloseTo(10 / 50);
    expect(streak.category).toBe('streak');
    expect(streak.topTier).toBe(0);
    expect(streak.progress).toBeCloseTo(2 / 3);
  });

  it('turns tier points into a level', () => {
    const families = groupAchievements(list);

    expect(totalPoints(families)).toBe(1 + 2 + 3);
    expect(computeLevel(6)).toMatchObject({ level: 2, pointsToNext: 4 });
    expect(computeLevel(0).level).toBe(1);
    expect(computeLevel(41)).toMatchObject({ level: 6, pointsToNext: 14 });
    expect(computeLevel(120)).toMatchObject({ level: 10, ceiling: null, progress: 1 });
  });

  it('ranks next-up by closeness and lists recent unlocks newest first', () => {
    const families = groupAchievements(list);

    expect(nextUp(families, 1)[0].category).toBe('streak');
    expect(recentUnlocks(families, 2).map((item) => item.tier.id)).toEqual([
      'movies-50',
      'movies-10',
    ]);
  });

  it('infers tiers by target order when an older server sends none', () => {
    const [family] = groupAchievements([
      { ...achievement('a', 'movies', 1, 10, 3), tier: undefined },
      { ...achievement('b', 'movies', 1, 1, 3), tier: undefined },
    ]);

    expect(family.tiers.map((tier) => tier.tier)).toEqual([1, 2]);
  });
});

describe('AchievementsShowcase', () => {
  it('shows level, next goals and a way into the full list', () => {
    render(<AchievementsShowcase achievements={insightsV3Fixture.achievements} />);

    expect(screen.getByText('Achievements')).toBeTruthy();
    expect(screen.getByText('Next up')).toBeTruthy();
    expect(screen.getByText('Film Buff')).toBeTruthy();
    expect(screen.getByTestId('achievements-view-all')).toBeTruthy();
    expect(screen.getByTestId('insights-achievements-row')).toBeTruthy();
  });

  it('renders nothing without achievements', () => {
    render(<AchievementsShowcase achievements={[]} />);

    expect(screen.queryByTestId('insights-achievements-row')).toBeNull();
  });
});
