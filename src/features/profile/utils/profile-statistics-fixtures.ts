import type { UserStatisticsResponse } from '../types';

export function createProfileStatisticsFixture(
  overrides: Partial<UserStatisticsResponse> = {},
): UserStatisticsResponse {
  return {
    summary: {
      moviesWatched: 12,
      episodesWatched: 48,
      showsStarted: 4,
      showsCompleted: 1,
      ratingsCount: 8,
      reviewsCount: 2,
      favoritesCount: 6,
      watchlistCount: 2,
      averageStarRating: 4.1,
      ...(overrides.summary ?? {}),
    },
    activity: {
      last12Months: [
        {
          year: 2026,
          month: 3,
          movies: 2,
          episodes: 10,
          total: 12,
        },
        {
          year: 2026,
          month: 4,
          movies: 1,
          episodes: 7,
          total: 8,
        },
      ],
      mostActiveMonth: {
        year: 2026,
        month: 3,
        movies: 2,
        episodes: 10,
        total: 12,
      },
      currentMonthTotal: 8,
      previousMonthTotal: 12,
      longestStreakDays: 5,
      ...(overrides.activity ?? {}),
    },
    genres: overrides.genres ?? [
      { genreId: 'genre-1', name: 'Comedy', count: 10 },
      { genreId: 'genre-2', name: 'Sci-Fi', count: 7 },
    ],
    ratings: {
      distribution: [
        { stars: 5, count: 2 },
        { stars: 4, count: 4 },
        { stars: 3, count: 1 },
        { stars: 2, count: 1 },
        { stars: 1, count: 0 },
      ],
      mostUsedStars: 4,
      averageStarRating: 4.1,
      ...(overrides.ratings ?? {}),
    },
    watchingMix: {
      movieTitleCount: 12,
      seriesTitleCount: 4,
      ...(overrides.watchingMix ?? {}),
    },
    milestones: overrides.milestones ?? [
      {
        id: 'movies-10',
        title: '10 movies watched',
        description: 'A solid start to your catalog.',
        achievedAt: null,
      },
    ],
    insights: overrides.insights ?? ['Comedy is your top genre.'],
  };
}
