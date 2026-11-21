import { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';
import { AppText } from '@/components/common/AppText';
import { PosterImage } from '@/components/common/PosterImage';
import { BrowsePosterFrame } from '@/features/browse-quick-actions/components/BrowsePosterFrame';
import {
  buildBrowseQuickActionsTarget,
  useBrowsePosterQuickActions,
} from '@/features/browse-quick-actions/hooks/useBrowsePosterQuickActions';
import type { HomeItem } from '../types';
import {
  formatCatalogYear,
  formatContentType,
  formatRating,
} from '@/utils/format';
import { interaction } from '@/theme/interaction';
import { layout } from '@/theme/layout';
import { spacing } from '@/theme/spacing';
import type { ImageSize } from '@/utils/image-url';

interface HomeContentCardProps {
  item: HomeItem;
  onPress?: (item: HomeItem) => void;
  /** Override the default w500 poster profile (Home trending uses w780). */
  posterSize?: ImageSize;
}

export const HomeContentCard = memo(function HomeContentCard({
  item,
  onPress,
  posterSize,
}: HomeContentCardProps) {
  const { t } = useTranslation();
  const quickTarget = useMemo(
    () =>
      buildBrowseQuickActionsTarget({
        contentId: item.id,
        contentType: item.contentType,
        title: item.title,
        posterUrl: item.posterUrl,
        releaseDate: item.releaseDate,
        voteAverage: item.voteAverage,
      }),
    [item.contentType, item.id, item.posterUrl, item.releaseDate, item.title, item.voteAverage],
  );
  const { isWatched, watchedBusy, onLongPress, onToggleWatched } =
    useBrowsePosterQuickActions(quickTarget);
  const metadataLine = useMemo(() => {
    const parts = [
      formatContentType(item.contentType),
      formatCatalogYear(item.releaseDate, null),
      item.voteAverage > 0 ? `★ ${formatRating(item.voteAverage)}` : null,
    ].filter(Boolean);

    return parts.join(' · ');
  }, [item.contentType, item.releaseDate, item.voteAverage]);

  const accessibilityLabel = `${item.title}, ${metadataLine || formatContentType(item.contentType)}`;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={() => onPress?.(item)}
      onLongPress={onLongPress}
      delayLongPress={380}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <BrowsePosterFrame
        watched={isWatched}
        busy={watchedBusy}
        onToggleWatched={onToggleWatched}
      >
        <PosterImage
          uri={item.posterUrl}
          width={layout.posterCarousel.width}
          height={layout.posterCarousel.height}
          accessibilityLabel={t('common.posterAccessibility', { title: item.title })}
          size={posterSize}
        />
      </BrowsePosterFrame>
      <View style={styles.meta}>
        <AppText variant="bodySmall" numberOfLines={2} style={styles.title}>
          {item.title}
        </AppText>
        {metadataLine ? (
          <AppText variant="caption" muted numberOfLines={1} style={styles.metadata}>
            {metadataLine}
          </AppText>
        ) : null}
      </View>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  card: {
    width: layout.posterCarousel.width,
    marginRight: layout.cardGap,
  },
  pressed: {
    opacity: interaction.pressedOpacity,
  },
  meta: {
    marginTop: spacing.sm,
    gap: spacing.xs,
  },
  title: {
    flexShrink: 1,
  },
  metadata: {
    letterSpacing: 0.1,
  },
});

export const HOME_CARD_WIDTH = layout.posterCarousel.width;
