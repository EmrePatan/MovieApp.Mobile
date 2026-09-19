import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';
import { i18n } from '@/i18n';
import { ContentTypeBadge } from '@/components/content/ContentTypeBadge';
import { AppText } from '@/components/common/AppText';
import { CatalogImage } from '@/features/details/shared/components/CatalogImage';
import type { UpcomingCatalogItem } from '../types';
import { formatRelativeAirDate } from '@/utils/date';
import { formatCatalogYear, formatContentType, formatIsoDate } from '@/utils/format';
import { colors } from '@/theme/colors';
import { borderRadius, spacing } from '@/theme/spacing';
import { layout } from '@/theme/layout';

interface UpcomingListCardProps {
  item: UpcomingCatalogItem;
  onPress?: (item: UpcomingCatalogItem) => void;
}

function formatSeasonEpisode(seasonNumber?: number, episodeNumber?: number): string | null {
  if (seasonNumber == null || episodeNumber == null) {
    return null;
  }

  return `S${String(seasonNumber).padStart(2, '0')} E${String(episodeNumber).padStart(2, '0')}`;
}

function getKindLabel(item: UpcomingCatalogItem): string | null {
  if (item.upcomingKind === 'TvEpisode') {
    return i18n.t('upcoming.card.nextEpisode');
  }

  if (item.upcomingKind === 'TvShowPremiere') {
    return i18n.t('upcoming.card.seriesPremiere');
  }

  return i18n.t('upcoming.card.release');
}

export const UpcomingListCard = memo(function UpcomingListCard({
  item,
  onPress,
}: UpcomingListCardProps) {
  const { t } = useTranslation();
  const isTvEpisode = item.upcomingKind === 'TvEpisode';
  const year = formatCatalogYear(item.releaseDate, item.year);
  const releaseDate = formatIsoDate(item.releaseDate);
  const relativeDate = formatRelativeAirDate(item.releaseDate);
  const seasonEpisode = formatSeasonEpisode(item.seasonNumber, item.episodeNumber);
  const kindLabel = getKindLabel(item);
  const trackedLabel = item.isFollowed
    ? item.type === 'movie'
      ? t('upcoming.card.releaseAlertOn')
      : t('upcoming.card.followed')
    : null;
  const trackedBadge = item.isFollowed
    ? item.type === 'movie'
      ? t('upcoming.card.alertOn')
      : t('upcoming.card.following')
    : null;
  const accessibilityLabel = `${item.title}, ${formatContentType(item.type)}${seasonEpisode ? `, ${seasonEpisode}` : ''}${item.episodeName ? `, ${item.episodeName}` : ''}${relativeDate ? `, ${relativeDate}` : releaseDate ? `, ${releaseDate}` : ''}${trackedLabel ? `, ${trackedLabel}` : ''}`;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={() => onPress?.(item)}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <View style={styles.posterWrap}>
        <CatalogImage
          path={item.posterUrl}
          width={layout.posterList.width}
          height={layout.posterList.height}
          accessibilityLabel={t('common.posterAccessibility', { title: item.title })}
        />
        {trackedBadge ? (
          <View style={styles.followedBadge}>
            <AppText variant="caption" style={styles.followedBadgeText}>
              {trackedBadge}
            </AppText>
          </View>
        ) : null}
      </View>
      <View style={styles.meta}>
        <AppText variant="body" numberOfLines={2} style={styles.title}>
          {item.title}
        </AppText>
        {isTvEpisode && seasonEpisode ? (
          <AppText variant="bodySmall" muted numberOfLines={1}>
            {seasonEpisode}
            {item.episodeName ? ` · ${item.episodeName}` : ''}
          </AppText>
        ) : null}
        <View style={styles.row}>
          <ContentTypeBadge type={item.type} />
          {kindLabel ? (
            <AppText variant="caption" muted>
              {kindLabel}
            </AppText>
          ) : null}
          {!isTvEpisode && year ? (
            <AppText variant="caption" muted>
              {year}
            </AppText>
          ) : null}
        </View>
        {relativeDate || releaseDate ? (
          <AppText variant="bodySmall" style={styles.date}>
            {relativeDate ?? releaseDate}
          </AppText>
        ) : null}
      </View>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: layout.screenPaddingHorizontal,
    paddingVertical: spacing.sm,
    minHeight: layout.posterList.height + spacing.md,
  },
  pressed: {
    opacity: 0.85,
  },
  posterWrap: {
    position: 'relative',
  },
  followedBadge: {
    position: 'absolute',
    top: spacing.xs,
    right: spacing.xs,
    backgroundColor: colors.accent,
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
  },
  followedBadgeText: {
    color: colors.background,
    fontWeight: '600',
  },
  meta: {
    flex: 1,
    gap: spacing.xs,
  },
  title: {
    flexShrink: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  date: {
    color: colors.accent,
    fontWeight: '600',
  },
});
