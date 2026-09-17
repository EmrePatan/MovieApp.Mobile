import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '@/components/common/AppText';
import { SkeletonBlock } from '@/components/loading/SkeletonBlock';
import { CatalogImage } from '@/features/details/shared/components/CatalogImage';
import type { SearchResultItem } from '@/features/search/types';
import { colors } from '@/theme/colors';
import { layout } from '@/theme/layout';
import { spacing } from '@/theme/spacing';

interface DiscoverPreviewSectionProps {
  title?: string;
  subtitle?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  hideTitle?: boolean;
  items: SearchResultItem[];
  isLoading?: boolean;
  isError?: boolean;
  emptyMessage?: string;
  onRetry?: () => void;
  onItemPress: (item: SearchResultItem) => void;
  onSeeAll?: () => void;
  testID?: string;
}

export function DiscoverPreviewSection({
  title,
  subtitle,
  icon,
  items,
  isLoading = false,
  isError = false,
  emptyMessage = 'Nothing to show right now.',
  onRetry,
  onItemPress,
  onSeeAll,
  testID,
  hideTitle = false,
}: DiscoverPreviewSectionProps) {
  const showHeader = !hideTitle && Boolean(title);

  if (!isLoading && !isError && items.length === 0) {
    return (
      <View style={styles.section} testID={testID}>
        {showHeader ? (
        <View style={styles.header}>
          <View style={styles.titleRow}>
            {icon ? <Ionicons name={icon} size={18} color={colors.accent} /> : null}
            <AppText variant="subtitle">{title}</AppText>
          </View>
        </View>
        ) : null}
        <AppText variant="bodySmall" muted style={styles.emptyMessage}>
          {emptyMessage}
        </AppText>
      </View>
    );
  }

  return (
    <View style={styles.section} testID={testID}>
      {showHeader ? (
      <View style={styles.header}>
        <View style={styles.titleRow}>
          {icon ? <Ionicons name={icon} size={18} color={colors.accent} /> : null}
          <View>
            <AppText variant="subtitle">{title}</AppText>
            {subtitle ? (
              <AppText variant="caption" muted>
                {subtitle}
              </AppText>
            ) : null}
          </View>
        </View>
        {onSeeAll && !isLoading && !isError && items.length > 0 ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`See All ${title}`}
            onPress={onSeeAll}
          >
            <AppText variant="bodySmall" style={styles.seeAll}>
              See All
            </AppText>
          </Pressable>
        ) : null}
      </View>
      ) : null}

      {isLoading ? (
        <FlatList
          horizontal
          data={[0, 1, 2, 3]}
          keyExtractor={(item) => `skeleton-${item}`}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          renderItem={() => (
            <View style={styles.card}>
              <SkeletonBlock
                width={layout.posterCarousel.width}
                height={layout.posterCarousel.height}
              />
              <SkeletonBlock width={layout.posterCarousel.width} height={12} />
            </View>
          )}
        />
      ) : null}

      {isError ? (
        <View style={styles.errorContainer}>
          <AppText variant="bodySmall" muted>
            Unable to load this section right now.
          </AppText>
          {onRetry ? (
            <Pressable accessibilityRole="button" accessibilityLabel={`Retry ${title}`} onPress={onRetry}>
              <AppText variant="bodySmall" style={styles.retry}>
                Try again
              </AppText>
            </Pressable>
          ) : null}
        </View>
      ) : null}

      {!isLoading && !isError && items.length > 0 ? (
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
                accessibilityLabel={`${item.title} poster`}
              />
              <AppText variant="caption" numberOfLines={2} style={styles.cardTitle}>
                {item.title}
              </AppText>
            </Pressable>
          )}
        />
      ) : null}
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
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
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
  errorContainer: {
    paddingHorizontal: spacing.lg,
    gap: spacing.xs,
  },
  retry: {
    color: colors.accent,
    fontWeight: '600',
  },
  emptyMessage: {
    paddingHorizontal: spacing.lg,
  },
});
