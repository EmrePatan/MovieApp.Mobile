import { memo, useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Animated,
  Pressable,
  StyleSheet,
  useWindowDimensions,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { Image } from 'expo-image';
import {
  getHomeHeroCardWidth,
  getHomeHeroHeight,
  HERO_CAROUSEL_INACTIVE_OPACITY,
  HERO_CAROUSEL_INACTIVE_PEEK_TRANSLATE,
  HERO_CAROUSEL_INACTIVE_SCALE,
} from '../utils/home-hero-layout';
import { resolveHomeHeroPosterUri } from '../utils/home-hero-image';
import { Ionicons } from '@expo/vector-icons';
import { DetailDirectionalFrame } from '@/features/details/shared/components/DetailDirectionalFrame';
import { DETAIL_DIRECTIONAL_FRAME_BORDER } from '@/features/details/shared/detailDirectionalFrame';
import { HomeHeroMetadata } from './HomeHeroMetadata';
import { HomeHeroPaginationDots } from './HomeHeroPaginationDots';
import type { HomeItem } from '../types';
import { areHomeItemsVisuallyEqual } from '../utils/home-list-keys';
import { formatCatalogYear, formatContentType, formatRating } from '@/utils/format';
import { useRemoteImageLoadState } from '@/hooks/useRemoteImageLoadState';
import { REMOTE_IMAGE_CACHE_POLICY, type RemoteImagePriority } from '@/utils/cached-image';
import { colors } from '@/theme/colors';
import { borderRadius, spacing } from '@/theme/spacing';

interface HomeHeroProps {
  item: HomeItem;
  onPress?: (item: HomeItem) => void;
  heroHeight?: number;
  cardWidth?: number;
  embedded?: boolean;
  isActive?: boolean;
  scrollX?: Animated.Value;
  slideIndex?: number;
  snapInterval?: number;
  paginationCount?: number;
  paginationIndex?: number;
  /** Decode priority for this slide. On-screen peeks and the center are high. */
  imagePriority?: RemoteImagePriority;
  /**
   * Remount the poster once its frame has a size. Used for the leading loop
   * clone, whose first decode otherwise completes before the native view has bounds.
   */
  repaintPosterOnLayout?: boolean;
}

const HERO_EMBEDDED_PRESS_DELAY_MS = 120;

function HeroPosterImage({
  uri,
  recyclingKey,
  width,
  height,
  priority,
  repaintOnLayout,
  onError,
  onLoad,
  onLoadEnd,
}: {
  uri: string;
  recyclingKey: string;
  width: number;
  height: number;
  priority: RemoteImagePriority;
  /**
   * Inactive peeks remount the native image once the frame has a size.
   * The leading scroll child otherwise finishes its decode at empty bounds
   * and expo-image keeps the blank bitmap.
   */
  repaintOnLayout: boolean;
  onError: () => void;
  onLoad: () => void;
  onLoadEnd: () => void;
}) {
  const [paintGeneration, setPaintGeneration] = useState(0);
  const handleLayout = useCallback(() => {
    if (!repaintOnLayout || paintGeneration > 0) {
      return;
    }

    setPaintGeneration(1);
  }, [paintGeneration, repaintOnLayout]);

  return (
    <View collapsable={false} style={{ width, height }} onLayout={handleLayout}>
      <Image
        key={repaintOnLayout ? `${recyclingKey}:${paintGeneration}` : undefined}
        source={{ uri }}
        style={{ width, height }}
        contentFit="contain"
        cachePolicy={REMOTE_IMAGE_CACHE_POLICY}
        recyclingKey={recyclingKey}
        priority={priority}
        transition={null}
        accessibilityIgnoresInvertColors
        onError={onError}
        onLoad={onLoad}
        onLoadEnd={onLoadEnd}
      />
    </View>
  );
}

function HeroMediaPlaceholder({ width, height }: { width: number; height: number }) {
  return (
    <View
      style={[styles.mediaPlaceholder, { width, height }]}
      accessibilityRole="image"
    >
      <Ionicons name="film-outline" size={40} color={colors.textMuted} />
    </View>
  );
}

export const HomeHeroPosterCard = memo(function HomeHeroPosterCard({
  item,
  onPress,
  posterWidth,
  posterHeight,
  glow = true,
  animatedStyle,
  pressable = true,
  priority = 'high',
  repaintOnLayout = false,
}: {
  item: HomeItem;
  onPress?: (item: HomeItem) => void;
  posterWidth: number;
  posterHeight: number;
  glow?: boolean;
  animatedStyle?: StyleProp<ViewStyle>;
  pressable?: boolean;
  priority?: RemoteImagePriority;
  repaintOnLayout?: boolean;
}) {
  const { t } = useTranslation();
  const posterUri = resolveHomeHeroPosterUri(item.posterUrl);
  const posterLoad = useRemoteImageLoadState(
    posterUri ? `${item.id}:poster:${posterUri}` : null,
  );

  const innerWidth = posterWidth - DETAIL_DIRECTIONAL_FRAME_BORDER * 2;
  const innerHeight = posterHeight - DETAIL_DIRECTIONAL_FRAME_BORDER * 2;
  const innerRadius = borderRadius.lg - DETAIL_DIRECTIONAL_FRAME_BORDER;

  const handlePress = useCallback(() => {
    onPress?.(item);
  }, [item, onPress]);

  const framedCard = (
    <DetailDirectionalFrame
      variant="gold"
      borderRadius={borderRadius.lg}
      glow={glow}
      style={{ width: posterWidth, height: posterHeight }}
    >
      <View
        style={[
          styles.cardInner,
          {
            width: innerWidth,
            height: innerHeight,
            borderRadius: innerRadius,
          },
        ]}
      >
        {posterUri != null && !posterLoad.hasError ? (
          <HeroPosterImage
            uri={posterUri}
            recyclingKey={posterLoad.imageKey}
            width={innerWidth}
            height={innerHeight}
            priority={priority}
            repaintOnLayout={repaintOnLayout}
            onError={posterLoad.onImageError}
            onLoad={posterLoad.onImageLoad}
            onLoadEnd={posterLoad.onImageLoadEnd}
          />
        ) : (
          <HeroMediaPlaceholder width={innerWidth} height={innerHeight} />
        )}
      </View>
    </DetailDirectionalFrame>
  );

  const content = (
    <Animated.View style={[styles.posterShell, animatedStyle]}>{framedCard}</Animated.View>
  );

  if (!onPress) {
    return content;
  }

  return (
    <Pressable
      accessibilityRole={pressable ? 'button' : undefined}
      accessibilityLabel={
        pressable ? t('common.openTitle', { title: item.title }) : undefined
      }
      accessibilityState={{ disabled: !pressable }}
      disabled={!pressable}
      unstable_pressDelay={HERO_EMBEDDED_PRESS_DELAY_MS}
      onPress={handlePress}
      style={styles.pressable}
    >
      {content}
    </Pressable>
  );
});

function areHomeHeroPropsEqual(previous: HomeHeroProps, next: HomeHeroProps): boolean {
  return (
    areHomeItemsVisuallyEqual(previous.item, next.item) &&
    previous.onPress === next.onPress &&
    previous.heroHeight === next.heroHeight &&
    previous.cardWidth === next.cardWidth &&
    previous.embedded === next.embedded &&
    previous.isActive === next.isActive &&
    previous.slideIndex === next.slideIndex &&
    previous.snapInterval === next.snapInterval &&
    previous.paginationCount === next.paginationCount &&
    previous.paginationIndex === next.paginationIndex &&
    previous.imagePriority === next.imagePriority &&
    previous.repaintPosterOnLayout === next.repaintPosterOnLayout
  );
}

export const HomeHero = memo(function HomeHero({
  item,
  onPress,
  heroHeight: heroHeightProp,
  cardWidth: cardWidthProp,
  embedded = false,
  isActive = true,
  scrollX,
  slideIndex,
  snapInterval,
  paginationCount,
  paginationIndex,
  imagePriority,
  repaintPosterOnLayout = false,
}: HomeHeroProps) {
  const { t } = useTranslation();
  const { width } = useWindowDimensions();

  const posterHeight = useMemo(
    () => heroHeightProp ?? getHomeHeroHeight(width),
    [heroHeightProp, width],
  );

  const posterWidth = useMemo(
    () => cardWidthProp ?? getHomeHeroCardWidth(width),
    [cardWidthProp, width],
  );

  const year = formatCatalogYear(item.releaseDate, null);
  const ratingLabel =
    item.voteAverage > 0
      ? t('common.ratingAccessibility', { rating: formatRating(item.voteAverage) })
      : null;
  const accessibilityLabel = [
    t('home.featured'),
    item.title,
    formatContentType(item.contentType),
    year,
    ratingLabel,
  ]
    .filter(Boolean)
    .join(', ');

  const animatedStyle = useMemo(() => {
    if (scrollX == null || slideIndex == null || snapInterval == null || snapInterval <= 0) {
      if (!isActive) {
        return {
          opacity: HERO_CAROUSEL_INACTIVE_OPACITY,
          transform: [{ scale: HERO_CAROUSEL_INACTIVE_SCALE }],
        };
      }
      return undefined;
    }

    const inputRange = [
      (slideIndex - 1) * snapInterval,
      slideIndex * snapInterval,
      (slideIndex + 1) * snapInterval,
    ];

    return {
      opacity: scrollX.interpolate({
        inputRange,
        outputRange: [
          HERO_CAROUSEL_INACTIVE_OPACITY,
          1,
          HERO_CAROUSEL_INACTIVE_OPACITY,
        ],
        extrapolate: 'clamp',
      }),
      transform: [
        {
          translateX: scrollX.interpolate({
            inputRange,
            outputRange: [
              -HERO_CAROUSEL_INACTIVE_PEEK_TRANSLATE,
              0,
              HERO_CAROUSEL_INACTIVE_PEEK_TRANSLATE,
            ],
            extrapolate: 'clamp',
          }),
        },
        {
          scale: scrollX.interpolate({
            inputRange,
            outputRange: [
              HERO_CAROUSEL_INACTIVE_SCALE,
              1,
              HERO_CAROUSEL_INACTIVE_SCALE,
            ],
            extrapolate: 'clamp',
          }),
        },
      ],
    };
  }, [isActive, scrollX, slideIndex, snapInterval]);

  const isPosterPressable = Boolean(onPress) && isActive;

  const poster = (
    <HomeHeroPosterCard
      item={item}
      onPress={onPress}
      posterWidth={posterWidth}
      posterHeight={posterHeight}
      glow={isActive}
      animatedStyle={animatedStyle}
      pressable={isPosterPressable}
      priority={imagePriority ?? (isActive ? 'high' : 'low')}
      repaintOnLayout={repaintPosterOnLayout}
    />
  );

  if (embedded) {
    return (
      <View
        style={[
          styles.embeddedSlide,
          { width: snapInterval ?? posterWidth },
          isActive ? styles.embeddedSlideActive : styles.embeddedSlideInactive,
        ]}
        pointerEvents={isActive ? 'auto' : 'none'}
        accessibilityRole="summary"
        accessibilityLabel={accessibilityLabel}
        importantForAccessibility={isActive ? 'auto' : 'no-hide-descendants'}
        accessibilityElementsHidden={!isActive}
      >
        {poster}
      </View>
    );
  }

  return (
    <View style={styles.container} accessibilityRole="summary" accessibilityLabel={accessibilityLabel}>
      <View style={[styles.stage, { height: posterHeight }]}>{poster}</View>
      <View style={styles.footer}>
        <HomeHeroMetadata
          contentType={item.contentType}
          releaseDate={item.releaseDate}
          voteAverage={item.voteAverage}
        />
        {paginationCount != null && paginationIndex != null ? (
          <HomeHeroPaginationDots count={paginationCount} activeIndex={paginationIndex} />
        ) : null}
      </View>
    </View>
  );
}, areHomeHeroPropsEqual);

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.sm,
    alignItems: 'center',
  },
  embeddedSlide: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'visible',
  },
  embeddedSlideActive: {
    zIndex: 2,
    elevation: 6,
  },
  embeddedSlideInactive: {
    zIndex: 0,
    elevation: 0,
  },
  stage: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  pressable: {
    alignItems: 'center',
  },
  posterShell: {
    alignItems: 'center',
  },
  cardInner: {
    overflow: 'hidden',
    backgroundColor: colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mediaPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceElevated,
  },
  footer: {
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    gap: 6,
    width: '100%',
  },
});
