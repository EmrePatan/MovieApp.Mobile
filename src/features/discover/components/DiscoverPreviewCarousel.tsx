import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import { DISCOVER_HUB_RAIL_GAP } from '@/features/discover/discover-hub-rail-tile';
import { useDiscoverHubRailTileSize } from '@/features/discover/useDiscoverHubRailTileSize';
import { useTranslation } from 'react-i18next';
import { AppText } from '@/components/common/AppText';
import { PosterImage } from '@/components/common/PosterImage';
import type { SearchResultItem } from '@/features/search/types';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
interface DiscoverPreviewCarouselProps {
  title: string;
  items: SearchResultItem[];
  onItemPress: (item: SearchResultItem) => void;
  onSeeAll?: () => void;
  testID?: string;
}

export function DiscoverPreviewCarousel({
  title,
  items,
  onItemPress,
  onSeeAll,
  testID,
}: DiscoverPreviewCarouselProps) {
  const { t } = useTranslation();
  const tileSize = useDiscoverHubRailTileSize();

  if (items.length === 0) {
    return null;
  }

  return (
    <View style={styles.section} testID={testID}>
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
        key={tileSize.width}
        keyExtractor={(item) => `${item.type}-${item.id}`}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={item.title}
            onPress={() => onItemPress(item)}
            style={({ pressed }) => [
              styles.card,
              { width: tileSize.width },
              pressed && styles.pressed,
            ]}
          >
            <PosterImage
              uri={item.posterUrl}
              width={tileSize.width}
              height={tileSize.height}
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
    gap: DISCOVER_HUB_RAIL_GAP,
  },
  card: {
    gap: spacing.xs,
  },
  cardTitle: {
    color: colors.textPrimary,
  },
  pressed: {
    opacity: 0.85,
  },
});
