import type {
  InsightsActivityDay,
  InsightsAnalyticsResponse,
  InsightsSummaryResponse,
} from '../types';

function buildActivityDays(): InsightsActivityDay[] {
  const days: InsightsActivityDay[] = [];
  const start = new Date('2025-09-20T00:00:00Z');

  for (let index = 0; index < 364; index += 1) {
    const date = new Date(start);
    date.setUTCDate(start.getUTCDate() + index);
    const isoDate = date.toISOString().slice(0, 10);
    const isBeforeJoin = index < 30;
    const isActive = !isBeforeJoin && index % 11 === 0;

    days.push({
      date: isoDate,
      movies: isActive ? 1 : 0,
      episodes: isActive ? 2 : 0,
      total: isActive ? 3 : 0,
      state: (isBeforeJoin ? 'BeforeJoin' : isActive ? 'Active' : 'NoActivity') as InsightsActivityDay['state'],
      intensityBucket: isActive ? 2 : 0,
    });
  }

  return days;
}

export const insightsSummaryFixture: InsightsSummaryResponse = {
  memberSince: '2025-10-20T00:00:00Z',
  movieDna: [
    { code: 'top_genre', category: 'genre', label: 'Sci-Fi explorer' },
    { code: 'series_first', category: 'format', label: 'Series-first viewer' },
    { code: 'recent_releases', category: 'era', label: 'New release curious' },
  ],
  summary: {
    moviesWatched: 42,
    episodesWatched: 118,
    showsStarted: 9,
    ratingsCount: 26,
    averageStarRating: 4.1,
  },
  watchingMix: {
    movieTitleCount: 28,
    seriesTitleCount: 9,
  },
  generatedAtUtc: '2026-09-17T12:00:00Z',
};

export const insightsAnalyticsFixture: InsightsAnalyticsResponse = {
  activity: {
    days: buildActivityDays(),
    summary: {
      totalActiveDays: 24,
      mostActiveWeekday: 6,
      longestStreakDays: 4,
      currentWeekTotal: 6,
      previousWeekTotal: 3,
    },
  },
  taste: {
    genres: [
      { genreId: '1', name: 'Sci-Fi', weight: 0.34, sharePercent: 34 },
      { genreId: '2', name: 'Drama', weight: 0.22, sharePercent: 22 },
      { genreId: '3', name: 'Thriller', weight: 0.18, sharePercent: 18 },
    ],
  },
  eras: {
    buckets: [
      { bucket: '2020s', count: 40, percent: 44 },
      { bucket: '2010s', count: 28, percent: 31 },
      { bucket: '2000s', count: 12, percent: 13 },
      { bucket: '1990s', count: 6, percent: 7 },
      { bucket: 'Older', count: 5, percent: 5 },
    ],
    unknownCount: 3,
  },
  estimatedTimeWatched: {
    totalEstimatedMinutes: 755,
    movieEstimatedMinutes: 420,
    episodeEstimatedMinutes: 335,
    knownRuntimeItemCount: 120,
    totalWatchedItemCount: 160,
    coveragePercent: 75,
    currentYearEstimatedMinutes: 180,
  },
  ratings: {
    ratingCount: 26,
    averageStarRating: 4.1,
    distribution: [
      { stars: 5, count: 10 },
      { stars: 4, count: 9 },
      { stars: 3, count: 5 },
      { stars: 2, count: 2 },
    ],
    mostUsedStars: 5,
  },
  milestones: [
    {
      id: 'first-movie',
      category: 'movies',
      title: 'First movie watched',
      currentValue: 1,
      targetValue: 1,
      achieved: true,
      achievedAt: '2025-11-01T10:00:00Z',
    },
    {
      id: 'movies-10',
      category: 'movies',
      title: '10 movies watched',
      currentValue: 7,
      targetValue: 10,
      achieved: false,
      achievedAt: null,
    },
  ],
  generatedAtUtc: '2026-09-17T12:00:00Z',
};

export const emptyInsightsSummaryFixture: InsightsSummaryResponse = {
  memberSince: '2026-09-01T00:00:00Z',
  movieDna: [],
  summary: {
    moviesWatched: 0,
    episodesWatched: 0,
    showsStarted: 0,
    ratingsCount: 0,
    averageStarRating: null,
  },
  watchingMix: {
    movieTitleCount: 0,
    seriesTitleCount: 0,
  },
  generatedAtUtc: '2026-09-17T12:00:00Z',
};
