import { memo, useMemo } from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppText } from '@/components/common/AppText';
import { BackdropImage, CatalogImage } from './CatalogImage';
import { DetailBackButton } from './DetailBackButton';
import { DetailMetadataRow } from './DetailMetadataRow';
import { DetailScrim } from './DetailScrim';
import { shouldShowOriginalTitle } from '@/utils/format';
import { layout } from '@/theme/layout';
import { colors } from '@/theme/colors';
import { borderRadius, spacing } from '@/theme/spacing';

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
}: DetailHeroProps) {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const heroHeight = useMemo(
    () => Math.round(Math.min(320, Math.max(220, width * 0.52))),
    [width],
  );

  const heroImagePath = useStillAsHero ? stillPath : backdropPath;
  const showPoster = !useStillAsHero;

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
          {showPoster ? (
            <CatalogImage
              path={posterPath}
              width={layout.posterCarousel.width}
              height={layout.posterCarousel.height}
              accessibilityLabel={posterAccessibilityLabel ?? `${title} poster`}
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
          </View>
        </View>
      </View>
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
});
