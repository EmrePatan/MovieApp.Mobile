import { StyleSheet, View } from 'react-native';
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

const CHIP_HEIGHT = 30;
const SKELETON_CHIP_WIDTH = 88;

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
        <View style={styles.chipRow}>
          {Array.from({ length: 3 }, (_, index) => (
            <SkeletonBlock
              key={index}
              width={SKELETON_CHIP_WIDTH}
              height={CHIP_HEIGHT}
              style={styles.chipSkeleton}
            />
          ))}
        </View>
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
      <View style={styles.chipRow}>
        {cards.map((card) => (
          <View
            key={card.id}
            style={styles.chip}
            accessible
            accessibilityLabel={card.accessibilityLabel}
          >
            <ExternalRatingProviderBrand source={card.source} variant="compact" />
            <AppText style={styles.scoreLine} numberOfLines={1}>
              {card.scoreLine}
            </AppText>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    paddingHorizontal: layout.screenPaddingHorizontal,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    height: CHIP_HEIGHT,
    maxWidth: '100%',
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.borderSubtle,
    backgroundColor: colors.surfaceElevated,
  },
  chipSkeleton: {
    borderRadius: 8,
  },
  scoreLine: {
    flexShrink: 1,
    color: colors.textPrimary,
    fontSize: 12,
    fontWeight: '600',
  },
});
