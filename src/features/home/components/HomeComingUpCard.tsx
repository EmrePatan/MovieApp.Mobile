import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';
import { ContentTypeBadge } from '@/components/content/ContentTypeBadge';
import { AppText } from '@/components/common/AppText';
import { PosterImage } from '@/components/common/PosterImage';
import type { HomeItem } from '../types';
import { formatRelativeAirDateLocalized } from '@/utils/format-relative-air-date';
import { formatIsoDate } from '@/utils/format';
import { colors } from '@/theme/colors';
import { interaction } from '@/theme/interaction';
import { layout } from '@/theme/layout';
import { spacing } from '@/theme/spacing';

interface HomeComingUpCardProps {
  item: HomeItem;
  onPress?: (item: HomeItem) => void;
}

function formatSeasonEpisode(seasonNumber?: number | null, episodeNumber?: number | null): string | null {
  if (seasonNumber == null || episodeNumber == null) {
    return null;
  }

  return `S${String(seasonNumber).padStart(2, '0')} E${String(episodeNumber).padStart(2, '0')}`;
}

export const HomeComingUpCard = memo(function HomeComingUpCard({
  item,
  onPress,
}: HomeComingUpCardProps) {
  const { t } = useTranslation();
  const isTvEpisode = item.upcomingKind === 'TvEpisode';
  const releaseDate = formatIsoDate(item.releaseDate);
  const relativeAirDate = formatRelativeAirDateLocalized(item.releaseDate, t);
  const seasonEpisode = formatSeasonEpisode(item.seasonNumber, item.episodeNumber);
  const accessibilityLabel = `${item.title}${seasonEpisode ? `, ${seasonEpisode}` : ''}${item.episodeName ? `, ${item.episodeName}` : ''}${relativeAirDate ? `, ${relativeAirDate}` : releaseDate ? `, ${releaseDate}` : ''}`;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={() => onPress?.(item)}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <PosterImage
        uri={item.posterUrl}
        width={layout.posterCarousel.width}
        height={layout.posterCarousel.height}
        accessibilityLabel={t('common.posterAccessibility', { title: item.title })}
        elevated
      />
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
        {!isTvEpisode ? (
          <View style={styles.row}>
            <ContentTypeBadge type={item.contentType} />
            <AppText variant="caption" muted>
              {item.upcomingKind === 'TvShowPremiere'
                ? t('home.comingUpBadge.premiere')
                : t('home.comingUpBadge.release')}
            </AppText>
          </View>
        ) : null}
        {relativeAirDate || releaseDate ? (
          <AppText variant="caption" style={styles.date} numberOfLines={1}>
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
  meta: {
    marginTop: spacing.sm,
    gap: spacing.xs,
  },
  title: {
    minHeight: 40,
    color: colors.textPrimary,
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
