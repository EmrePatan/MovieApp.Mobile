import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';
import { AppText } from '@/components/common/AppText';
import { PosterImage } from '@/components/common/PosterImage';
import type { RecommendationItem } from '@/features/recommendations/types';
import { formatCatalogYear, formatContentType, formatRating } from '@/utils/format';
import { colors } from '@/theme/colors';
import { interaction } from '@/theme/interaction';
import { layout } from '@/theme/layout';
import { borderRadius, spacing } from '@/theme/spacing';

interface AiRecommendationResultCardProps {
  item: RecommendationItem;
  onPress?: (item: RecommendationItem) => void;
}

export const AiRecommendationResultCard = memo(function AiRecommendationResultCard({
  item,
  onPress,
}: AiRecommendationResultCardProps) {
  const { t } = useTranslation();
  const year = formatCatalogYear(item.releaseDate, item.year);
  const metadataLine = [formatContentType(item.type), year, `★ ${formatRating(item.voteAverage)}`]
    .filter(Boolean)
    .join(' · ');
  const reasonLabel = t('aiRecommendations.whyItFits');
  const accessibilityLabel = `${item.title}, ${metadataLine}${
    item.reason ? `, ${reasonLabel}: ${item.reason}` : ''
  }`;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={() => onPress?.(item)}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <PosterImage
        uri={item.posterUrl}
        width={layout.posterList.width}
        height={layout.posterList.height}
        accessibilityLabel={`${item.title} poster`}
        elevated
      />
      <View style={styles.meta}>
        <AppText variant="bodySmall" numberOfLines={2} style={styles.title}>
          {item.title}
        </AppText>
        <AppText variant="caption" muted numberOfLines={1}>
          {metadataLine}
        </AppText>
        {item.reason ? (
          <View style={styles.reasonWrap}>
            <AppText variant="caption" style={styles.reasonLabel}>
              {reasonLabel}
            </AppText>
            <AppText variant="caption" style={styles.reason}>
              {item.reason}
            </AppText>
          </View>
        ) : null}
      </View>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    paddingVertical: spacing.sm,
  },
  pressed: {
    opacity: interaction.pressedOpacity,
  },
  meta: {
    flex: 1,
    gap: spacing.xs,
    paddingTop: spacing.xs,
    minHeight: layout.posterList.height - spacing.xs,
    justifyContent: 'center',
  },
  title: {
    color: colors.textPrimary,
    fontWeight: '600',
  },
  reasonWrap: {
    marginTop: spacing.xs,
    borderRadius: borderRadius.md,
    backgroundColor: colors.accentTint12,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    gap: 2,
  },
  reasonLabel: {
    color: colors.accent,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    fontSize: 10,
    lineHeight: 14,
  },
  reason: {
    color: colors.textSecondary,
    lineHeight: 18,
  },
});
