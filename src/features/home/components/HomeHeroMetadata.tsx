import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '@/components/common/AppText';
import type { ContentType } from '@/models/api/pagination';
import { formatCatalogYear, formatContentType, formatRating } from '@/utils/format';
import { colors } from '@/theme/colors';
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
  const year = formatCatalogYear(releaseDate, null);
  const typeLabel = formatContentType(contentType);
  const hasRating = voteAverage > 0;

  const detailParts = [typeLabel, year].filter(Boolean);

  return (
    <View style={styles.row}>
      {detailParts.length > 0 ? (
        <AppText
          variant="bodySmall"
          style={styles.detail}
          numberOfLines={1}
          accessibilityLabel={detailParts.join(', ')}
        >
          {detailParts.join('  •  ')}
        </AppText>
      ) : null}
      {hasRating ? (
        <View
          style={styles.ratingChip}
          accessibilityLabel={`Rating ${formatRating(voteAverage)}`}
        >
          <Ionicons name="star" size={12} color={colors.accent} />
          <AppText variant="caption" style={styles.ratingText}>
            {formatRating(voteAverage)}
          </AppText>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  detail: {
    color: 'rgba(245, 245, 247, 0.9)',
    letterSpacing: 0.25,
    textShadowColor: 'rgba(0, 0, 0, 0.45)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  ratingChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
    backgroundColor: 'rgba(10, 10, 15, 0.55)',
    borderWidth: 1,
    borderColor: colors.borderAccent,
  },
  ratingText: {
    color: colors.accent,
    fontWeight: '700',
  },
});
