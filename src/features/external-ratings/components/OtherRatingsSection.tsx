import { ScrollView, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { HomeSectionHeader } from '@/features/home/components/HomeSectionHeader';
import { SkeletonBlock } from '@/components/loading/SkeletonBlock';
import type { ExternalRatingsMediaType } from '../types';
import { useExternalRatings } from '../hooks/useExternalRatings';
import { buildExternalRatingCards } from '../utils/format-external-rating';
import { EXTERNAL_RATING_CARD_LAYOUT } from '../config/external-rating-card-visuals';
import { ExternalRatingCard } from './ExternalRatingCard';
import { colors } from '@/theme/colors';
import { layout } from '@/theme/layout';
import { spacing } from '@/theme/spacing';

const SKELETON_CARD_WIDTH = 108;

interface OtherRatingsSectionProps {
  mediaType: ExternalRatingsMediaType;
  contentId: string;
}

export function OtherRatingsSection({ mediaType, contentId }: OtherRatingsSectionProps) {
  const { t } = useTranslation();
  const query = useExternalRatings(mediaType, contentId);

  if (query.isLoading && !query.data) {
    return (
      <View style={styles.container} testID="other-ratings-loading">
        <HomeSectionHeader title={t('details.sections.otherRatings')} />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.carouselContent}
        >
          {Array.from({ length: 3 }, (_, index) => (
            <SkeletonBlock
              key={index}
              width={SKELETON_CARD_WIDTH}
              height={EXTERNAL_RATING_CARD_LAYOUT.minHeight}
              style={styles.cardSkeleton}
            />
          ))}
        </ScrollView>
      </View>
    );
  }

  if (query.isError) {
    return null;
  }

  const ratings = query.data?.ratings;
  if (!ratings?.length) {
    return null;
  }

  const cards = buildExternalRatingCards(ratings);
  if (!cards.length) {
    return null;
  }

  return (
    <View style={styles.container} testID="other-ratings-section">
      <HomeSectionHeader title={t('details.sections.otherRatings')} />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.carouselContent}
        decelerationRate="fast"
      >
        {cards.map((card) => (
          <ExternalRatingCard key={card.id} card={card} />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  carouselContent: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: spacing.sm,
    paddingHorizontal: layout.screenPaddingHorizontal,
  },
  cardSkeleton: {
    borderRadius: EXTERNAL_RATING_CARD_LAYOUT.borderRadius,
    backgroundColor: colors.skeleton,
  },
});
