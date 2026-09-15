import { memo, useCallback, useMemo, useState, type ReactNode } from 'react';
import { Pressable, StyleSheet, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppText } from '@/components/common/AppText';
import { ImageViewerModal } from '@/features/gallery/components/ImageViewerModal';
import { createGalleryImageFromPath } from '@/features/gallery/utils/gallery-images';
import { BackdropImage, CatalogImage } from './CatalogImage';
import { DetailBackButton } from './DetailBackButton';
import { DetailMetadataRow } from './DetailMetadataRow';
import { DetailScrim } from './DetailScrim';
import { shouldShowOriginalTitle } from '@/utils/format';
import { layout } from '@/theme/layout';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { interaction } from '@/theme/interaction';

export interface DetailHeroProps {
  title: string;
  originalTitle?: string | null;
  posterPath?: string | null;
  backdropPath?: string | null;
  stillPath?: string | null;
  metadataLine: string;
  genres?: string[];
  breadcrumb?: string | null;
  posterAccessibilityLabel?: string;
  useStillAsHero?: boolean;
  identityAccessory?: ReactNode;
}

export const DetailHero = memo(function DetailHero({
  title,
  originalTitle,
  posterPath,
  backdropPath,
  stillPath,
  metadataLine,
  genres = [],
  breadcrumb,
  posterAccessibilityLabel,
  useStillAsHero = false,
  identityAccessory,
}: DetailHeroProps) {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const heroHeight = useMemo(
    () => Math.round(Math.min(320, Math.max(220, width * 0.52))),
    [width],
  );

  const heroImagePath = useStillAsHero ? stillPath : backdropPath;
  const showPoster = !useStillAsHero;
  const [isPosterViewerOpen, setIsPosterViewerOpen] = useState(false);

  const posterImages = useMemo(
    () => (posterPath ? [createGalleryImageFromPath(posterPath, 'poster')] : []),
    [posterPath],
  );

  const openPosterViewer = useCallback(() => {
    if (posterPath) {
      setIsPosterViewerOpen(true);
    }
  }, [posterPath]);

  const closePosterViewer = useCallback(() => {
    setIsPosterViewerOpen(false);
  }, []);

  const posterLabel = posterAccessibilityLabel ?? `${title} poster`;

  return (
    <View style={styles.container}>
      <View style={[styles.mediaContainer, { height: heroHeight }]}>
        <BackdropImage path={heroImagePath} height={heroHeight} />
        <DetailScrim />
        <DetailBackButton variant="overlay" topOffset={insets.top + spacing.sm} />
      </View>

      <View style={styles.content}>
        {breadcrumb ? (
          <AppText variant="caption" muted numberOfLines={1}>
            {breadcrumb}
          </AppText>
        ) : null}

        <View style={styles.titleRow}>
          {showPoster && posterPath ? (
            <Pressable
              onPress={openPosterViewer}
              accessibilityRole="button"
              accessibilityLabel={posterLabel}
              accessibilityHint="Opens full screen poster"
              style={({ pressed }) => [pressed && styles.posterPressed]}
              testID="detail-hero-poster"
            >
              <CatalogImage
                path={posterPath}
                width={layout.posterCarousel.width}
                height={layout.posterCarousel.height}
                accessibilityLabel={posterLabel}
              />
            </Pressable>
          ) : showPoster ? (
            <CatalogImage
              path={posterPath}
              width={layout.posterCarousel.width}
              height={layout.posterCarousel.height}
              accessibilityLabel={posterLabel}
            />
          ) : null}
          <View style={styles.titleBlock}>
            <AppText variant="title" numberOfLines={3}>
              {title}
            </AppText>
            {shouldShowOriginalTitle(title, originalTitle) ? (
              <AppText variant="bodySmall" muted numberOfLines={2}>
                {originalTitle}
              </AppText>
            ) : null}
            <DetailMetadataRow value={metadataLine} />
            {genres.length > 0 ? (
              <AppText variant="caption" muted numberOfLines={2}>
                {genres.join(' · ')}
              </AppText>
            ) : null}
            {identityAccessory}
          </View>
        </View>
      </View>

      {isPosterViewerOpen ? (
        <ImageViewerModal
          visible
          images={posterImages}
          initialIndex={0}
          onClose={closePosterViewer}
        />
      ) : null}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.sm,
  },
  mediaContainer: {
    width: '100%',
    backgroundColor: colors.surfaceElevated,
    overflow: 'hidden',
  },
  content: {
    marginTop: -layout.posterCarousel.height * 0.35,
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  titleRow: {
    flexDirection: 'row',
    gap: spacing.md,
    alignItems: 'flex-end',
  },
  titleBlock: {
    flex: 1,
    gap: spacing.xs,
    paddingBottom: spacing.xs,
  },
  posterPressed: {
    opacity: interaction.pressedOpacity,
  },
});
