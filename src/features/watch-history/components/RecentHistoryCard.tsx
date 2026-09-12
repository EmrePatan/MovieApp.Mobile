import { memo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { AppText } from '@/components/common/AppText';
import { formatIsoDate } from '@/utils/format';
import type { RecentWatchHistoryItemResponse } from '../types';
import {
  getRecentHistorySubtitle,
  getRecentHistoryTitle,
} from '../utils/history-navigation';
import { colors } from '@/theme/colors';
import { borderRadius, spacing } from '@/theme/spacing';

interface RecentHistoryCardProps {
  item: RecentWatchHistoryItemResponse;
  onPress?: (item: RecentWatchHistoryItemResponse) => void;
}

export const RecentHistoryCard = memo(function RecentHistoryCard({
  item,
  onPress,
}: RecentHistoryCardProps) {
  const title = getRecentHistoryTitle(item);
  const subtitle = getRecentHistorySubtitle(item);
  const watchedAt = formatIsoDate(item.watchedAt.slice(0, 10));

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${title}, ${subtitle}${watchedAt ? `, watched ${watchedAt}` : ''}`}
      onPress={() => onPress?.(item)}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <View style={styles.meta}>
        <AppText variant="body" numberOfLines={2}>
          {title}
        </AppText>
        <View style={styles.row}>
          <View style={styles.badge}>
            <AppText variant="caption" style={styles.badgeText}>
              {subtitle}
            </AppText>
          </View>
          {watchedAt ? (
            <AppText variant="caption" muted>
              {watchedAt}
            </AppText>
          ) : null}
        </View>
      </View>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  card: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  pressed: {
    opacity: 0.85,
  },
  meta: {
    gap: spacing.xs,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  badge: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  badgeText: {
    color: colors.textSecondary,
    textTransform: 'uppercase',
  },
});
