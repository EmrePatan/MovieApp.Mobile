import { isWatchedEpisodeActivityType, resolveSocialActivityLabelKey, socialActivityI18nKey } from '@/features/social/utils/social-activity-label';

describe('social activity labels', () => {
  it('resolves enum names and legacy numeric values', () => {
    expect(resolveSocialActivityLabelKey('WatchedMovie')).toBe('watchedMovie');
    expect(resolveSocialActivityLabelKey('1')).toBe('watchedMovie');
    expect(resolveSocialActivityLabelKey('WatchedEpisode')).toBe('watchedEpisode');
    expect(resolveSocialActivityLabelKey('2')).toBe('watchedEpisode');
    expect(resolveSocialActivityLabelKey('RatedTvShow')).toBe('rated');
    expect(resolveSocialActivityLabelKey('unknown')).toBe('generic');
  });

  it('builds i18n keys', () => {
    expect(socialActivityI18nKey('FavoritedMovie')).toBe('social.activity.favorited');
    expect(socialActivityI18nKey('99')).toBe('social.activity.generic');
  });

  it('detects watched episode activity types', () => {
    expect(isWatchedEpisodeActivityType('WatchedEpisode')).toBe(true);
    expect(isWatchedEpisodeActivityType('2')).toBe(true);
    expect(isWatchedEpisodeActivityType('WatchedMovie')).toBe(false);
  });
});