import { memo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { ContentTypeBadge } from '@/components/content/ContentTypeBadge';
import { AppText } from '@/components/common/AppText';
import { PosterImage } from '@/components/common/PosterImage';
import type { UpcomingCatalogItem } from '../types';
import { formatCatalogYear, formatContentType, formatIsoDate, formatRating } from '@/utils/format';
import { colors } from '@/theme/colors';
import { interaction } from '@/theme/interaction';
import { layout } from '@/theme/layout';
import { spacing } from '@/theme/spacing';

interface UpcomingCardProps {
  item: UpcomingCatalogItem;
  onPress?: (item: UpcomingCatalogItem) => void;
}

export const UpcomingCard = memo(function UpcomingCard({ item, onPress }: UpcomingCardProps) {
  const year = formatCatalogYear(item.releaseDate, item.year);
  const releaseDate = formatIsoDate(item.releaseDate);
  const accessibilityLabel = `${item.title}, ${formatContentType(item.type)}${releaseDate ? `, ${releaseDate}` : ''}${item.isFollowed ? ', notified' : ''}`;

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
          accessibilityLabel={`${item.title} poster`}
          elevated
        />
        {item.isFollowed ? (
          <View style={styles.badge} accessibilityLabel="Notified">
            <AppText variant="caption" style={styles.badgeText}>
              Notified
            </AppText>
          </View>
        ) : null}
      </View>
      <View style={styles.meta}>
        <AppText variant="bodySmall" numberOfLines={2} style={styles.title}>
          {item.title}
        </AppText>
        <View style={styles.row}>
          <ContentTypeBadge type={item.type} />
          {year ? (
            <AppText variant="caption" muted>
              {year}
            </AppText>
          ) : null}
          <AppText variant="caption" muted>
            ★ {formatRating(item.voteAverage)}
          </AppText>
        </View>
        {releaseDate ? (
          <AppText variant="caption" muted numberOfLines={1}>
            {releaseDate}
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
