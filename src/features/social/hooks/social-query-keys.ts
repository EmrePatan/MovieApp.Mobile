export const socialQueryKeys = {
  all: ['social'] as const,
  profile: (userId: string) => ['social', 'profile', userId] as const,
  profileStatistics: (userId: string) => ['social', 'profile-statistics', 'v2', userId] as const,
  profileActivities: (userId: string) => ['social', 'profile-activities', userId] as const,
  profileWatchlists: (userId: string) => ['social', 'profile-watchlists', userId] as const,
  profileWatchlistItems: (userId: string, watchlistId: string) =>
    ['social', 'profile-watchlist-items', userId, watchlistId] as const,
  search: (query: string) => ['social', 'search', query] as const,
  followers: (userId: string) => ['social', 'followers', userId] as const,
  following: (userId: string) => ['social', 'following', userId] as const,
  privacy: () => ['social', 'privacy'] as const,
  feed: (mode: 'following' | 'discover') => ['social', 'feed', mode] as const,
};
