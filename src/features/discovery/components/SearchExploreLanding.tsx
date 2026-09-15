import { useCallback } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '@/components/common/AppText';
import { useGenres } from '../hooks/useGenres';
import { createAdvancedDiscoverHref } from '../utils/advanced-discover-params';
import { createDiscoverHref } from '../utils/discover-params';
import { ExploreGenreSection } from './ExploreGenreSection';
import { colors } from '@/theme/colors';
import { borderRadius, spacing } from '@/theme/spacing';

interface SearchExploreLandingProps {
  onItemPress: (item: import('@/features/home/types').HomeItem) => void;
}

export function SearchExploreLanding(_props: SearchExploreLandingProps) {
  const router = useRouter();
  const genresQuery = useGenres();

  const handleGenrePress = useCallback(
    (genreId: string) => {
      router.push(
        createDiscoverHref({
          mode: 'trending',
          type: 'all',
          filters: { genreIds: [genreId] },
        }),
      );
    },
    [router],
  );

  const openAdvancedDiscover = useCallback(() => {
    router.push(createAdvancedDiscoverHref());
  }, [router]);

  return (
    <View style={styles.container}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Advanced Discover"
        onPress={openAdvancedDiscover}
        style={({ pressed }) => [styles.advancedEntry, pressed && styles.pressed]}
      >
        <Ionicons name="options-outline" size={20} color={colors.accent} />
        <View style={styles.advancedEntryText}>
          <AppText variant="body" style={styles.advancedEntryTitle}>
            Advanced Discover
          </AppText>
          <AppText variant="bodySmall" muted>
            Filter movies and TV shows by genre, rating, year, runtime, and more.
          </AppText>
        </View>
        <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
      </Pressable>
      <ExploreGenreSection
        genres={genresQuery.data ?? []}
        onGenrePress={handleGenrePress}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: spacing.sm,
    gap: spacing.lg,
  },
  advancedEntry: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginHorizontal: spacing.lg,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  advancedEntryText: {
    flex: 1,
    gap: spacing.xs,
  },
  advancedEntryTitle: {
    fontWeight: '600',
  },
  pressed: {
    opacity: 0.85,
  },
});
