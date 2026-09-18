import type { InsightsV3Response } from '../types';

export const insightsV3Fixture: InsightsV3Response = {
  meta: {
    memberSinceUtc: '2025-10-20T00:00:00Z',
    generatedAtUtc: '2026-09-17T12:00:00Z',
    timeZone: 'UTC',
    year: 2026,
  },
  movieDna: {
    identityTitle: 'Sci-Fi Storyteller',
    identityCodes: ['top_genre', 'series_first'],
    labels: [
      { code: 'top_genre', category: 'genre', label: 'Sci-Fi explorer' },
      { code: 'series_first', category: 'format', label: 'Series-first viewer' },
    ],
    topGenres: [
      { genreId: '1', name: 'Sci-Fi', weight: 0.34, sharePercent: 34 },
      { genreId: '2', name: 'Drama', weight: 0.22, sharePercent: 22 },
      { genreId: '3', name: 'Thriller', weight: 0.18, sharePercent: 18 },
    ],
    watchingMix: {
      movieTitleCount: 28,
      seriesTitleCount: 9,
      movieSharePercent: 76,
      seriesSharePercent: 24,
    },
  },
  yourYear: {
    months: Array.from({ length: 12 }, (_, index) => ({
      year: 2026,
      month: index + 1,
      movies: index % 3 === 0 ? 2 : 0,
      episodes: index % 2 === 0 ? 4 : 1,
      total: (index % 3 === 0 ? 2 : 0) + (index % 2 === 0 ? 4 : 1),
    })),
    activeDays: 42,
    peakMonth: { year: 2026, month: 6, movies: 4, episodes: 8, total: 12 },
    favoriteWeekday: 6,
  },
  yourTaste: {
    genres: [
      { genreId: '1', name: 'Sci-Fi', weight: 0.34, sharePercent: 34 },
      { genreId: '2', name: 'Drama', weight: 0.22, sharePercent: 22 },
      { genreId: '3', name: 'Thriller', weight: 0.18, sharePercent: 18 },
    ],
    risingGenre: {
      genreId: '4',
      name: 'Horror',
      currentYearSharePercent: 14,
      previousYearSharePercent: 6,
      shareDeltaPercent: 8,
    },
  },
  timeInStories: {
    totalMinutes: 10890,
    movieMinutes: 4200,
    episodeMinutes: 6690,
    yearMinutes: 1800,
    runtimeCoveragePercent: 75,
  },
  yourRatings: {
    count: 26,
    averageStars: 4.1,
    distribution: [
      { stars: 5, count: 10 },
      { stars: 4, count: 9 },
      { stars: 3, count: 5 },
      { stars: 2, count: 2 },
    ],
    highestRatedGenre: {
      genreId: '1',
      name: 'Sci-Fi',
      ratingCount: 8,
      averageStars: 4.6,
    },
    lowestRatedGenre: {
      genreId: '5',
      name: 'Comedy',
      ratingCount: 4,
      averageStars: 3.2,
    },
  },
  yourEra: {
    decades: [
      { bucket: '2020s', count: 40, percent: 44 },
      { bucket: '2010s', count: 28, percent: 31 },
      { bucket: '2000s', count: 12, percent: 13 },
    ],
    favoriteDecade: '2020s',
    unknownCount: 3,
    oldestTitle: {
      contentType: 'movie',
      contentId: 'movie-1',
      title: 'The Godfather',
      year: 1972,
      posterPath: '/poster.jpg',
    },
  },
  yourRecords: {
    longestStreakDays: 9,
    bestMovieWeek: { year: 2026, week: 12, count: 5 },
    bestEpisodeWeek: { year: 2026, week: 28, count: 14 },
    highestRatingStars: 5,
  },
  achievements: [
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
};

export const emptyInsightsV3Fixture: InsightsV3Response = {
  ...insightsV3Fixture,
  movieDna: {
    identityTitle: 'Still discovering',
    identityCodes: [],
    labels: [],
    topGenres: [],
    watchingMix: {
      movieTitleCount: 0,
      seriesTitleCount: 0,
      movieSharePercent: 0,
      seriesSharePercent: 0,
    },
  },
  yourYear: {
    months: Array.from({ length: 12 }, (_, index) => ({
      year: 2026,
      month: index + 1,
      movies: 0,
      episodes: 0,
      total: 0,
    })),
    activeDays: 0,
    peakMonth: null,
    favoriteWeekday: null,
  },
  yourTaste: {
    genres: [],
    risingGenre: null,
  },
  timeInStories: {
    totalMinutes: 0,
    movieMinutes: 0,
    episodeMinutes: 0,
    yearMinutes: 0,
    runtimeCoveragePercent: 0,
  },
  yourRatings: {
    count: 0,
    averageStars: null,
    distribution: [],
    highestRatedGenre: null,
    lowestRatedGenre: null,
  },
  yourEra: {
    decades: [],
    favoriteDecade: null,
    unknownCount: 0,
    oldestTitle: null,
  },
  yourRecords: {
    longestStreakDays: null,
    bestMovieWeek: null,
    bestEpisodeWeek: null,
    highestRatingStars: null,
  },
  achievements: [],
};
