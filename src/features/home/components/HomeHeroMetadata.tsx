import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '@/components/common/AppText';
import type { ContentType } from '@/models/api/pagination';
import { formatCatalogYear, formatContentType, formatRating } from '@/utils/format';
import { colors } from '@/theme/colors';
import { HOME_HERO_RATING_CHIP_HEIGHT } from '../utils/home-hero-metadata-metrics';
import { borderRadius, spacing } from '@/theme/spacing';

interface HomeHeroMetadataProps {
  contentType: ContentType;
  releaseDate: string | null;
  voteAverage: number;
}

export function HomeHeroMetadata({
  contentType,
  releaseDate,
  voteAverage,
}: HomeHeroMetadataProps) {
  const { t } = useTranslation();
  const year = formatCatalogYear(releaseDate, null);
  const typeLabel = formatContentType(contentType);
  const hasRating = voteAverage > 0;
  const ratingLabel = hasRating
    ? t('common.ratingAccessibility', { rating: formatRating(voteAverage) })
    : null;
  const accessibilityParts = [typeLabel, ratingLabel, year].filter(Boolean);

  return (
    <View
      style={styles.row}
      accessibilityLabel={accessibilityParts.length > 0 ? accessibilityParts.join(', ') : undefined}
    >
      {typeLabel ? (
        <AppText variant="bodySmall" style={styles.detail} numberOfLines={1}>
          {typeLabel}
        </AppText>
      ) : null}
      <View style={styles.ratingChip} accessibilityLabel={ratingLabel ?? undefined}>
        <Ionicons name="star" size={12} color={colors.accent} />
        {hasRating ? (
          <AppText variant="caption" style={styles.ratingText}>
            {formatRating(voteAverage)}
          </AppText>
        ) : null}
      </View>
      {year ? (
        <AppText variant="bodySmall" style={styles.detail} numberOfLines={1}>
          {year}
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: spacing.sm,
    minHeight: HOME_HERO_RATING_CHIP_HEIGHT,
  },
  detail: {
    color: colors.textSecondary,
    letterSpacing: 0.25,
  },
  ratingChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    minHeight: HOME_HERO_RATING_CHIP_HEIGHT,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.borderAccent,
  },
  ratingText: {
    color: colors.accent,
    fontWeight: '700',
  },
});
