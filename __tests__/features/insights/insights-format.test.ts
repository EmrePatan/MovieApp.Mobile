import {
  buildSelectableYears,
  formatActiveYearDayPercent,
  formatDominantGenreHeadline,
  formatEstimatedDuration,
  formatEquivalentDays,
  formatGenreGravitation,
  formatHoursFromMinutes,
  formatWeekdayName,
} from '@/features/insights/utils/insights-format';

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

  it('formats genre copy and active day percent from real values', () => {
    expect(formatGenreGravitation(['Sci-Fi', 'Drama', 'Thriller'])).toBe(
      'You gravitate toward Sci-Fi, Drama and Thriller.',
    );
    expect(formatDominantGenreHeadline('Drama')).toBe('Drama dominates your library');
    expect(formatActiveYearDayPercent(42, 2026, new Date('2026-09-18T12:00:00Z'))).toBeGreaterThan(0);
  });
});
