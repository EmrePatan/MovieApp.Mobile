import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '@/components/common/AppText';
import { premiumSheet } from '@/theme/premium-sheet';
import { formatWatchedGroupDate, getSelectionKey } from '../utils/watch-date';
import { SelectionMark } from './SelectionMark';
import { HistoryPoster } from './HistoryPoster';
import { colors } from '@/theme/colors';
import { glass } from '@/theme/glass';
import { borderRadius, spacing } from '@/theme/spacing';
import type { RecentWatchHistoryItemResponse } from '../types';
import {
  describeGroupEpisodeSpan,
  type WatchHistoryShowGroup,
} from '../utils/group-recent-watch-history';
import { RecentHistoryCard } from './RecentHistoryCard';

interface RecentHistoryGroupCardProps {
  group: WatchHistoryShowGroup;
  onOpenEpisode: (item: RecentWatchHistoryItemResponse) => void;
  onOpenShow: (tvShowId: string) => void;
  /** Set while the list is in selection mode. */
  selectedKeys?: ReadonlySet<string>;
  onToggleAll?: (items: RecentWatchHistoryItemResponse[]) => void;
  /** Changes every episode of the show, including the ones not loaded yet. */
  onSelectWholeShow?: (tvShowId: string, title: string) => void;
}

export const RecentHistoryGroupCard = memo(function RecentHistoryGroupCard({
  group,
  onOpenEpisode,
  onOpenShow,
  selectedKeys,
  onToggleAll,
  onSelectWholeShow,
}: RecentHistoryGroupCardProps) {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);
  const count = group.episodes.length;
  const title = group.tvShowTitle ?? t('contentType.tvShow');
  const span = describeGroupEpisodeSpan(group);
  const watchedAt = formatWatchedGroupDate(group.episodes);
  const selecting = selectedKeys !== undefined;
  const isSelected = (episode: RecentWatchHistoryItemResponse) =>
    selectedKeys?.has(getSelectionKey(episode) ?? '') ?? false;
  const allSelected = selecting && group.episodes.every(isSelected);

  return (
    <View>
      <View style={[styles.card, allSelected && styles.cardSelected]}>
        {/* Like a movie card, the card opens its title; the chevron lists the episodes. */}
        <Pressable
          accessibilityRole={selecting ? 'checkbox' : 'button'}
          accessibilityState={selecting ? { checked: allSelected } : undefined}
          accessibilityLabel={
            selecting
              ? t('extras.historyDatesSelectShow', { title })
              : `${title}, ${t('extras.historyEpisodes', { count })}`
          }
          onPress={() =>
            selecting ? onToggleAll?.(group.episodes) : onOpenShow(group.tvShowId)
          }
          style={({ pressed }) => [styles.main, pressed && styles.pressed]}
          testID="watch-history-group"
        >
          {selecting ? <SelectionMark selected={allSelected} /> : null}
          <HistoryPoster uri={group.episodes[0]?.posterPath} />
          <View style={styles.meta}>
            <AppText variant="body" numberOfLines={2}>
              {title}
            </AppText>
            <View style={styles.row}>
              <View style={styles.badge}>
                <AppText variant="caption" style={styles.badgeText}>
                  {t('extras.historyEpisodes', { count })}
                </AppText>
              </View>
              {span ? (
                <AppText variant="caption" muted>
                  {span}
                </AppText>
              ) : null}
              {watchedAt ? (
                <AppText variant="caption" muted>
                  {watchedAt}
                </AppText>
              ) : null}
            </View>
          </View>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ expanded }}
          accessibilityLabel={t('extras.historyDatesToggleEpisodes', { title })}
          onPress={() => setExpanded((current) => !current)}
          style={({ pressed }) => [styles.expand, pressed && styles.pressed]}
          testID="watch-history-group-expand"
        >
          <Ionicons
            name={expanded ? 'chevron-up' : 'chevron-down'}
            size={20}
            color={colors.textMuted}
          />
        </Pressable>
      </View>
      {selecting && onSelectWholeShow ? (
        <Pressable
          accessibilityRole="button"
          onPress={() => onSelectWholeShow(group.tvShowId, title)}
          style={({ pressed }) => [styles.wholeShow, pressed && styles.pressed]}
          testID="watch-history-whole-show"
        >
          <AppText variant="caption" style={styles.wholeShowLabel}>
            {t('extras.historyDatesWholeShow')}
          </AppText>
        </Pressable>
      ) : null}
      {expanded ? (
        <View>
          {group.episodes.map((episode) => (
            <RecentHistoryCard
              key={episode.episodeId ?? `${episode.seasonNumber}-${episode.episodeNumber}`}
              item={episode}
              onPress={onOpenEpisode}
              selected={selecting ? isSelected(episode) : undefined}
              showPoster={false}
            />
          ))}
        </View>
      ) : null}
    </View>
  );
});

const styles = StyleSheet.create({
  card: {
    marginHorizontal: spacing.lg,
    marginVertical: spacing.xs,
    flexDirection: 'row',
    alignItems: 'stretch',
    borderRadius: 20,
    backgroundColor: glass.panel,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: glass.hairline,
  },
  cardSelected: { borderWidth: 1, borderColor: premiumSheet.goldBorder },
  pressed: { opacity: 0.85 },
  main: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    paddingRight: 0,
  },
  meta: { flex: 1, minWidth: 0, gap: spacing.xs },
  expand: { width: 48, alignItems: 'center', justifyContent: 'center' },
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
  badgeText: { color: colors.accent, fontWeight: '700' },
  wholeShow: {
    alignSelf: 'flex-end',
    justifyContent: 'center',
    minHeight: 32,
    marginHorizontal: spacing.lg,
  },
  wholeShowLabel: { color: colors.accent, fontWeight: '700' },
});
