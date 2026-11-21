/**
 * Local Black Titanium tokens for the social feed surface only.
 * Prefer these over global theme edits; map to `colors` when values already match.
 */
export const socialFeedTheme = {
  background: '#08080A',
  surface: '#15151A',
  surfaceSecondary: '#1C1C22',
  textPrimary: '#F1F0F2',
  textSecondary: '#92929D',
  textMuted: '#6E6E78',
  border: '#292930',
  borderSubtle: 'rgba(255, 255, 255, 0.08)',
  accent: '#B9A276',
  accentMuted: 'rgba(185, 162, 118, 0.35)',
  accentTint: 'rgba(185, 162, 118, 0.12)',
  pillBackground: 'rgba(28, 28, 34, 0.92)',
  pillBorder: '#292930',
  pillActiveBackground: 'rgba(255, 255, 255, 0.06)',
  mediaBackdrop: '#101014',
} as const;

/** Feed media band — clamp natural aspect so cards stay cinematic without fixed px heights. */
export const SOCIAL_FEED_MEDIA_ASPECT = {
  fallback: 16 / 9,
  min: 4 / 5,
  max: 16 / 9,
} as const;

export function clampSocialFeedMediaAspect(aspect: number): number {
  if (!Number.isFinite(aspect) || aspect <= 0) {
    return SOCIAL_FEED_MEDIA_ASPECT.fallback;
  }
  return Math.min(SOCIAL_FEED_MEDIA_ASPECT.max, Math.max(SOCIAL_FEED_MEDIA_ASPECT.min, aspect));
}
