import { useCallback, useState } from 'react';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '@/components/common/AppText';
import { openCatalogDetailFromTab } from '@/features/details/shared/navigation/open-catalog-detail-from-tab';
import { useWorldCinemaPreview } from '@/features/discovery/hooks/useWorldCinemaPreview';
import {
  DEFAULT_WORLD_CINEMA_MEDIA_TYPE,
  DEFAULT_WORLD_CINEMA_ORIGIN_COUNTRY,
} from '@/features/discovery/world-cinema-types';
import { WORLD_CINEMA_CURATED_COLLECTIONS } from '@/features/discovery/world-cinema-collections';
import { createWorldCinemaHref } from '@/features/discovery/utils/world-cinema-params';
import type { SearchResultItem } from '@/features/search/types';
import { useQueryClient } from '@tanstack/react-query';
import { DiscoverPreviewSection } from './DiscoverPreviewSection';
import { colors } from '@/theme/colors';
import { borderRadius, spacing } from '@/theme/spacing';

export function WorldCinemaHubSection() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [selectedOriginCountry, setSelectedOriginCountry] = useState(
    DEFAULT_WORLD_CINEMA_ORIGIN_COUNTRY,
  );
  const previewQuery = useWorldCinemaPreview(
    selectedOriginCountry,
    DEFAULT_WORLD_CINEMA_MEDIA_TYPE,
  );

  const selectedCollection = WORLD_CINEMA_CURATED_COLLECTIONS.find(
    (collection) => collection.originCountry === selectedOriginCountry,
  );

  const previewItems = (previewQuery.data?.items ?? []).filter(
    (item) => item.type === 'movie' || item.type === 'tv',
  );

  const handlePreviewItemPress = useCallback(
    (item: SearchResultItem) => {
      if (item.type === 'person') {
        return;
      }

      openCatalogDetailFromTab(router, item.id, item.type, 'discover', { queryClient });
    },
    [queryClient, router],
  );

  const openWorldCinema = useCallback(() => {
    router.push(
      createWorldCinemaHref({
        mediaType: DEFAULT_WORLD_CINEMA_MEDIA_TYPE,
        originCountry: selectedOriginCountry,
      }),
    );
  }, [router, selectedOriginCountry]);

  return (
    <View style={styles.section} testID="world-cinema-hub">
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Ionicons name="earth-outline" size={18} color={colors.accent} />
          <AppText variant="subtitle" accessibilityRole="header">
            World Cinema
          </AppText>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="See All World Cinema"
          onPress={openWorldCinema}
          style={({ pressed }) => [styles.exploreButton, pressed && styles.pressed]}
        >
          <AppText variant="bodySmall" style={styles.exploreLabel}>
            See All
          </AppText>
          <Ionicons name="chevron-forward" size={16} color={colors.accent} />
        </Pressable>
      </View>

      <FlatList
        horizontal
        data={WORLD_CINEMA_CURATED_COLLECTIONS}
        keyExtractor={(item) => item.originCountry}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipList}
        renderItem={({ item }) => {
          const selected = item.originCountry === selectedOriginCountry;

          return (
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ selected }}
              accessibilityLabel={item.label}
              onPress={() => setSelectedOriginCountry(item.originCountry)}
              style={({ pressed }) => [
                styles.chip,
                selected && styles.chipSelected,
                pressed && styles.pressed,
              ]}
              testID={`world-cinema-chip-${item.originCountry}`}
            >
              <AppText variant="bodySmall" style={selected ? styles.chipLabelSelected : undefined}>
                {item.label}
              </AppText>
            </Pressable>
          );
        }}
      />

      <DiscoverPreviewSection
        title={selectedCollection?.label ?? 'World Cinema'}
        subtitle="Movies and TV from this origin country"
        items={previewItems}
        isLoading={previewQuery.isLoading}
        isError={previewQuery.isError}
        onRetry={() => void previewQuery.refetch()}
        onItemPress={handlePreviewItemPress}
        onSeeAll={openWorldCinema}
        emptyMessage="No titles found for this cinema collection right now."
        testID="world-cinema-preview"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: spacing.md,
  },
  header: {
    paddingHorizontal: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  exploreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  exploreLabel: {
    color: colors.accent,
    fontWeight: '600',
  },
  chipList: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  chip: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginRight: spacing.sm,
  },
  chipSelected: {
    borderColor: colors.accent,
    backgroundColor: colors.accentTint12,
  },
  chipLabelSelected: {
    color: colors.accent,
    fontWeight: '600',
  },
  pressed: {
    opacity: 0.85,
  },
});
