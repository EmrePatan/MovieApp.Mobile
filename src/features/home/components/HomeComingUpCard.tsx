import { memo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { AppText } from '@/components/common/AppText';
import { PosterImage } from '@/components/common/PosterImage';
import type { HomeItem } from '../types';
import { formatRelativeAirDate } from '@/utils/date';
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
  const releaseDate = formatIsoDate(item.releaseDate);
  const relativeAirDate = formatRelativeAirDate(item.releaseDate);
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
        accessibilityLabel={`${item.title} poster`}
        elevated
      />
      <View style={styles.meta}>
        <AppText variant="bodySmall" numberOfLines={2} style={styles.title}>
          {item.title}
        </AppText>
        {seasonEpisode ? (
          <AppText variant="caption" muted numberOfLines={1}>
            {seasonEpisode}
            {item.episodeName ? ` · ${item.episodeName}` : ''}
          </AppText>
        ) : null}
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
  meta: {
    marginTop: spacing.sm,
    gap: spacing.xs,
  },
  title: {
    minHeight: 40,
    color: colors.textPrimary,
  },
});
