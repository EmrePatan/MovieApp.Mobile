import { memo, useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Image, Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  getHomeHeroCardWidth,
  getHomeHeroHeight,
} from '../utils/home-hero-layout';
import { HOME_HERO_CARD_TILT, HOME_HERO_PERSPECTIVE } from './home-hero-perspective';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '@/components/common/AppText';
import { BackdropImage } from '@/features/details/shared/components/CatalogImage';
import { DetailDirectionalFrame } from '@/features/details/shared/components/DetailDirectionalFrame';
import { DETAIL_DIRECTIONAL_FRAME_BORDER } from '@/features/details/shared/detailDirectionalFrame';
import { HomeHeroMetadata } from './HomeHeroMetadata';
import type { HomeItem } from '../types';
import { areHomeItemsVisuallyEqual } from '../utils/home-list-keys';
import { formatCatalogYear, formatContentType, formatRating } from '@/utils/format';
import { resolveImageUri } from '@/utils/image-url';
import { colors } from '@/theme/colors';
import { borderRadius, spacing } from '@/theme/spacing';

interface HomeHeroProps {
  item: HomeItem;
  onPress?: (item: HomeItem) => void;
  heroHeight?: number;
  cardWidth?: number;
  embedded?: boolean;
}

const HERO_EMBEDDED_PRESS_DELAY_MS = 120;
const HERO_INFO_BAND_MIN_HEIGHT = 96;

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

function areHomeHeroPropsEqual(previous: HomeHeroProps, next: HomeHeroProps): boolean {
  return (
    areHomeItemsVisuallyEqual(previous.item, next.item) &&
    previous.onPress === next.onPress &&
    previous.heroHeight === next.heroHeight &&
    previous.cardWidth === next.cardWidth &&
    previous.embedded === next.embedded
  );
}

export const HomeHero = memo(function HomeHero({
  item,
  onPress,
  heroHeight: heroHeightProp,
  cardWidth: cardWidthProp,
  embedded = false,
}: HomeHeroProps) {
  const { t } = useTranslation();
  const { width } = useWindowDimensions();
  const [posterFailed, setPosterFailed] = useState(false);
  const [posterFailedItemId, setPosterFailedItemId] = useState(item.id);

  if (posterFailedItemId !== item.id) {
    setPosterFailedItemId(item.id);
    setPosterFailed(false);
  }

  const heroHeight = useMemo(
    () => heroHeightProp ?? getHomeHeroHeight(width),
    [heroHeightProp, width],
  );

  const cardWidth = useMemo(
    () => cardWidthProp ?? getHomeHeroCardWidth(width),
    [cardWidthProp, width],
  );

  const year = formatCatalogYear(item.releaseDate, null);
  const ratingLabel =
    item.voteAverage > 0
      ? t('common.ratingAccessibility', { rating: formatRating(item.voteAverage) })
      : null;
  const hasBackdrop = Boolean(resolveImageUri(item.backdropUrl));
  const posterUri = resolveImageUri(item.posterUrl);
  const showPosterFallback = !hasBackdrop && Boolean(posterUri) && !posterFailed;

  const accessibilityLabel = [
    t('home.featured'),
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

  const innerWidth = cardWidth - DETAIL_DIRECTIONAL_FRAME_BORDER * 2;
  const innerHeight = heroHeight - DETAIL_DIRECTIONAL_FRAME_BORDER * 2;
  const innerRadius = borderRadius.xl - DETAIL_DIRECTIONAL_FRAME_BORDER;

  const framedCard = (
    <DetailDirectionalFrame
      variant="gold"
      borderRadius={borderRadius.xl}
      glow
      style={{ width: cardWidth, height: heroHeight }}
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
        <View style={[styles.mediaLayer, { height: innerHeight }]} pointerEvents="none">
          {hasBackdrop ? (
            <BackdropImage path={item.backdropUrl} height={innerHeight} />
          ) : showPosterFallback ? (
            <HeroPosterFallback
              uri={posterUri!}
              height={innerHeight}
              onError={() => setPosterFailed(true)}
            />
          ) : (
            <HeroMediaPlaceholder height={innerHeight} />
          )}
        </View>

        <View style={styles.infoBand} pointerEvents="none">
          <LinearGradient
            colors={['rgba(10, 10, 15, 0)', 'rgba(10, 10, 15, 0.9)']}
            locations={[0, 1]}
            style={styles.infoFade}
            pointerEvents="none"
          />
          <View style={styles.infoContent}>
            <HomeHeroMetadata
              contentType={item.contentType}
              releaseDate={item.releaseDate}
              voteAverage={item.voteAverage}
            />
            <AppText variant="title" numberOfLines={2} style={styles.title}>
              {item.title}
            </AppText>
          </View>
        </View>
      </View>
    </DetailDirectionalFrame>
  );

  return (
    <View
      style={[styles.container, embedded && styles.containerEmbedded]}
      accessibilityRole="summary"
      accessibilityLabel={accessibilityLabel}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t('common.openTitle', { title: item.title })}
        unstable_pressDelay={embedded ? HERO_EMBEDDED_PRESS_DELAY_MS : undefined}
        onPress={handleHeroPress}
        style={styles.pressable}
      >
        <View style={[styles.perspectiveHost, { width: cardWidth, height: heroHeight }]}>
          <View style={styles.cardTilt}>{framedCard}</View>
        </View>
      </Pressable>
    </View>
  );
}, areHomeHeroPropsEqual);

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.sm,
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  containerEmbedded: {
    marginBottom: 0,
  },
  pressable: {
    alignItems: 'center',
  },
  perspectiveHost: {
    transform: [{ perspective: HOME_HERO_PERSPECTIVE }],
  },
  cardTilt: {
    transform: [
      { rotateX: HOME_HERO_CARD_TILT.rotateX },
      { rotateY: HOME_HERO_CARD_TILT.rotateY },
      { scale: HOME_HERO_CARD_TILT.scale },
    ],
    shadowColor: '#000000',
    shadowOffset: { width: 16, height: 20 },
    shadowOpacity: 0.45,
    shadowRadius: 22,
    elevation: 12,
  },
  cardInner: {
    overflow: 'hidden',
    backgroundColor: colors.surfaceElevated,
  },
  mediaLayer: {
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
  infoBand: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    minHeight: HERO_INFO_BAND_MIN_HEIGHT,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(10, 10, 15, 0.82)',
  },
  infoFade: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: -spacing.xl * 2,
    height: spacing.xl * 2,
  },
  infoContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.lg,
    gap: 2,
  },
  title: {
    color: colors.textPrimary,
  },
});
