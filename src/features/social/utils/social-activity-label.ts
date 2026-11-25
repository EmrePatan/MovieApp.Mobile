/** Maps API activity type (enum name or legacy numeric string) to i18n key suffix under `social.activity`. */
export type SocialActivityLabelKey =
  | 'watchedMovie'
  | 'watchedEpisode'
  | 'rated'
  | 'reviewed'
  | 'favorited'
  | 'generic';

const ACTIVITY_TYPE_TO_LABEL_KEY: Record<string, SocialActivityLabelKey> = {
  WatchedMovie: 'watchedMovie',
  '1': 'watchedMovie',
  WatchedEpisode: 'watchedEpisode',
  '2': 'watchedEpisode',
  RatedMovie: 'rated',
  RatedTvShow: 'rated',
  RatedEpisode: 'rated',
  '3': 'rated',
  '4': 'rated',
  ReviewedMovie: 'reviewed',
  ReviewedTvShow: 'reviewed',
  ReviewedEpisode: 'reviewed',
  '5': 'reviewed',
  '6': 'reviewed',
  FavoritedMovie: 'favorited',
  FavoritedTvShow: 'favorited',
  '7': 'favorited',
  '8': 'favorited',
};

export function resolveSocialActivityLabelKey(activityType: string): SocialActivityLabelKey {
  return ACTIVITY_TYPE_TO_LABEL_KEY[activityType] ?? 'generic';
}

export function socialActivityI18nKey(activityType: string): string {
  const labelKey = resolveSocialActivityLabelKey(activityType);
  return labelKey === 'generic' ? 'social.activity.generic' : `social.activity.${labelKey}`;
}

export function isWatchedEpisodeActivityType(activityType: string): boolean {
  return activityType === 'WatchedEpisode' || activityType === '2';
}