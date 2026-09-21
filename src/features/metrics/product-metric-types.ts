export const PRODUCT_METRICS = {
  discoverOpened: 'discover_opened',
  advancedDiscoverOpened: 'advanced_discover_opened',
  streamingServicesOpened: 'streaming_services_opened',
  nowInTheatersOpened: 'now_in_theaters_opened',
  onTvThisWeekOpened: 'on_tv_this_week_opened',
  worldCinemaOpened: 'world_cinema_opened',
  contentDetailOpened: 'content_detail_opened',
  pickSomethingOpened: 'pick_something_opened',
  pickSomethingGenerated: 'pick_something_generated',
  aiRecommendationsOpened: 'ai_recommendations_opened',
  aiRecommendationsGenerated: 'ai_recommendations_generated',
  searchSubmitted: 'search_submitted',
  watchlistCreated: 'watchlist_created',
  reviewCreated: 'review_created',
  ratingCreated: 'rating_created',
  libraryOpened: 'library_opened',
  libraryFilterSelected: 'library_filter_selected',
  insightsOpened: 'insights_opened',
} as const;

export type ProductMetricName = (typeof PRODUCT_METRICS)[keyof typeof PRODUCT_METRICS];
