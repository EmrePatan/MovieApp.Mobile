import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';
import { ContentTypeBadge } from '@/components/content/ContentTypeBadge';
import { AppText } from '@/components/common/AppText';
import { PosterImage } from '@/components/common/PosterImage';
import type { UpcomingCatalogItem } from '../types';
import { formatRelativeAirDate } from '@/utils/date';
import { formatCatalogYear, formatContentType, formatIsoDate, formatRating } from '@/utils/format';
import { colors } from '@/theme/colors';
import { interaction } from '@/theme/interaction';
import { layout } from '@/theme/layout';
import { spacing } from '@/theme/spacing';

interface UpcomingCardProps {
  item: UpcomingCatalogItem;
  onPress?: (item: UpcomingCatalogItem) => void;
}

function formatSeasonEpisode(seasonNumber?: number, episodeNumber?: number): string | null {
  if (seasonNumber == null || episodeNumber == null) {
    return null;
  }

  return `S${String(seasonNumber).padStart(2, '0')} E${String(episodeNumber).padStart(2, '0')}`;
}

export const UpcomingCard = memo(function UpcomingCard({ item, onPress }: UpcomingCardProps) {
  const { t } = useTranslation();
  const isTvEpisode = item.upcomingKind === 'TvEpisode';
  const year = formatCatalogYear(item.releaseDate, item.year);
  const releaseDate = formatIsoDate(item.releaseDate);
  const relativeAirDate = formatRelativeAirDate(item.releaseDate);
  const seasonEpisode = formatSeasonEpisode(item.seasonNumber, item.episodeNumber);
  const trackedLabel = item.isFollowed ? t('upcoming.card.notified') : null;
  const accessibilityLabel = `${item.title}, ${formatContentType(item.type)}${seasonEpisode ? `, ${seasonEpisode}` : ''}${item.episodeName ? `, ${item.episodeName}` : ''}${relativeAirDate ? `, ${relativeAirDate}` : releaseDate ? `, ${releaseDate}` : ''}${trackedLabel ? `, ${trackedLabel}` : ''}`;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={() => onPress?.(item)}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <View style={styles.posterWrap}>
        <PosterImage
          uri={item.posterUrl}
          width={layout.posterCarousel.width}
          height={layout.posterCarousel.height}
          accessibilityLabel={t('common.posterAccessibility', { title: item.title })}
          elevated
        />
        {item.isFollowed ? (
          <View style={styles.badge} accessibilityLabel={t('upcoming.card.notified')}>
            <AppText variant="caption" style={styles.badgeText}>
              {t('upcoming.card.notified')}
            </AppText>
          </View>
        ) : null}
      </View>
      <View style={styles.meta}>
        <AppText variant="bodySmall" numberOfLines={2} style={styles.title}>
          {item.title}
        </AppText>
        {isTvEpisode && seasonEpisode ? (
          <AppText variant="caption" muted numberOfLines={1}>
            {seasonEpisode}
            {item.episodeName ? ` · ${item.episodeName}` : ''}
          </AppText>
        ) : null}
        <View style={styles.row}>
          <ContentTypeBadge type={item.type} />
          {!isTvEpisode && year ? (
            <AppText variant="caption" muted>
              {year}
            </AppText>
          ) : null}
          {!isTvEpisode ? (
            <AppText variant="caption" muted>
              ★ {formatRating(item.voteAverage)}
            </AppText>
          ) : null}
        </View>
        {relativeAirDate || releaseDate ? (
          <AppText variant="caption" muted numberOfLines={1}>
            {relativeAirDate ?? releaseDate}
          </AppText>
        ) : null}
      </View>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  card: {
    width: layout.posterCarousel.width,
    marginRight: spacing.md,
  },
  pressed: {
    opacity: interaction.pressedOpacity,
  },
  posterWrap: {
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: spacing.xs,
    right: spacing.xs,
    backgroundColor: colors.accent,
    borderRadius: spacing.xs,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
  },
  badgeText: {
    color: colors.background,
    fontWeight: '600',
  },
  meta: {
    marginTop: spacing.sm,
    gap: spacing.xs,
  },
  title: {
    minHeight: 40,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
});
