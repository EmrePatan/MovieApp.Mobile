import {
  buildSelectableYears,
  formatActiveYearDayPercent,
  formatAchievementBadgeNumber,
  formatAchievementCategoryLabel,
  formatDecadeLabel,
  formatDominantGenreHeadline,
  getAchievementIconName,
  formatEstimatedDuration,
  formatEquivalentDays,
  formatGenreGravitation,
  formatHoursFromMinutes,
  formatMovieDnaDisplayTitle,
  formatMovieDnaEditorialLine,
  formatWatchTimeBreakdown,
  formatWatchingMixLine,
  formatWeekdayName,
} from '@/features/insights/utils/insights-format';
import {
  emptyInsightsV3Fixture,
  insightsV3Fixture,
} from '@/features/insights/utils/insights-fixtures';
import type { InsightsV3MovieDna } from '@/features/insights/types';

describe('insights format helpers', () => {
  it('formats estimated duration in hours and days', () => {
    expect(formatEstimatedDuration(45)).toBe('45m');
    expect(formatEstimatedDuration(755)).toBe('12h 35m');
    expect(formatEstimatedDuration(4800)).toBe('3d 8h');
  });

  it('formats hours and equivalent days from minutes', () => {
    expect(formatHoursFromMinutes(90)).toBe('1.5');
    expect(formatHoursFromMinutes(600)).toBe('10');
    expect(formatEquivalentDays(1440)).toBe('1 day');
    expect(formatEquivalentDays(2880)).toBe('2 days');
  });

  it('formats weekday names', () => {
    expect(formatWeekdayName(6)).toBe('Saturday');
    expect(formatWeekdayName(null)).toBe('—');
  });

  it('builds selectable years from member since through current year', () => {
    expect(buildSelectableYears('2024-06-01T00:00:00Z', 2026)).toEqual([2026, 2025, 2024]);
  });

  it('maps Movie DNA identity signals to cinematic display titles', () => {
    expect(formatMovieDnaDisplayTitle(insightsV3Fixture.movieDna)).toBe('The Sci-Fi Series Devotee');
    expect(formatMovieDnaDisplayTitle(insightsV3Fixture.movieDna)).toBe(
      formatMovieDnaDisplayTitle(insightsV3Fixture.movieDna),
    );
    expect(formatMovieDnaDisplayTitle(insightsV3Fixture.movieDna)).not.toContain('Series-first');
    expect(formatMovieDnaDisplayTitle(insightsV3Fixture.movieDna)).not.toContain(
      insightsV3Fixture.movieDna.identityTitle,
    );

    const movieFirst: InsightsV3MovieDna = {
      ...insightsV3Fixture.movieDna,
      identityCodes: ['top_genre', 'movie_first'],
      identityTitle: 'Drama Movie-first',
      labels: [
        { code: 'top_genre', category: 'genre', label: 'Drama' },
        { code: 'movie_first', category: 'format', label: 'Movie-first' },
      ],
      topGenres: [{ genreId: '2', name: 'Drama', weight: 0.4, sharePercent: 40 }],
    };
    expect(formatMovieDnaDisplayTitle(movieFirst)).toBe('The Drama Story Seeker');
    expect(formatMovieDnaDisplayTitle(movieFirst)).not.toContain('Movie-first');

    const recentReleases: InsightsV3MovieDna = {
      ...insightsV3Fixture.movieDna,
      identityCodes: ['recent_releases'],
      identityTitle: 'Recent releases',
      labels: [{ code: 'recent_releases', category: 'era', label: 'Recent releases' }],
      topGenres: [],
    };
    expect(formatMovieDnaDisplayTitle(recentReleases)).toBe('The New Release Explorer');

    const seriesOnly: InsightsV3MovieDna = {
      ...insightsV3Fixture.movieDna,
      identityCodes: ['series_first'],
      identityTitle: 'Series-first',
      labels: [{ code: 'series_first', category: 'format', label: 'Series-first' }],
      topGenres: [],
    };
    expect(formatMovieDnaDisplayTitle(seriesOnly)).toBe('The Series Devotee');

    expect(formatMovieDnaDisplayTitle(emptyInsightsV3Fixture.movieDna)).toBe('The Explorer');
  });

  it('selects a deterministic Movie DNA editorial line from identity signals', () => {
    const line = formatMovieDnaEditorialLine(insightsV3Fixture.movieDna);
    expect(line).toBe('The long arc is where your story keeps returning.');
    expect(line).not.toContain(insightsV3Fixture.movieDna.identityTitle);
    expect(line).not.toContain('gravitate');
    expect(formatMovieDnaEditorialLine(insightsV3Fixture.movieDna)).toBe(line);
  });

  it('formats watch time as year month day hour breakdown', () => {
    expect(formatWatchTimeBreakdown(20 * 60)).toBe('20h');
    expect(formatWatchTimeBreakdown(227 * 60)).toBe('9d 11h');
    expect(formatWatchTimeBreakdown((365 * 24 * 60) + (2 * 30 * 24 * 60) + (5 * 24 * 60) + (8 * 60))).toBe(
      '1y 2mo 5d 8h',
    );
    expect(formatWatchTimeBreakdown(45)).toBe('45m');
  });

  it('formats watching mix as a compact editorial line', () => {
    expect(formatWatchingMixLine(65.4, 34.6)).toBe('65% films · 35% series');
    expect(formatWatchingMixLine(76, 24)).toBe('76% films · 24% series');
  });

  it('formats genre copy and active day percent from real values', () => {
    expect(formatGenreGravitation(['Sci-Fi', 'Drama', 'Thriller'])).toBe(
      'You gravitate toward Sci-Fi, Drama and Thriller.',
    );
    expect(formatDominantGenreHeadline('Drama')).toBe('Drama dominates your library');
    expect(formatActiveYearDayPercent(42, 2026, new Date('2026-09-18T12:00:00Z'))).toBeGreaterThan(0);
    expect(formatDecadeLabel('2020s')).toBe('2020s');
    expect(formatDecadeLabel('Older')).toBe('Older');
    expect(formatAchievementBadgeNumber(1000)).toBe('1,000');
    expect(formatAchievementCategoryLabel('episodes')).toBe('Episodes');
    expect(getAchievementIconName('movies')).toBe('film-outline');
  });
});
