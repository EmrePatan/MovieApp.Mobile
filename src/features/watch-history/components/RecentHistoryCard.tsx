import { memo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { HistoryPoster } from './HistoryPoster';
import { AppText } from '@/components/common/AppText';
import { premiumSheet } from '@/theme/premium-sheet';
import { formatWatchedDate } from '../utils/watch-date';
import { SelectionMark } from './SelectionMark';
import type { RecentWatchHistoryItemResponse } from '../types';
import {
  getRecentHistorySubtitle,
  getRecentHistoryTitle,
} from '../utils/history-navigation';
import { colors } from '@/theme/colors';
import { glass } from '@/theme/glass';
import { borderRadius, spacing } from '@/theme/spacing';

interface RecentHistoryCardProps {
  item: RecentWatchHistoryItemResponse;
  onPress?: (item: RecentWatchHistoryItemResponse) => void;
  /** Set while the list is in selection mode. */
  selected?: boolean;
  /** Lets the poster of an episode open its show; the rest of the card opens the episode. */
  onOpenShow?: (tvShowId: string) => void;
  /** Off for episodes listed under their show card, which already shows the poster. */
  showPoster?: boolean;
}

export const RecentHistoryCard = memo(function RecentHistoryCard({
  item,
  onPress,
  selected,
  onOpenShow,
  showPoster = true,
}: RecentHistoryCardProps) {
  const { t } = useTranslation();
  const title = getRecentHistoryTitle(item);
  const subtitle = getRecentHistorySubtitle(item);
  const watchedAt = formatWatchedDate(item.watchedAt, item.watchedAtPrecision);
  const selecting = selected !== undefined;

  return (
    <Pressable
      accessibilityRole={selecting ? 'checkbox' : 'button'}
      accessibilityState={selecting ? { checked: selected } : undefined}
      accessibilityLabel={`${title}, ${subtitle}${watchedAt ? `, watched ${watchedAt}` : ''}`}
      onPress={() => onPress?.(item)}
      style={({ pressed }) => [
        styles.card,
        selected && styles.cardSelected,
        pressed && styles.pressed,
      ]}
    >
      {selecting ? <SelectionMark selected={selected} /> : null}
      {showPoster ? (
        !selecting && onOpenShow && item.type === 'episode' && item.tvShowId ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`${t('extras.historyOpenShow')}: ${title}`}
            onPress={() => onOpenShow(item.tvShowId!)}
          >
            <HistoryPoster uri={item.posterPath} />
          </Pressable>
        ) : (
          <HistoryPoster uri={item.posterPath} />
        )
      ) : null}
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
    marginHorizontal: spacing.lg,
    marginVertical: spacing.xs,
    padding: spacing.md,
    borderRadius: 20,
    backgroundColor: glass.panel,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: glass.hairline,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  cardSelected: {
    borderWidth: 1,
    borderColor: premiumSheet.goldBorder,
  },
  pressed: {
    opacity: 0.85,
  },
  meta: {
    flex: 1,
    gap: spacing.xs,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  badge: {
    backgroundColor: glass.panelElevated,
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  badgeText: {
    color: colors.textSecondary,
    textTransform: 'uppercase',
  },
});
