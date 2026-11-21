import type { TFunction } from 'i18next';
import type { SocialFeedItem } from '../types';
import { resolveSocialActivityLabelKey } from './social-activity-label';
import { socialActivityFeedVerbI18nKey } from './social-activity-feed-verb';

export function socialContentTypeLabel(
  type: SocialFeedItem['targetContentType'],
  t: TFunction,
): string {
  if (type === 'Movie') return t('social.contentType.movie');
  if (type === 'TvShow') return t('social.contentType.tvShow');
  return t('social.contentType.episode');
}

/** Link-preview subtitle under the title (e.g. episode line); omits generic Film/Dizi labels. */
export function formatSocialEmbedSubtitle(item: SocialFeedItem, _t: TFunction): string | null {
  const line = item.targetSubtitle?.trim();
  return line || null;
}

/** Muted kicker above the title inside the embed card. */
export function formatSocialEmbedKicker(t: TFunction, item: SocialFeedItem): string {
  const verb = t(socialActivityFeedVerbI18nKey(item.activityType));
  const episode = item.targetSubtitle?.trim();
  if (episode && item.targetContentType === 'Episode') {
    const labelKey = resolveSocialActivityLabelKey(item.activityType);
    if (labelKey === 'generic') {
      return t('social.feedStyle.commentOnEpisode', { episode });
    }
    return t('social.feedStyle.activityOnEpisode', { verb, episode });
  }
  return verb;
}

export function formatSocialCompactHeadline(t: TFunction, item: SocialFeedItem): string {
  return t(socialActivityFeedVerbI18nKey(item.activityType));
}

export function formatSocialCompactDetail(t: TFunction, item: SocialFeedItem): string {
  const title = item.targetTitle || t('social.contentFallback');
  const meta = formatSocialEmbedSubtitle(item, t);
  return meta ? `${title} — ${meta}` : title;
}