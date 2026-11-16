export const socialQueryKeys = {
  all: ['social'] as const,
  profile: (userId: string) => ['social', 'profile', userId] as const,
  profileActivities: (userId: string) => ['social', 'profile-activities', userId] as const,
  search: (query: string) => ['social', 'search', query] as const,
  followers: (userId: string, page: number) => ['social', 'followers', userId, page] as const,
  following: (userId: string, page: number) => ['social', 'following', userId, page] as const,
  privacy: () => ['social', 'privacy'] as const,
};
