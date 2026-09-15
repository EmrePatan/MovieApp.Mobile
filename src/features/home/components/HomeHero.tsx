import { memo, useCallback, useMemo, useState } from 'react';
import { Image, Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { getHomeHeroHeight } from '../utils/home-hero-layout';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '@/components/common/AppText';
import { FavoriteButton } from '@/features/favorites/components/FavoriteButton';
import { BackdropImage } from '@/features/details/shared/components/CatalogImage';
import { HomeHeroMetadata } from './HomeHeroMetadata';
import type { HomeItem } from '../types';
import { formatCatalogYear, formatContentType, formatRating } from '@/utils/format';
import { resolveImageUri } from '@/utils/image-url';
import { colors } from '@/theme/colors';
import { borderRadius, spacing } from '@/theme/spacing';
import { interaction } from '@/theme/interaction';

interface HomeHeroProps {
  item: HomeItem;
  onPress?: (item: HomeItem) => void;
  heroHeight?: number;
  embedded?: boolean;
  favoriteIsFavorited?: boolean;
  favoriteStatusResolved?: boolean;
  favoriteStatusPending?: boolean;
}

const HERO_EMBEDDED_PRESS_DELAY_MS = 120;
const HERO_MORE_INFO_MIN_WIDTH = 140;
const HERO_MORE_INFO_MAX_WIDTH = 160;
const HERO_FAVORITE_SIZE = 48;
const HERO_SCRIM_COLORS = [
  'rgba(10, 10, 15, 0)',
  'rgba(10, 10, 15, 0.45)',
  'rgba(10, 10, 15, 0.97)',
] as const;
const HERO_SCRIM_LOCATIONS = [0, 0.55, 1] as const;

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
    <LinearGradient
      colors={[...HERO_SCRIM_COLORS]}
      locations={[...HERO_SCRIM_LOCATIONS]}
      style={styles.scrim}
      pointerEvents="none"
    />
  );
}

function areHomeHeroPropsEqual(previous: HomeHeroProps, next: HomeHeroProps): boolean {
  return (
    previous.item.id === next.item.id &&
    previous.item.contentType === next.item.contentType &&
    previous.onPress === next.onPress &&
    previous.heroHeight === next.heroHeight &&
    previous.embedded === next.embedded &&
    previous.favoriteIsFavorited === next.favoriteIsFavorited &&
    previous.favoriteStatusResolved === next.favoriteStatusResolved &&
    previous.favoriteStatusPending === next.favoriteStatusPending
  );
}

export const HomeHero = memo(function HomeHero({
  item,
  onPress,
  heroHeight: heroHeightProp,
  embedded = false,
  favoriteIsFavorited,
  favoriteStatusResolved = false,
  favoriteStatusPending = false,
}: HomeHeroProps) {
  const { width } = useWindowDimensions();
  const [posterFailed, setPosterFailed] = useState(false);

  const heroHeight = useMemo(
    () => heroHeightProp ?? getHomeHeroHeight(width),
    [heroHeightProp, width],
  );

  const moreInfoWidth = useMemo(
    () =>
      Math.min(
        HERO_MORE_INFO_MAX_WIDTH,
        Math.max(HERO_MORE_INFO_MIN_WIDTH, Math.round(width * 0.38)),
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

  const handleHeroPress = useCallback(() => {
    onPress?.(item);
  }, [item, onPress]);

  return (
    <View
      style={[styles.container, embedded && styles.containerEmbedded]}
      accessibilityRole="summary"
      accessibilityLabel={accessibilityLabel}
    >
      <View style={[styles.mediaShell, { height: heroHeight }]}>
        <View style={[styles.mediaContainer, { height: heroHeight }]}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Open ${item.title}`}
            delayPressIn={embedded ? HERO_EMBEDDED_PRESS_DELAY_MS : undefined}
            onPress={handleHeroPress}
            style={[styles.mediaPressable, { height: heroHeight }]}
          >
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
          </Pressable>
          <View style={styles.layout} pointerEvents="box-none">
            <View style={styles.contentSpacer} pointerEvents="none" />
            <View style={[styles.content, { paddingBottom: contentPaddingBottom }]} pointerEvents="box-none">
              <View style={styles.contentBlock} pointerEvents="none">
                <HomeHeroMetadata
                  contentType={item.contentType}
                  releaseDate={item.releaseDate}
                  voteAverage={item.voteAverage}
                />
                <AppText variant="title" numberOfLines={2} style={styles.title}>
                  {item.title}
                </AppText>
              </View>
              <View style={styles.actions}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`More info about ${item.title}`}
                  onPress={handleHeroPress}
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
                    favoriteIsFavorited={favoriteIsFavorited}
                    favoriteStatusResolved={favoriteStatusResolved}
                    favoriteStatusPending={favoriteStatusPending}
                  />
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
  containerEmbedded: {
    marginBottom: 0,
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
  mediaPressable: {
    width: '100%',
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
  layout: {
    ...StyleSheet.absoluteFill,
    zIndex: 2,
    justifyContent: 'space-between',
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
