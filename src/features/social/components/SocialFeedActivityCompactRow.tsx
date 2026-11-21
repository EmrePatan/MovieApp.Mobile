import { memo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { AppText } from '@/components/common/AppText';
import { UserAvatar } from '@/components/common/UserAvatar';
import { CatalogImage } from '@/features/details/shared/components/CatalogImage';
import { ReviewStarRow } from '@/features/reviews/components/ReviewStarRow';
import { backendScoreToStarRating } from '@/features/ratings/utils/star-rating';
import { formatNotificationRelativeTime } from '@/features/notifications/utils/format-notification-relative-time';
import type { SocialFeedItem } from '../types';
import { formatSocialCompactDetail, formatSocialCompactHeadline } from '../utils/social-feed-embed';
import { socialActivityFeedVerbI18nKey } from '../utils/social-activity-feed-verb';
import { SOCIAL_TWITTER_AVATAR, socialFeedSpacing, socialUi } from './social-ui-tokens';
import { colors } from '@/theme/colors';
import { borderRadius, spacing } from '@/theme/spacing';
import { layout } from '@/theme/layout';

const POSTER_W = 44;
const POSTER_H = 66;

interface SocialFeedActivityCompactRowProps {
  items: SocialFeedItem[];
  headlineExtra?: string | null;
  onPress: () => void;
  onProfile: () => void;
}

export const SocialFeedActivityCompactRow = memo(function SocialFeedActivityCompactRow({
  items,
  headlineExtra,
  onPress,
  onProfile,
}: SocialFeedActivityCompactRowProps) {
  const { t } = useTranslation();
  const first = items[0];
  const time = formatNotificationRelativeTime(first.createdAt);
  const title = first.targetTitle || t('social.contentFallback');

  const headline =
    headlineExtra != null
      ? `${t(socialActivityFeedVerbI18nKey(first.activityType))} · ${headlineExtra}`
      : items.length > 1
        ? t('social.feedStyle.watchedMultiple', { count: items.length })
        : formatSocialCompactHeadline(t, first);

  const detail =
    items.length > 1
      ? items
          .map((item) => item.targetTitle || t('social.contentFallback'))
          .slice(0, 3)
          .join(' · ')
      : formatSocialCompactDetail(t, first);

  const showStars =
    first.ratingScore !== null &&
    first.ratingScore !== undefined &&
    items.length === 1 &&
    !headlineExtra;

  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={first.displayName}
          onPress={onProfile}
          hitSlop={6}
          style={({ pressed }) => pressed && socialUi.pressed}
        >
          <UserAvatar
            displayName={first.displayName}
            effectiveAvatarUrl={first.avatarUrl}
            size={SOCIAL_TWITTER_AVATAR}
            textVariant="caption"
          />
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={title}
          onPress={onPress}
          style={({ pressed }) => [styles.mainHit, pressed && socialUi.pressed]}
        >
          <View style={styles.main}>
            <AppText variant="bodySmall" style={styles.name}>
              {first.displayName}
            </AppText>
            <View style={styles.headlineRow}>
              <AppText variant="bodySmall" style={styles.headline}>
                {headline}
              </AppText>
              {showStars ? (
                <ReviewStarRow starRating={backendScoreToStarRating(first.ratingScore!)} size={12} />
              ) : null}
            </View>
            <AppText variant="caption" muted numberOfLines={3}>
              {detail}
            </AppText>
            <AppText variant="caption" muted style={styles.time}>
              {time}
            </AppText>
          </View>
          <View style={styles.posters}>
            {items.slice(0, 2).map((item, index) => (
              <View
                key={item.id}
                style={[styles.posterFrame, index > 0 && styles.posterStacked]}
              >
                <CatalogImage
                  path={item.posterPath}
                  width={POSTER_W}
                  height={POSTER_H}
                  accessibilityLabel={item.targetTitle || title}
                />
              </View>
            ))}
          </View>
        </Pressable>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: layout.screenPaddingHorizontal,
    paddingVertical: socialFeedSpacing.rowPaddingVertical,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  mainHit: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    borderRadius: borderRadius.sm,
  },
  main: {
    flex: 1,
    gap: socialFeedSpacing.blockGap,
    paddingTop: 0,
  },
  name: {
    fontWeight: '700',
    color: colors.textPrimary,
  },
  headlineRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: spacing.xs,
  },
  headline: {
    color: colors.textPrimary,
    fontWeight: '600',
  },
  time: {
    marginTop: 0,
  },
  posters: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    minWidth: POSTER_W + 8,
  },
  posterFrame: {
    borderRadius: borderRadius.sm,
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.borderSubtle,
  },
  posterStacked: {
    marginLeft: -POSTER_W / 3,
  },
});