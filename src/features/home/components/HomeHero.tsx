import { memo, useCallback, useMemo, useState } from 'react';
import { Image, Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '@/components/common/AppText';
import { FavoriteButton } from '@/features/favorites/components/FavoriteButton';
import { BackdropImage } from '@/features/details/shared/components/CatalogImage';
import { HomeHeader } from './HomeHeader';
import { HomeHeroMetadata } from './HomeHeroMetadata';
import { HomeTypeFilterControl } from './HomeTypeFilterControl';
import type { HomeItem, HomeTypeFilter } from '../types';
import { formatCatalogYear, formatContentType, formatRating } from '@/utils/format';
import { resolveImageUri } from '@/utils/image-url';
import { colors } from '@/theme/colors';
import { borderRadius, spacing } from '@/theme/spacing';
import { interaction } from '@/theme/interaction';

interface HomeHeroProps {
  item: HomeItem;
  typeFilter: HomeTypeFilter;
  onTypeFilterChange: (value: HomeTypeFilter) => void;
  onPress?: (item: HomeItem) => void;
}

const HERO_MORE_INFO_MIN_WIDTH = 160;
const HERO_MORE_INFO_MAX_WIDTH = 180;
const HERO_FAVORITE_SIZE = 48;
const HERO_SCRIM_STRIP_COUNT = 40;
const HERO_BACKGROUND_RGB = '10, 10, 15';

function buildHeroScrimOpacities(stripCount: number): number[] {
  return Array.from({ length: stripCount }, (_, index) => {
    const progress = index / (stripCount - 1);
    const smoothstep = progress * progress * (3 - 2 * progress);
    return Math.pow(smoothstep, 1.35) * 0.97;
  });
}

const HERO_SCRIM_OPACITIES = buildHeroScrimOpacities(HERO_SCRIM_STRIP_COUNT);

function HeroPosterFallback({
  uri,
  height,
  onError,
}: {
  uri: string;
  height: number;
  onError: () => void;
}) {
  return (
    <Image
      source={{ uri }}
      style={[styles.media, { height }]}
      resizeMode="cover"
      accessibilityIgnoresInvertColors
      onError={onError}
    />
  );
}

function HeroMediaPlaceholder({ height }: { height: number }) {
  return (
    <View style={[styles.mediaPlaceholder, { height }]} accessibilityRole="image">
      <Ionicons name="film-outline" size={40} color={colors.textMuted} />
    </View>
  );
}

function HeroScrim() {
  return (
    <View style={styles.scrim} pointerEvents="none">
      {HERO_SCRIM_OPACITIES.map((opacity, index) => (
        <View
          key={index}
          style={[
            styles.scrimStrip,
            { backgroundColor: `rgba(${HERO_BACKGROUND_RGB}, ${opacity})` },
          ]}
        />
      ))}
    </View>
  );
}

function areHomeHeroPropsEqual(previous: HomeHeroProps, next: HomeHeroProps): boolean {
  return (
    previous.item.id === next.item.id &&
    previous.onPress === next.onPress &&
    previous.typeFilter === next.typeFilter &&
    previous.onTypeFilterChange === next.onTypeFilterChange
  );
}

export const HomeHero = memo(function HomeHero({
  item,
  typeFilter,
  onTypeFilterChange,
  onPress,
}: HomeHeroProps) {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [posterFailed, setPosterFailed] = useState(false);

  const heroHeight = useMemo(
    () => Math.round(Math.min(520, Math.max(340, width * 0.68))),
    [width],
  );

  const moreInfoWidth = useMemo(
    () =>
      Math.min(
        HERO_MORE_INFO_MAX_WIDTH,
        Math.max(HERO_MORE_INFO_MIN_WIDTH, Math.round(width * 0.44)),
      ),
    [width],
  );

  const contentPaddingBottom = useMemo(
    () => Math.max(spacing.lg, Math.round(heroHeight * 0.07)),
    [heroHeight],
  );

  const year = formatCatalogYear(item.releaseDate, null);
  const ratingLabel = item.voteAverage > 0 ? `rating ${formatRating(item.voteAverage)}` : null;
  const hasBackdrop = Boolean(resolveImageUri(item.backdropUrl));
  const posterUri = resolveImageUri(item.posterUrl);
  const showPosterFallback = !hasBackdrop && Boolean(posterUri) && !posterFailed;

  const accessibilityLabel = [
    'Featured',
    item.title,
    formatContentType(item.contentType),
    year,
    ratingLabel,
  ]
    .filter(Boolean)
    .join(', ');

  const handleMoreInfo = useCallback(() => {
    onPress?.(item);
  }, [item, onPress]);

  return (
    <View
      style={styles.container}
      accessibilityRole="summary"
      accessibilityLabel={accessibilityLabel}
    >
      <View style={[styles.mediaShell, { height: heroHeight }]}>
        <View style={[styles.mediaContainer, { height: heroHeight }]}>
          {hasBackdrop ? (
            <BackdropImage path={item.backdropUrl} height={heroHeight} />
          ) : showPosterFallback ? (
            <HeroPosterFallback
              uri={posterUri!}
              height={heroHeight}
              onError={() => setPosterFailed(true)}
            />
          ) : (
            <HeroMediaPlaceholder height={heroHeight} />
          )}
          <HeroScrim />
          <View style={styles.layout}>
            <View style={[styles.topChrome, { paddingTop: insets.top + spacing.xs }]}>
              <HomeHeader overlay />
              <HomeTypeFilterControl
                value={typeFilter}
                onChange={onTypeFilterChange}
                overlay
              />
            </View>
            <View style={styles.contentSpacer} />
            <View style={[styles.content, { paddingBottom: contentPaddingBottom }]}>
              <View style={styles.contentBlock}>
                <HomeHeroMetadata
                  contentType={item.contentType}
                  releaseDate={item.releaseDate}
                  voteAverage={item.voteAverage}
                />
                <AppText variant="title" numberOfLines={2} style={styles.title}>
                  {item.title}
                </AppText>
                <View style={styles.actions}>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`More info about ${item.title}`}
                    onPress={handleMoreInfo}
                    style={({ pressed }) => [
                      styles.moreInfoButton,
                      { width: moreInfoWidth },
                      pressed && styles.moreInfoPressed,
                    ]}
                  >
                    <AppText variant="bodySmall" style={styles.moreInfoLabel}>
                      More Info
                    </AppText>
                  </Pressable>
                  <View style={styles.favoriteWrap}>
                    <FavoriteButton
                      contentType={item.contentType}
                      contentId={item.id}
                      size={HERO_FAVORITE_SIZE}
                    />
                  </View>
                </View>
              </View>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}, areHomeHeroPropsEqual);

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.sm,
  },
  mediaShell: {
    width: '100%',
    backgroundColor: colors.background,
  },
  mediaContainer: {
    width: '100%',
    overflow: 'hidden',
    backgroundColor: colors.surfaceElevated,
  },
  media: {
    width: '100%',
  },
  mediaPlaceholder: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceElevated,
  },
  scrim: {
    ...StyleSheet.absoluteFill,
  },
  scrimStrip: {
    flex: 1,
  },
  layout: {
    ...StyleSheet.absoluteFill,
    zIndex: 2,
    justifyContent: 'space-between',
  },
  topChrome: {
    gap: spacing.xs,
  },
  contentSpacer: {
    flex: 1,
    minHeight: spacing.xl,
  },
  content: {
    paddingHorizontal: spacing.lg,
  },
  contentBlock: {
    gap: 0,
  },
  title: {
    color: colors.textPrimary,
    marginTop: spacing.sm,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  moreInfoButton: {
    minHeight: 44,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  moreInfoPressed: {
    opacity: interaction.pressedOpacity,
  },
  moreInfoLabel: {
    color: colors.textPrimary,
    fontWeight: '600',
  },
  favoriteWrap: {
    width: HERO_FAVORITE_SIZE,
    height: HERO_FAVORITE_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
