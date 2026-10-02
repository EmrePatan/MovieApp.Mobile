import { useCallback, useMemo } from 'react';
import { FlatList, Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { AppText } from '@/components/common/AppText';
import { translateGenreName } from '@/i18n/catalog-labels';
import { createAdvancedDiscoverHref } from '@/features/discovery/utils/advanced-discover-params';
import { createDiscoverHref } from '@/features/discovery/utils/discover-params';
import { openLibraryStackScreen } from '@/features/library/navigation/library-stack-navigation';
import { useGenres } from '@/features/discovery/hooks/useGenres';
import {
  resolveDiscoverGenreCanonicalName,
  selectDiscoverHubGenres,
} from '@/features/discovery/main-discover-genres';
import type { Genre } from '@/features/discovery/types';
import { colors } from '@/theme/colors';
import { layout } from '@/theme/layout';
import { borderRadius, spacing } from '@/theme/spacing';
import { interaction } from '@/theme/interaction';

const HUB_RAIL_VISIBLE_COLUMNS = 3;
const HUB_RAIL_GAP = spacing.sm;

const GENRE_TILE_GRADIENTS: Record<string, readonly [string, string, string]> = {
  action: ['#5C1C1C', '#8E2E2E', '#1A0C0C'],
  adventure: ['#1C4A34', '#2F7A52', '#0C1610'],
  animation: ['#24356E', '#3E5CB8', '#10141F'],
  comedy: ['#6A4A16', '#C4923A', '#1A140C'],
  crime: ['#2C2438', '#5A4A78', '#100E14'],
  drama: ['#4A2430', '#8A4458', '#140C10'],
  fantasy: ['#1E3A44', '#3E7A88', '#0C1416'],
  horror: ['#3A1014', '#7A1E28', '#10080A'],
  mystery: ['#1A2430', '#3A4E66', '#0C1014'],
  romance: ['#5A2038', '#A84870', '#160C12'],
  'science fiction': ['#16304A', '#2E6A9A', '#0C1218'],
  thriller: ['#242424', '#4A4A4A', '#0C0C0C'],
};

function genreGradient(name: string): readonly [string, string, string] {
  const canonical = resolveDiscoverGenreCanonicalName(name) ?? name;
  return GENRE_TILE_GRADIENTS[canonical.trim().toLowerCase()] ?? ['#242430', '#3A3A4A', '#101014'];
}

export function GenresHubSection() {
  const { t } = useTranslation();
  const router = useRouter();
  const { width: windowWidth } = useWindowDimensions();
  const genresQuery = useGenres();
  const genres = useMemo(
    () => selectDiscoverHubGenres(genresQuery.data ?? []),
    [genresQuery.data],
  );

  const hubTileSize = useMemo(() => {
    const contentWidth = Math.min(windowWidth, layout.maxContentWidth);
    const innerWidth = contentWidth - spacing.lg * 2;
    const tileWidth =
      (innerWidth - HUB_RAIL_GAP * (HUB_RAIL_VISIBLE_COLUMNS - 1)) / HUB_RAIL_VISIBLE_COLUMNS;

    return {
      width: tileWidth,
      height: tileWidth / layout.posterAspectRatio,
    };
  }, [windowWidth]);

  const openAllGenres = useCallback(() => {
    router.push(createAdvancedDiscoverHref());
  }, [router]);

  const openGenre = useCallback(
    (genre: Genre) => {
      openLibraryStackScreen(
        router,
        createDiscoverHref({
          mode: 'popular',
          type: 'all',
          filters: { genreIds: [genre.id] },
        }),
        '/discover',
      );
    },
    [router],
  );

  if (genres.length === 0) {
    return null;
  }

  return (
    <View style={styles.section} testID="genres-hub">
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Ionicons name="grid-outline" size={18} color={colors.accent} />
          <AppText variant="subtitle" style={styles.title} accessibilityRole="header">
            {t('discover.genresHub.title')}
          </AppText>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('discover.genresHub.seeAllAccessibility')}
          onPress={openAllGenres}
          hitSlop={8}
          style={({ pressed }) => [styles.seeAllButton, pressed && styles.pressed]}
          testID="genres-hub-see-all"
        >
          <AppText variant="bodySmall" style={styles.seeAllLabel}>
            {t('discover.genresHub.seeAll')}
          </AppText>
          <Ionicons name="chevron-forward" size={16} color={colors.accent} />
        </Pressable>
      </View>

      <FlatList
        horizontal
        data={genres}
        key={hubTileSize.width}
        keyExtractor={(item) => item.id}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.genreList}
        renderItem={({ item }) => {
          const label = translateGenreName(item.name);
          const gradient = genreGradient(item.name);

          return (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('discover.genresHub.openGenre', { genre: label })}
              onPress={() => openGenre(item)}
              style={({ pressed }) => [
                styles.tile,
                { width: hubTileSize.width, height: hubTileSize.height },
                pressed && styles.pressed,
              ]}
              testID={`genre-hub-tile-${item.id}`}
            >
              <LinearGradient
                colors={[gradient[0], gradient[1], gradient[2]]}
                locations={[0, 0.42, 1]}
                start={{ x: 0.1, y: 0 }}
                end={{ x: 0.9, y: 1 }}
                style={StyleSheet.absoluteFill}
              />
              <AppText variant="subtitle" style={styles.tileLabel} numberOfLines={3}>
                {label}
              </AppText>
            </Pressable>
          );
        }}
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
    flex: 1,
  },
  title: {
    flexShrink: 1,
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  seeAllLabel: {
    color: colors.accent,
    fontWeight: '600',
  },
  pressed: {
    opacity: interaction.pressedOpacity,
  },
  genreList: {
    paddingHorizontal: spacing.lg,
    gap: HUB_RAIL_GAP,
  },
  tile: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.borderAccent,
    justifyContent: 'flex-end',
    padding: spacing.sm,
    backgroundColor: colors.background,
  },
  tileLabel: {
    color: colors.textPrimary,
    fontWeight: '700',
  },
});
