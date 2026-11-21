import { memo } from 'react';
import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { AppText } from '@/components/common/AppText';
import { formatNotificationRelativeTime } from '@/features/notifications/utils/format-notification-relative-time';
import type { SocialFeedItem } from '../types';
import { socialActivityFeedVerbI18nKey } from '../utils/social-activity-feed-verb';
import { SocialCinemaSpotlight } from './SocialCinemaSpotlight';
import { SocialSpotlightContent } from './SocialSpotlightContent';
import { colors } from '@/theme/colors';
import { layout } from '@/theme/layout';
import { spacing } from '@/theme/spacing';

interface SocialJournalEntryProps {
  item: SocialFeedItem;
  onPress: () => void;
}

function contentTypeLabel(
  type: SocialFeedItem['targetContentType'],
  t: ReturnType<typeof useTranslation>['t'],
): string {
  if (type === 'Movie') return t('social.contentType.movie');
  if (type === 'TvShow') return t('social.contentType.tvShow');
  return t('social.contentType.episode');
}

export const SocialJournalEntry = memo(function SocialJournalEntry({ item, onPress }: SocialJournalEntryProps) {
  const { t } = useTranslation();
  const relativeTime = formatNotificationRelativeTime(item.createdAt);
  const verb = t(socialActivityFeedVerbI18nKey(item.activityType));
  const metaLine = [verb, relativeTime].filter(Boolean).join(' · ');
  const title = item.targetTitle || t('social.contentFallback');

  return (
    <View style={styles.entry}>
      <SocialCinemaSpotlight
        posterPath={item.posterPath}
        onPress={onPress}
        accessibilityLabel={title}
        compact
      >
        <AppText variant="caption" style={styles.meta} numberOfLines={2}>
          {metaLine}
        </AppText>
        <SocialSpotlightContent item={item} typeLabel={contentTypeLabel(item.targetContentType, t)} />
      </SocialCinemaSpotlight>
    </View>
  );
});

const styles = StyleSheet.create({
  entry: {
    paddingHorizontal: layout.screenPaddingHorizontal,
    paddingVertical: spacing.sm,
  },
  meta: {
    color: 'rgba(255, 255, 255, 0.72)',
    fontWeight: '600',
  },
});