import { ScrollView, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { AppText } from '@/components/common/AppText';
import { HomeSectionHeader } from '@/features/home/components/HomeSectionHeader';
import { SkeletonBlock } from '@/components/loading/SkeletonBlock';
import type { ExternalRatingsMediaType } from '../types';
import { useExternalRatings } from '../hooks/useExternalRatings';
import { buildExternalRatingCards } from '../utils/format-external-rating';
import { ExternalRatingProviderBrand } from './ExternalRatingProviderBrand';
import { colors } from '@/theme/colors';
import { layout } from '@/theme/layout';
import { spacing } from '@/theme/spacing';

const CARD_WIDTH = 156;
const CARD_HEIGHT = 88;

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
          contentContainerStyle={styles.listContent}
        >
          {Array.from({ length: 3 }, (_, index) => (
            <SkeletonBlock
              key={index}
              width={CARD_WIDTH}
              height={CARD_HEIGHT}
              style={styles.cardSkeleton}
            />
          ))}
        </ScrollView>
      </View>
    );
  }

  if (query.isError || !query.data?.ratings?.length) {
    return null;
  }

  const cards = buildExternalRatingCards(query.data.ratings);
  if (!cards.length) {
    return null;
  }

  return (
    <View style={styles.container} testID="other-ratings-section">
      <HomeSectionHeader title={t('details.sections.otherRatings')} />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      >
        {cards.map((card) => (
          <View
            key={card.id}
            style={styles.card}
            accessible
            accessibilityLabel={card.accessibilityLabel}
          >
            <ExternalRatingProviderBrand source={card.source} />
            <AppText style={styles.scoreLine}>{card.scoreLine}</AppText>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
  },
  listContent: {
    paddingHorizontal: layout.screenPaddingHorizontal,
    gap: spacing.sm,
  },
  card: {
    width: CARD_WIDTH,
    minHeight: CARD_HEIGHT,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.borderSubtle,
    backgroundColor: colors.surfaceElevated,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    justifyContent: 'space-between',
  },
  cardSkeleton: {
    borderRadius: 12,
  },
  scoreLine: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '600',
    marginTop: spacing.sm,
  },
});
