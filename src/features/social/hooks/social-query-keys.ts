export const socialQueryKeys = {
  all: ['social'] as const,
  profile: (userId: string) => ['social', 'profile', userId] as const,
  profileStatistics: (userId: string) => ['social', 'profile-statistics', userId] as const,
  profileActivities: (userId: string) => ['social', 'profile-activities', userId] as const,
  search: (query: string) => ['social', 'search', query] as const,
  followers: (userId: string) => ['social', 'followers', userId] as const,
  following: (userId: string) => ['social', 'following', userId] as const,
  privacy: () => ['social', 'privacy'] as const,
};
