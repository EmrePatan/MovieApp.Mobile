import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { isApiError } from '@/api/errors';
import { AppButton } from '@/components/buttons/AppButton';
import { AppText } from '@/components/common/AppText';
import { ErrorView } from '@/components/common/ErrorView';
import { ContentTypeBadge } from '@/components/content/ContentTypeBadge';
import { PosterImage } from '@/components/common/PosterImage';
import { DetailBackButton } from '@/features/details/shared/components/DetailScreenScaffold';
import { BackdropImage } from '@/features/details/shared/components/CatalogImage';
import { openCatalogDetailFromTab } from '@/features/details/shared/navigation/open-catalog-detail-from-tab';
import { usePickSomething } from '@/features/discovery/hooks/usePickSomething';
import {
  PICK_SOMETHING_MEDIA_OPTIONS,
  type PickSomethingMediaType,
} from '@/features/discovery/pick-something-types';
import { PRODUCT_METRICS } from '@/features/metrics/product-metric-types';
import { trackProductMetric } from '@/features/metrics/track-product-metric';
import { SearchEmptyState } from '@/features/search/components/SearchEmptyState';
import { formatCatalogYear, formatRating } from '@/utils/format';
import { resolveImageUri } from '@/utils/image-url';
import { colors } from '@/theme/colors';
import { borderRadius, spacing } from '@/theme/spacing';
import { layout } from '@/theme/layout';

const RETURN_ROUTE = '/pick-something';

interface PickSomethingHeroPick {
  title: string;
  posterUrl: string | null | undefined;
  backdropUrl: string | null | undefined;
}

function PickSomethingHeroMedia({
  pick,
  height,
}: {
  pick: PickSomethingHeroPick;
  height: number;
}) {
  const [posterFailed, setPosterFailed] = useState(false);
  const posterUri = resolveImageUri(pick.posterUrl);

  if (pick.backdropUrl) {
    return (
      <View style={styles.heroWrap} testID="pick-something-hero-backdrop">
        <BackdropImage path={pick.backdropUrl} height={height} />
        <View style={styles.heroOverlay}>
          <PosterImage
            uri={pick.posterUrl}
            width={layout.posterCarousel.width + 24}
            height={layout.posterCarousel.height + 36}
            accessibilityLabel={`${pick.title} poster`}
            elevated
          />
        </View>
      </View>
    );
  }

  if (posterUri && !posterFailed) {
    return (
      <View style={styles.heroWrap} testID="pick-something-hero-poster-cover">
        <Image
          source={{ uri: posterUri }}
          style={[styles.heroCoverMedia, { height }]}
          resizeMode="cover"
          accessibilityRole="image"
          accessibilityLabel={`${pick.title} poster`}
          onError={() => setPosterFailed(true)}
        />
      </View>
    );
  }

  return (
    <View style={styles.heroWrap} testID="pick-something-hero-placeholder">
      <View style={[styles.heroMediaPlaceholder, { height }]} accessibilityRole="image">
        <Ionicons name="film-outline" size={40} color={colors.textMuted} />
      </View>
    </View>
  );
}

export default function PickSomethingScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { width } = useWindowDimensions();
  const [mediaType, setMediaType] = useState<PickSomethingMediaType>('all');
  const [sessionExcludedIds, setSessionExcludedIds] = useState<string[]>([]);
  const hasTrackedMetricRef = useRef(false);

  const pickQuery = usePickSomething(mediaType, sessionExcludedIds);
  const pick = pickQuery.data?.item ?? null;

  useEffect(() => {
    if (pick && !hasTrackedMetricRef.current) {
      trackProductMetric(PRODUCT_METRICS.pickSomethingUsed);
      hasTrackedMetricRef.current = true;
    }
  }, [pick]);

  const handleMediaTypeChange = useCallback((nextMediaType: PickSomethingMediaType) => {
    setMediaType(nextMediaType);
    setSessionExcludedIds([]);
  }, []);

  const handleTryAnother = useCallback(() => {
    if (!pick?.id) {
      return;
    }

    setSessionExcludedIds((current) =>
      current.includes(pick.id) ? current : [...current, pick.id],
    );
  }, [pick?.id]);

  const handleViewDetails = useCallback(() => {
    if (!pick) {
      return;
    }

    openCatalogDetailFromTab(router, pick.id, pick.type, 'discover', {
      queryClient,
      libraryReturnHref: RETURN_ROUTE,
    });
  }, [pick, queryClient, router]);

  const heroHeight = useMemo(() => Math.round(width * 0.42), [width]);

  const content = useMemo(() => {
    if (pickQuery.isLoading || pickQuery.isFetching) {
      return (
        <View style={styles.stateContainer}>
          <ActivityIndicator size="large" color={colors.accent} />
          <AppText variant="bodySmall" muted style={styles.loadingMessage}>
            Finding something for you...
          </AppText>
        </View>
      );
    }

    if (pickQuery.isError) {
      const message = isApiError(pickQuery.error)
        ? pickQuery.error.userMessage
        : 'Unable to pick something right now.';

      return (
        <View style={styles.stateContainer}>
          <ErrorView message={message} onRetry={() => void pickQuery.refetch()} retryLabel="Try Again" />
        </View>
      );
    }

    if (!pick) {
      return (
        <View style={styles.stateContainer}>
          <SearchEmptyState
            title="Nothing to pick right now"
            message="Try a different media type or check back after more titles are available in the catalog."
          />
        </View>
      );
    }

    const year = formatCatalogYear(pick.releaseDate, pick.year);

    return (
      <View style={styles.resultCard}>
        <PickSomethingHeroMedia pick={pick} height={heroHeight} />

        <View style={styles.resultCopy}>
          <AppText variant="title" accessibilityRole="header">
            {pick.title}
          </AppText>
          <View style={styles.metaRow}>
            <ContentTypeBadge type={pick.type} />
            {year ? (
              <AppText variant="bodySmall" muted>
                {year}
              </AppText>
            ) : null}
            <AppText variant="bodySmall" muted>
              ★ {formatRating(pick.voteAverage)}
            </AppText>
          </View>
          {pick.reason ? (
            <AppText variant="bodySmall" muted>
              {pick.reason}
            </AppText>
          ) : null}
        </View>

        <View style={styles.actions}>
          <AppButton title="Try Another" variant="secondary" onPress={handleTryAnother} />
          <AppButton title="View Details" onPress={handleViewDetails} />
        </View>
      </View>
    );
  }, [
    handleTryAnother,
    handleViewDetails,
    heroHeight,
    pick,
    pickQuery.error,
    pickQuery.isError,
    pickQuery.isFetching,
    pickQuery.isLoading,
    pickQuery.refetch,
  ]);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <DetailBackButton />
          <View style={styles.headerCopy}>
            <AppText variant="title" accessibilityRole="header">
              Pick Something For Me
            </AppText>
            <AppText variant="bodySmall" muted>
              One personalized pick to help you decide fast
            </AppText>
          </View>
        </View>

        <View style={styles.mediaTypeRow} accessibilityRole="tablist">
          {PICK_SOMETHING_MEDIA_OPTIONS.map((option) => {
            const selected = option.value === mediaType;

            return (
              <Pressable
                key={option.value}
                accessibilityRole="tab"
                accessibilityState={{ selected }}
                accessibilityLabel={option.label}
                onPress={() => handleMediaTypeChange(option.value)}
                style={({ pressed }) => [
                  styles.mediaTypeChip,
                  selected && styles.mediaTypeChipSelected,
                  pressed && styles.pressed,
                ]}
              >
                <AppText
                  variant="caption"
                  style={[styles.mediaTypeLabel, selected && styles.mediaTypeLabelSelected]}
                >
                  {option.label}
                </AppText>
              </Pressable>
            );
          })}
        </View>

        {content}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingBottom: spacing.xxl,
    gap: spacing.lg,
  },
  header: {
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  headerCopy: {
    gap: spacing.xs,
  },
  mediaTypeRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  mediaTypeChip: {
    minHeight: 36,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mediaTypeChipSelected: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  mediaTypeLabel: {
    color: colors.textSecondary,
    fontWeight: '500',
  },
  mediaTypeLabelSelected: {
    color: colors.textPrimary,
    fontWeight: '600',
  },
  pressed: {
    opacity: 0.85,
  },
  stateContainer: {
    paddingHorizontal: spacing.lg,
    minHeight: 280,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.md,
  },
  loadingMessage: {
    textAlign: 'center',
  },
  resultCard: {
    paddingHorizontal: spacing.lg,
    gap: spacing.lg,
  },
  heroWrap: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    backgroundColor: colors.surface,
  },
  heroCoverMedia: {
    width: '100%',
  },
  heroMediaPlaceholder: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceElevated,
  },
  heroOverlay: {
    position: 'absolute',
    left: spacing.lg,
    bottom: spacing.lg,
  },
  resultCopy: {
    gap: spacing.sm,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  actions: {
    gap: spacing.sm,
  },
});
