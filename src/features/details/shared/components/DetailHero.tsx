import { memo, useCallback, useMemo, useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppText } from '@/components/common/AppText';
import { ImageViewerModal } from '@/features/gallery/components/ImageViewerModal';
import { createGalleryImageFromPath } from '@/features/gallery/utils/gallery-images';
import { CatalogImage } from './CatalogImage';
import { DetailHeroPosterFrame } from './DetailHeroPosterFrame';
import { DetailMetadataRow } from './DetailMetadataRow';
import { DetailHeroMedia } from './DetailHeroMedia';
import { translateGenreNames } from '@/i18n/catalog-labels';
import { shouldShowOriginalTitle } from '@/utils/format';
import { layout } from '@/theme/layout';
import { spacing } from '@/theme/spacing';
import { interaction } from '@/theme/interaction';
import type { CatalogShareContentType } from '@/features/sharing/build-catalog-share-url';

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
  posterFooter?: ReactNode;
  trailer?: {
    contentType: 'movie' | 'tv';
    contentId: string;
  };
  share?: {
    contentType: CatalogShareContentType;
    contentId: string;
    releaseDate?: string | null;
    firstAirDate?: string | null;
  };
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
  posterFooter,
  trailer,
  share,
}: DetailHeroProps) {
  const { t } = useTranslation();
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const heroHeight = useMemo(
    () => Math.round(Math.min(320, Math.max(220, width * 0.52))),
    [width],
  );

  const heroImagePath = useStillAsHero ? stillPath : (backdropPath ?? posterPath);
  const showPoster = !useStillAsHero;
  const showPosterFooter = Boolean(posterFooter && showPoster);
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

  const posterLabel =
    posterAccessibilityLabel ?? t('common.posterAccessibility', { title });

  const posterNode =
    showPoster && posterPath ? (
      <Pressable
        onPress={openPosterViewer}
        accessibilityRole="button"
        accessibilityLabel={posterLabel}
        accessibilityHint={t('details.sections.opensPortraitFullscreen')}
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
    ) : null;

  return (
    <View>
      <DetailHeroMedia
        key={trailer?.contentId ?? 'detail-hero-media'}
        heroImagePath={heroImagePath}
        heroHeight={heroHeight}
        topOffset={insets.top + spacing.sm}
        trailer={trailer}
        share={
          share
            ? {
                contentType: share.contentType,
                contentId: share.contentId,
                title,
                releaseDate: share.releaseDate,
                firstAirDate: share.firstAirDate,
              }
            : undefined
        }
      />

      <View style={styles.content}>
        {breadcrumb ? (
          <AppText variant="caption" muted numberOfLines={1}>
            {breadcrumb}
          </AppText>
        ) : null}

        <View style={styles.heroIdentity}>
          <View style={styles.titleRow}>
            {showPoster && posterNode ? (
              <DetailHeroPosterFrame>{posterNode}</DetailHeroPosterFrame>
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
                  {translateGenreNames(genres).join(' · ')}
                </AppText>
              ) : null}
              {identityAccessory}
            </View>
          </View>
          {showPosterFooter ? (
            <View style={styles.posterFooterRow}>
              <View style={styles.posterFooterSlot}>{posterFooter}</View>
            </View>
          ) : null}
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
  content: {
    marginTop: -layout.posterCarousel.height * 0.35,
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  heroIdentity: {
    gap: spacing.xs,
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
    minWidth: 0,
  },
  posterFooterRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  posterFooterSlot: {
    width: layout.posterCarousel.width,
    maxWidth: '100%',
  },
  posterPressed: {
    opacity: interaction.pressedOpacity,
  },
});

