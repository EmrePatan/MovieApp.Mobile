import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '@/components/common/AppText';
import { formatIsoDate } from '@/utils/format';
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
}

export const RecentHistoryGroupCard = memo(function RecentHistoryGroupCard({
  group,
  onOpenEpisode,
  onOpenShow,
}: RecentHistoryGroupCardProps) {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);
  const count = group.episodes.length;
  const title = group.tvShowTitle ?? t('contentType.tvShow');
  const span = describeGroupEpisodeSpan(group);
  const watchedAt = formatIsoDate(group.latestWatchedAt.slice(0, 10));

  return (
    <View>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ expanded }}
        accessibilityLabel={`${title}, ${t('extras.historyEpisodes', { count })}`}
        onPress={() => setExpanded((current) => !current)}
        style={({ pressed }) => [styles.card, pressed && styles.pressed]}
        testID="watch-history-group"
      >
        <View style={styles.headRow}>
          <AppText variant="body" numberOfLines={2} style={styles.title}>
            {title}
          </AppText>
          <Ionicons
            name={expanded ? 'chevron-up' : 'chevron-down'}
            size={18}
            color={colors.textMuted}
          />
        </View>
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
      </Pressable>
      {expanded ? (
        <View>
          {group.episodes.map((episode) => (
            <RecentHistoryCard
              key={episode.episodeId ?? `${episode.seasonNumber}-${episode.episodeNumber}`}
              item={episode}
              onPress={onOpenEpisode}
            />
          ))}
          <Pressable
            accessibilityRole="button"
            onPress={() => onOpenShow(group.tvShowId)}
            style={({ pressed }) => [styles.openShow, pressed && styles.pressed]}
          >
            <AppText variant="caption" style={styles.openShowLabel}>
              {t('extras.historyOpenShow')}
            </AppText>
          </Pressable>
        </View>
      ) : null}
    </View>
  );
});

const styles = StyleSheet.create({
  card: {
    marginHorizontal: spacing.lg,
    marginVertical: spacing.xs,
    padding: spacing.md,
    gap: spacing.xs,
    borderRadius: 20,
    backgroundColor: glass.panel,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: glass.hairline,
  },
  pressed: { opacity: 0.85 },
  headRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  title: { flex: 1, minWidth: 0 },
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
  openShow: {
    alignSelf: 'flex-start',
    marginHorizontal: spacing.lg,
    paddingVertical: spacing.xs,
  },
  openShowLabel: { color: colors.accent, fontWeight: '700' },
});
