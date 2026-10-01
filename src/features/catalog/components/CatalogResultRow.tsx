import { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '@/components/common/AppText';
import { PosterImage } from '@/components/common/PosterImage';
import { translateGenreNames } from '@/i18n/catalog-labels';
import { formatCatalogYear, formatContentType, formatRating } from '@/utils/format';
import { interaction } from '@/theme/interaction';
import { layout } from '@/theme/layout';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';

export interface CatalogResultRowProps {
  title: string;
  posterUrl: string | null;
  mediaType: 'movie' | 'tv';
  releaseDate?: string | null;
  year?: number | null;
  voteAverage?: number;
  genres?: string[];
  onPress?: () => void;
  testID?: string;
}

function buildMetadataLine(
  mediaType: 'movie' | 'tv',
  yearLabel: string | null,
): string | null {
  const typeLabel = formatContentType(mediaType);
  if (yearLabel) {
    return `${typeLabel} · ${yearLabel}`;
  }

  return typeLabel;
}

export const CatalogResultRow = memo(function CatalogResultRow({
  title,
  posterUrl,
  mediaType,
  releaseDate,
  year,
  voteAverage = 0,
  genres = [],
  onPress,
  testID,
}: CatalogResultRowProps) {
  const { t } = useTranslation();
  const yearLabel = formatCatalogYear(releaseDate ?? null, year ?? null);
  const metadataLine = buildMetadataLine(mediaType, yearLabel);
  const showRating = voteAverage > 0;
  const ratingLabel = showRating ? `★ ${formatRating(voteAverage)}` : null;
  const genreLabels = useMemo(() => translateGenreNames(genres), [genres]);
  const genreLine = genreLabels.length > 0 ? genreLabels.join(' · ') : null;

  const accessibilityLabel = useMemo(() => {
    const parts = [title, metadataLine, genreLine];
    if (showRating) {
      parts.push(formatRating(voteAverage));
    }

    return parts.filter(Boolean).join(', ');
  }, [genreLine, metadataLine, showRating, title, voteAverage]);

  const posterWidth = layout.posterCatalogRow.width;
  const posterHeight = layout.posterCatalogRow.height;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
      testID={testID}
    >
      <PosterImage
        uri={posterUrl}
        width={posterWidth}
        height={posterHeight}
        accessibilityLabel={t('common.posterAccessibility', { title })}
      />

      <View style={styles.body}>
        <AppText variant="bodySmall" numberOfLines={2} style={styles.title}>
          {title}
        </AppText>

        {metadataLine ? (
          <AppText variant="caption" muted numberOfLines={1} style={styles.metadata}>
            {metadataLine}
          </AppText>
        ) : null}

        {genreLine ? (
          <AppText variant="caption" muted numberOfLines={1} style={styles.genres}>
            {genreLine}
          </AppText>
        ) : null}

        {ratingLabel ? (
          <AppText variant="caption" numberOfLines={1} style={styles.rating}>
            {ratingLabel}
          </AppText>
        ) : null}
      </View>

      <View style={styles.chevronSlot} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
        <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
      </View>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: layout.screenPaddingHorizontal,
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.borderSubtle,
    maxWidth: layout.maxContentWidth,
    alignSelf: 'center',
    width: '100%',
  },
  pressed: {
    opacity: interaction.pressedOpacity,
    backgroundColor: colors.surface,
  },
  body: {
    flex: 1,
    gap: spacing.xs,
    paddingRight: spacing.xs,
    justifyContent: 'center',
    minWidth: 0,
  },
  title: {
    color: colors.textPrimary,
    fontWeight: '600',
  },
  metadata: {
    letterSpacing: 0.1,
  },
  genres: {
    letterSpacing: 0.1,
  },
  rating: {
    color: colors.accent,
    fontWeight: '600',
  },
  chevronSlot: {
    width: 28,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
});
