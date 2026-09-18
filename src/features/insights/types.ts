export interface InsightsMovieDnaLabel {
  code: string;
  category: string;
  label: string;
}

export interface InsightsTasteGenre {
  genreId: string;
  name: string;
  weight: number;
  sharePercent: number;
}

export interface InsightsWatchingMix {
  movieTitleCount: number;
  seriesTitleCount: number;
  movieSharePercent: number;
  seriesSharePercent: number;
}

export interface InsightsV3MovieDna {
  identityTitle: string;
  identityCodes: string[];
  labels: InsightsMovieDnaLabel[];
  topGenres: InsightsTasteGenre[];
  watchingMix: InsightsWatchingMix;
}

export interface InsightsV3MonthlyActivity {
  year: number;
  month: number;
  movies: number;
  episodes: number;
  total: number;
}

export interface InsightsV3MonthHighlight {
  year: number;
  month: number;
  movies: number;
  episodes: number;
  total: number;
}

export interface InsightsV3YourYear {
  months: InsightsV3MonthlyActivity[];
  activeDays: number;
  peakMonth: InsightsV3MonthHighlight | null;
  favoriteWeekday: number | string | null;
}

export interface InsightsV3RisingGenre {
  genreId: string;
  name: string;
  currentYearSharePercent: number;
  previousYearSharePercent: number;
  shareDeltaPercent: number;
}

export interface InsightsV3Taste {
  genres: InsightsTasteGenre[];
  risingGenre: InsightsV3RisingGenre | null;
}

export interface InsightsV3TimeInStories {
  totalMinutes: number;
  movieMinutes: number;
  episodeMinutes: number;
  yearMinutes: number;
  runtimeCoveragePercent: number;
}

export interface InsightsRatingsDistributionItem {
  stars: number;
  count: number;
}

export interface InsightsV3GenreRating {
  genreId: string;
  name: string;
  ratingCount: number;
  averageStars: number;
}

export interface InsightsV3Ratings {
  count: number;
  averageStars: number | null;
  distribution: InsightsRatingsDistributionItem[];
  highestRatedGenre: InsightsV3GenreRating | null;
  lowestRatedGenre: InsightsV3GenreRating | null;
}

export interface InsightsEraBucket {
  bucket: string;
  count: number;
  percent: number | null;
}

export interface InsightsV3OldestTitle {
  contentType: string;
  contentId: string;
  title: string;
  year: number | null;
  posterPath: string | null;
}

export interface InsightsV3Era {
  decades: InsightsEraBucket[];
  favoriteDecade: string | null;
  unknownCount: number;
  oldestTitle: InsightsV3OldestTitle | null;
}

export interface InsightsV3WeeklyPeak {
  year: number;
  week: number;
  count: number;
}

export interface InsightsV3Records {
  longestStreakDays: number | null;
  bestMovieWeek: InsightsV3WeeklyPeak | null;
  bestEpisodeWeek: InsightsV3WeeklyPeak | null;
  highestRatingStars: number | null;
}

export interface InsightsAchievement {
  id: string;
  category: string;
  title: string;
  currentValue: number;
  targetValue: number;
  achieved: boolean;
  achievedAt: string | null;
}

export interface InsightsV3Meta {
  memberSinceUtc: string;
  generatedAtUtc: string;
  timeZone: string;
  year: number;
}

export interface InsightsV3Response {
  meta: InsightsV3Meta;
  movieDna: InsightsV3MovieDna;
  yourYear: InsightsV3YourYear;
  yourTaste: InsightsV3Taste;
  timeInStories: InsightsV3TimeInStories;
  yourRatings: InsightsV3Ratings;
  yourEra: InsightsV3Era;
  yourRecords: InsightsV3Records;
  achievements: InsightsAchievement[];
}
