import { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '@/components/common/AppText';
import { PosterImage } from '@/components/common/PosterImage';
import { PosterRatingBadge } from '@/components/content/PosterRatingBadge';
import { BrowsePosterFrame } from '@/features/browse-quick-actions/components/BrowsePosterFrame';
import {
  buildBrowseQuickActionsTarget,
  useBrowsePosterQuickActions,
} from '@/features/browse-quick-actions/hooks/useBrowsePosterQuickActions';
import type { HomeItem } from '../types';
import { LeavingPlatformFlags } from '@/features/leaving-soon/LeavingPlatformFlags';
import { formatLeavingLastDay } from '@/features/leaving-soon/leaving-soon-items';
import { formatCatalogYear, formatContentType, formatRating } from '@/utils/format';
import { colors } from '@/theme/colors';
import { interaction } from '@/theme/interaction';
import { layout } from '@/theme/layout';
import { borderRadius, spacing } from '@/theme/spacing';
import type { ImageSize } from '@/utils/image-url';
import { POSTER_CARD_ROLE } from '@/utils/poster-card-role';

interface HomeContentCardProps {
  item: HomeItem;
  onPress?: (item: HomeItem) => void;
  /** Override the default w500 poster profile (Home trending uses w780). */
  posterSize?: ImageSize;
  /** When set, shows a "not interested" control on the poster's top-left corner. */
  onDismiss?: (item: HomeItem) => void;
}

export const HomeContentCard = memo(function HomeContentCard({
  item,
  onPress,
  posterSize,
  onDismiss,
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
    ].filter(Boolean);

    return parts.join(' · ');
  }, [item.contentType, item.releaseDate]);
  const rating = item.voteAverage > 0 ? formatRating(item.voteAverage) : null;

  // Replaces the type and year line, so the card keeps its height.
  const lastDayLine = item.leaving
    ? formatLeavingLastDay(item.leaving.leavesAtUtc, 'short')
    : null;
  const leavingLabel = item.leaving
    ? `, ${lastDayLine}, ${item.leaving.platforms.map((platform) => platform.name).join(', ')}`
    : '';

  const accessibilityLabel = `${item.title}, ${metadataLine || formatContentType(item.contentType)}${rating ? `, ★ ${rating}` : ''}${leavingLabel}`;

  return (
    <Pressable
      accessibilityRole={POSTER_CARD_ROLE}
      accessibilityLabel={accessibilityLabel}
      onPress={() => onPress?.(item)}
      onLongPress={onLongPress}
      delayLongPress={380}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <BrowsePosterFrame watched={isWatched} busy={watchedBusy} onToggleWatched={onToggleWatched}>
        <PosterImage
          uri={item.posterUrl}
          width={layout.posterCarousel.width}
          height={layout.posterCarousel.height}
          accessibilityLabel={t('common.posterAccessibility', { title: item.title })}
          size={posterSize}
        />
      </BrowsePosterFrame>
      <PosterRatingBadge
        voteAverage={item.voteAverage}
        posterHeight={layout.posterCarousel.height}
      />
      {item.leaving ? (
        <View style={styles.platformAnchor} pointerEvents="none">
          <LeavingPlatformFlags platforms={item.leaving.platforms} />
        </View>
      ) : null}
      {onDismiss ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('home.dismissRecommendation')}
          hitSlop={8}
          onPress={() => onDismiss(item)}
          style={({ pressed }) => [styles.dismissAnchor, pressed && styles.pressed]}
          testID="home-recommendation-dismiss"
        >
          <View style={styles.dismissBadge}>
            <Ionicons name="close" size={14} color={colors.textPrimary} />
          </View>
        </Pressable>
      ) : null}
      <View style={styles.meta}>
        <AppText variant="bodySmall" numberOfLines={2} style={styles.title}>
          {item.title}
        </AppText>
        {lastDayLine ? (
          <AppText variant="caption" numberOfLines={1} style={styles.lastDay}>
            {lastDayLine}
          </AppText>
        ) : metadataLine ? (
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
  dismissAnchor: {
    position: 'absolute',
    top: spacing.xs,
    left: spacing.xs,
    zIndex: 4,
  },
  dismissBadge: {
    width: 26,
    height: 26,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(10, 10, 15, 0.72)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255, 255, 255, 0.28)',
    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 1 },
    elevation: 4,
  },
  platformAnchor: {
    position: 'absolute',
    top: spacing.xs,
    left: spacing.xs,
    zIndex: 3,
  },
  lastDay: {
    color: colors.accent,
    fontWeight: '600',
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
