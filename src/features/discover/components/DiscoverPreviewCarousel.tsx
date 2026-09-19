import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { AppText } from '@/components/common/AppText';
import { CatalogImage } from '@/features/details/shared/components/CatalogImage';
import type { SearchResultItem } from '@/features/search/types';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { layout } from '@/theme/layout';

interface DiscoverPreviewCarouselProps {
  title: string;
  items: SearchResultItem[];
  onItemPress: (item: SearchResultItem) => void;
  onSeeAll?: () => void;
}

export function DiscoverPreviewCarousel({
  title,
  items,
  onItemPress,
  onSeeAll,
}: DiscoverPreviewCarouselProps) {
  const { t } = useTranslation();

  if (items.length === 0) {
    return null;
  }

  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <AppText variant="subtitle">{title}</AppText>
        {onSeeAll ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('common.seeAllTitle', { title })}
            onPress={onSeeAll}
          >
            <AppText variant="bodySmall" style={styles.seeAll}>
              {t('common.seeAll')}
            </AppText>
          </Pressable>
        ) : null}
      </View>
      <FlatList
        horizontal
        data={items}
        keyExtractor={(item) => `${item.type}-${item.id}`}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={item.title}
            onPress={() => onItemPress(item)}
            style={({ pressed }) => [styles.card, pressed && styles.pressed]}
          >
            <CatalogImage
              path={item.posterUrl}
              width={layout.posterCarousel.width}
              height={layout.posterCarousel.height}
              accessibilityLabel={t('common.posterAccessibility', { title: item.title })}
            />
            <AppText variant="caption" numberOfLines={2} style={styles.cardTitle}>
              {item.title}
            </AppText>
          </Pressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
  },
  seeAll: {
    color: colors.accent,
    fontWeight: '600',
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  card: {
    width: layout.posterCarousel.width,
    gap: spacing.xs,
  },
  cardTitle: {
    color: colors.textPrimary,
  },
  pressed: {
    opacity: 0.85,
  },
});
