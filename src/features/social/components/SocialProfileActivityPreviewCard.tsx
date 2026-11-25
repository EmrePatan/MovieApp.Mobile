import { memo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { AppText } from '@/components/common/AppText';
import { formatNotificationRelativeTime } from '@/features/notifications/utils/format-notification-relative-time';
import type { SocialFeedItem } from '../types';
import { socialActivityHeadlineI18nKey } from '../utils/social-activity-headline';
import { SocialSpotlightPanel } from './SocialSpotlightPanel';
import { socialFeedPremiumStyles } from './social-feed-premium-styles';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';

interface SocialProfileActivityPreviewCardProps {
  item: SocialFeedItem;
  headlineOverride?: string;
  onPress: () => void;
}

export const SocialProfileActivityPreviewCard = memo(function SocialProfileActivityPreviewCard({
  item,
  headlineOverride,
  onPress,
}: SocialProfileActivityPreviewCardProps) {
  const { t } = useTranslation();
  const title = item.targetTitle || t('social.contentFallback');
  const headline =
    headlineOverride ?? t(socialActivityHeadlineI18nKey(item.activityType), { title });
  const statsSummary = t('social.feedStats', {
    likes: item.likesCount,
    comments: item.commentsCount,
  });
  const relativeTime = formatNotificationRelativeTime(item.createdAt);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={headline}
      onPress={onPress}
      style={({ pressed }) => [
        socialFeedPremiumStyles.shell,
        styles.card,
        pressed && socialFeedPremiumStyles.pressed,
      ]}
    >
      <AppText variant="body" style={socialFeedPremiumStyles.headline} numberOfLines={2}>
        {headline}
      </AppText>
      <SocialSpotlightPanel item={item} />
      <View style={styles.footer}>
        <AppText variant="caption" style={styles.stats} numberOfLines={1}>
          {statsSummary}
        </AppText>
        {relativeTime ? (
          <AppText variant="caption" muted numberOfLines={1}>
            {relativeTime}
          </AppText>
        ) : null}
      </View>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  card: {
    gap: spacing.md,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  stats: {
    color: colors.textMuted,
    flex: 1,
  },
});