import { Fragment, useCallback, useMemo, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Image, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '@/components/common/AppText';
import { SkeletonBlock } from '@/components/loading/SkeletonBlock';
import { ExternalRatingProviderBrand } from '@/features/external-ratings/components/ExternalRatingProviderBrand';
import { resolveRottenTomatoesCardIcons } from '@/features/external-ratings/config/external-rating-provider-brand-config';
import type { ExternalRatingsMediaType } from '@/features/external-ratings/types';
import { useExternalRatings } from '@/features/external-ratings/hooks/useExternalRatings';
import { useRatingAggregate } from '@/features/ratings/hooks/useRatings';
import type { RatingContentType } from '@/features/ratings/types';
import {
  formatCommunityRatingAccessibilityLabel,
  formatCommunityRatingRailCountLabel,
  formatCommunityStarRatingDisplay,
} from '@/features/ratings/utils/star-rating';
import {
  buildExternalRatingRailDisplayItems,
  type ExternalRatingRailItem,
} from '../utils/format-external-rating-rail';
import { openReviewsDetail } from '../navigation/reviews-detail-navigation';
import { buildMovieReviewsRoute, buildTvReviewsRoute } from '../routes';
import { colors } from '@/theme/colors';
import { layout } from '@/theme/layout';
import { spacing } from '@/theme/spacing';
import { interaction } from '@/theme/interaction';

const COMMUNITY_RAIL_HIT_SLOP = { top: 10, bottom: 10, left: 6, right: 6 } as const;

export const DETAIL_ULTRA_THIN_RATING_RAIL_LAYOUT = {
  minHeight: 28,
  paddingVertical: spacing.xs,
  itemGap: spacing.sm,
  separatorHeight: 14,
  communityStarSize: 14,
  communityScoreFontSize: 15,
  communityCountFontSize: 11,
  providerScoreFontSize: 13,
  rtIconSize: 15,
  rtPairGap: spacing.xs,
} as const;

interface DetailUltraThinRatingRailProps {
  contentType: RatingContentType;
  contentId: string;
  showCommunityScore?: boolean;
  /** Catalog TMDB vote average when external-ratings snapshot has no TMDB row. */
  catalogTmdbVoteAverage?: number;
  contentTitle?: string;
}

export function DetailUltraThinRatingRail({
  contentType,
  contentId,
  showCommunityScore = true,
  catalogTmdbVoteAverage,
  contentTitle,
}: DetailUltraThinRatingRailProps) {
  const router = useRouter();
  const aggregateQuery = useRatingAggregate(contentType, contentId);
  const externalMediaType: ExternalRatingsMediaType =
    contentType === 'movie' ? 'movie' : 'tv';
  const externalQuery = useExternalRatings(externalMediaType, contentId);

  const externalItems = useMemo(() => {
    const includeScorePlaceholders =
      externalQuery.isLoading && externalQuery.data == null;

    return buildExternalRatingRailDisplayItems(
      externalQuery.data?.ratings ?? [],
      {
        catalogTmdbVoteAverage,
        includeScorePlaceholders,
      },
    );
  }, [
    catalogTmdbVoteAverage,
    externalQuery.data,
    externalQuery.isLoading,
  ]);

  const communityMeta = useMemo(() => {
    const aggregate = aggregateQuery.data;
    if (!aggregate || aggregate.ratingCount <= 0) {
      return null;
    }

    return {
      stars: formatCommunityStarRatingDisplay(aggregate.averageScore),
      countLabel: formatCommunityRatingRailCountLabel(aggregate.ratingCount),
      accessibilityLabel: formatCommunityRatingAccessibilityLabel(
        aggregate.averageScore,
        aggregate.ratingCount,
      ),
    };
  }, [aggregateQuery.data]);

  const handleCommunityPress = useCallback(() => {
    if (!contentTitle) {
      return;
    }

    const reviewsRoute =
      contentType === 'movie'
        ? buildMovieReviewsRoute(contentId, { title: contentTitle })
        : buildTvReviewsRoute(contentId, { title: contentTitle });

    openReviewsDetail(router, reviewsRoute);
  }, [contentId, contentTitle, contentType, router]);

  if (externalQuery.isError && !communityMeta && !showCommunityScore) {
    return null;
  }

  if (
    !showCommunityScore &&
    externalItems.length === 0 &&
    !externalQuery.isLoading &&
    !externalQuery.isError
  ) {
    return null;
  }

  if (
    !showCommunityScore &&
    externalItems.length === 0 &&
    externalQuery.isError
  ) {
    return null;
  }

  if (
    showCommunityScore &&
    !communityMeta &&
    externalItems.length === 0 &&
    !aggregateQuery.isError
  ) {
    return (
      <View style={styles.wrapper} testID="detail-ultra-thin-rating-rail">
        <View style={styles.row}>
          <CommunityZeroSegment
            onPress={contentTitle ? handleCommunityPress : undefined}
          />
        </View>
      </View>
    );
  }

  const segments: Array<'community' | ExternalRatingRailItem> = [];
  if (showCommunityScore) {
    segments.push('community');
  }
  segments.push(...externalItems);

  if (segments.length === 0) {
    return null;
  }

  return (
    <View style={styles.wrapper} testID="detail-ultra-thin-rating-rail">
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.row}
        keyboardShouldPersistTaps="handled"
      >
        {segments.map((segment, index) => (
          <Fragment key={segment === 'community' ? 'community' : segment.id}>
            {index > 0 ? <RailSeparator /> : null}
            {segment === 'community' ? (
              communityMeta ? (
                <CommunityScoreSegment
                  communityMeta={communityMeta}
                  onPress={contentTitle ? handleCommunityPress : undefined}
                />
              ) : (
                <CommunityZeroSegment
                  onPress={contentTitle ? handleCommunityPress : undefined}
                />
              )
            ) : (
              <ExternalRailSegment item={segment} />
            )}
          </Fragment>
        ))}
      </ScrollView>
    </View>
  );
}

function RailSeparator() {
  return (
    <View
      style={styles.separator}
      accessibilityElementsHidden
      importantForAccessibility="no"
    />
  );
}

function CommunitySegmentChrome({
  accessibilityLabel,
  onPress,
  testID,
  children,
}: {
  accessibilityLabel: string;
  onPress?: () => void;
  testID: string;
  children: ReactNode;
}) {
  const { t } = useTranslation();
  const label = onPress
    ? `${accessibilityLabel}. ${t('ratings.communityRailOpenReviews')}`
    : accessibilityLabel;

  if (!onPress) {
    return (
      <View
        style={styles.segment}
        accessibilityRole="text"
        accessibilityLabel={label}
        testID={testID}
      >
        {children}
      </View>
    );
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      hitSlop={COMMUNITY_RAIL_HIT_SLOP}
      style={({ pressed }) => [styles.segment, styles.communityPressable, pressed && styles.pressed]}
      testID="detail-rail-community-button"
    >
      {children}
    </Pressable>
  );
}

function CommunityScoreSegment({
  communityMeta,
  onPress,
}: {
  communityMeta: {
    stars: string;
    countLabel: string;
    accessibilityLabel: string;
  };
  onPress?: () => void;
}) {
  return (
    <CommunitySegmentChrome
      accessibilityLabel={communityMeta.accessibilityLabel}
      onPress={onPress}
      testID="detail-rail-community-score"
    >
      <Ionicons
        name="star"
        size={DETAIL_ULTRA_THIN_RATING_RAIL_LAYOUT.communityStarSize}
        color={colors.accentStrong}
        accessibilityElementsHidden
        importantForAccessibility="no"
      />
      <AppText style={styles.communityScore}>{communityMeta.stars}</AppText>
      <AppText style={styles.communityCount}>{communityMeta.countLabel}</AppText>
    </CommunitySegmentChrome>
  );
}

function CommunityZeroSegment({ onPress }: { onPress?: () => void }) {
  const { t } = useTranslation();

  return (
    <CommunitySegmentChrome
      accessibilityLabel={t('ratings.communityRailEmptyAccessibility')}
      onPress={onPress}
      testID="detail-rail-community-zero"
    >
      <Ionicons
        name="star"
        size={DETAIL_ULTRA_THIN_RATING_RAIL_LAYOUT.communityStarSize}
        color={colors.accentStrong}
        accessibilityElementsHidden
        importantForAccessibility="no"
      />
      <AppText style={styles.communityScore}>0</AppText>
    </CommunitySegmentChrome>
  );
}

function ExternalRailSegment({ item }: { item: ExternalRatingRailItem }) {
  if (item.kind === 'rotten-tomatoes') {
    return <RottenTomatoesRailSegment item={item} />;
  }

  return (
    <View
      style={styles.segment}
      accessible
      accessibilityLabel={item.accessibilityLabel}
      testID={`detail-rail-external-${item.id}`}
    >
      <ExternalRatingProviderBrand source={item.source} variant="compact" />
      <RailProviderScore item={item} />
    </View>
  );
}

function RailProviderScore({
  item,
}: {
  item: ExternalRatingRailItem;
}) {
  if (item.scorePending) {
    return (
      <SkeletonBlock
        width={32}
        height={DETAIL_ULTRA_THIN_RATING_RAIL_LAYOUT.providerScoreFontSize}
      />
    );
  }

  return <AppText style={styles.providerScore}>{item.valueLabel}</AppText>;
}

function RottenTomatoesRailSegment({
  item,
}: {
  item: Extract<ExternalRatingRailItem, { kind: 'rotten-tomatoes' }>;
}) {
  const icons = resolveRottenTomatoesCardIcons();
  const iconSource =
    item.id === 'tomatometer' ? icons.tomatometerIcon : icons.popcornIcon;

  return (
    <View
      style={styles.segment}
      accessible
      accessibilityLabel={item.accessibilityLabel}
      testID={`detail-rail-external-${item.id}`}
    >
      <Image
        source={iconSource}
        style={{
          width: DETAIL_ULTRA_THIN_RATING_RAIL_LAYOUT.rtIconSize,
          height: DETAIL_ULTRA_THIN_RATING_RAIL_LAYOUT.rtIconSize,
        }}
        resizeMode="contain"
        fadeDuration={0}
        accessibilityElementsHidden
        importantForAccessibility="no"
      />
      <RailProviderScore item={item} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: layout.screenPaddingHorizontal,
    paddingVertical: DETAIL_ULTRA_THIN_RATING_RAIL_LAYOUT.paddingVertical,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: DETAIL_ULTRA_THIN_RATING_RAIL_LAYOUT.minHeight,
    gap: DETAIL_ULTRA_THIN_RATING_RAIL_LAYOUT.itemGap,
    paddingRight: spacing.sm,
  },
  segment: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DETAIL_ULTRA_THIN_RATING_RAIL_LAYOUT.rtPairGap,
    flexShrink: 0,
  },
  communityPressable: {
    marginVertical: -spacing.xs,
    paddingVertical: spacing.xs,
  },
  pressed: {
    opacity: interaction.pressedOpacity,
  },
  separator: {
    width: StyleSheet.hairlineWidth,
    height: DETAIL_ULTRA_THIN_RATING_RAIL_LAYOUT.separatorHeight,
    backgroundColor: colors.borderSubtle,
    flexShrink: 0,
  },
  communityScore: {
    color: colors.textPrimary,
    fontSize: DETAIL_ULTRA_THIN_RATING_RAIL_LAYOUT.communityScoreFontSize,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  communityCount: {
    color: colors.textMuted,
    fontSize: DETAIL_ULTRA_THIN_RATING_RAIL_LAYOUT.communityCountFontSize,
    fontWeight: '500',
    fontVariant: ['tabular-nums'],
  },
  providerScore: {
    color: colors.textSecondary,
    fontSize: DETAIL_ULTRA_THIN_RATING_RAIL_LAYOUT.providerScoreFontSize,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
});
