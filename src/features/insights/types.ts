export type InsightsActivityDayState = 'Active' | 'NoActivity' | 'BeforeJoin' | 0 | 1 | 2;

export interface InsightsMovieDnaLabel {
  code: string;
  category: string;
  label: string;
}

export interface InsightsSummaryStats {
  moviesWatched: number;
  episodesWatched: number;
  showsStarted: number;
  ratingsCount: number;
  averageStarRating: number | null;
}

export interface InsightsWatchingMix {
  movieTitleCount: number;
  seriesTitleCount: number;
}

export interface InsightsSummaryResponse {
  memberSince: string;
  movieDna: InsightsMovieDnaLabel[];
  summary: InsightsSummaryStats;
  watchingMix: InsightsWatchingMix;
  generatedAtUtc: string;
}

export interface InsightsActivityDay {
  date: string;
  movies: number;
  episodes: number;
  total: number;
  state: InsightsActivityDayState;
  intensityBucket: number;
}

export interface InsightsActivitySummary {
  totalActiveDays: number;
  mostActiveWeekday: number | null;
  longestStreakDays: number | null;
  currentWeekTotal: number;
  previousWeekTotal: number;
}

export interface InsightsActivity {
  days: InsightsActivityDay[];
  summary: InsightsActivitySummary;
}

export interface InsightsTasteGenre {
  genreId: string;
  name: string;
  weight: number;
  sharePercent: number;
}

export interface InsightsTaste {
  genres: InsightsTasteGenre[];
}

export interface InsightsEraBucket {
  bucket: string;
  count: number;
  percent: number | null;
}

export interface InsightsEras {
  buckets: InsightsEraBucket[];
  unknownCount: number;
}

export interface InsightsEstimatedTimeWatched {
  totalEstimatedMinutes: number;
  movieEstimatedMinutes: number;
  episodeEstimatedMinutes: number;
  knownRuntimeItemCount: number;
  totalWatchedItemCount: number;
  coveragePercent: number;
  currentYearEstimatedMinutes: number | null;
}

export interface InsightsRatingsDistributionItem {
  stars: number;
  count: number;
}

export interface InsightsRatingsAnalytics {
  ratingCount: number;
  averageStarRating: number | null;
  distribution: InsightsRatingsDistributionItem[];
  mostUsedStars: number | null;
}

export interface InsightsMilestone {
  id: string;
  category: string;
  title: string;
  currentValue: number;
  targetValue: number;
  achieved: boolean;
  achievedAt: string | null;
}

export interface InsightsAnalyticsResponse {
  activity: InsightsActivity;
  taste: InsightsTaste;
  eras: InsightsEras;
  estimatedTimeWatched: InsightsEstimatedTimeWatched;
  ratings: InsightsRatingsAnalytics;
  milestones: InsightsMilestone[];
  generatedAtUtc: string;
}
