import { useCallback, useMemo } from 'react';
import { FlatList, Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { AppText } from '@/components/common/AppText';
import { GenreHubPosterCard, type GenreHubTileSize } from '@/features/discovery/components/GenreHubPosterCard';
import { useGenreCoverSlots } from '@/features/discovery/hooks/useGenreCoverSlots';
import { useGenres } from '@/features/discovery/hooks/useGenres';
import { selectGenreHubRailGenres } from '@/features/discovery/main-discover-genres';
import { openLibraryStackScreen } from '@/features/library/navigation/library-stack-navigation';
import { colors } from '@/theme/colors';
import { interaction } from '@/theme/interaction';
import { layout } from '@/theme/layout';
import { spacing } from '@/theme/spacing';

const DISCOVER_GENRES_DIRECTORY_ROUTE = '/discover-genres';
/** Posters sized so three fit in the discover hub rail (between screen gutters). */
const HUB_RAIL_VISIBLE_COLUMNS = 3;
const HUB_RAIL_GAP = spacing.sm;

export function GenresHubSection() {
  const { t } = useTranslation();
  const router = useRouter();
  const { width: windowWidth } = useWindowDimensions();
  const genresQuery = useGenres();
  const genres = useMemo(
    () => selectGenreHubRailGenres(genresQuery.data ?? []),
    [genresQuery.data],
  );
  const covers = useGenreCoverSlots(genres);

  const hubTileSize = useMemo<GenreHubTileSize>(() => {
    const contentWidth = Math.min(windowWidth, layout.maxContentWidth);
    const innerWidth = contentWidth - spacing.lg * 2;
    const tileWidth =
      (innerWidth - HUB_RAIL_GAP * (HUB_RAIL_VISIBLE_COLUMNS - 1)) / HUB_RAIL_VISIBLE_COLUMNS;

    return {
      width: tileWidth,
      height: tileWidth / layout.posterAspectRatio,
    };
  }, [windowWidth]);

  const openDirectory = useCallback(() => {
    openLibraryStackScreen(router, DISCOVER_GENRES_DIRECTORY_ROUTE, '/discover');
  }, [router]);

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
          onPress={openDirectory}
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
        renderItem={({ item }) => (
          <GenreHubPosterCard
            genre={item}
            tileSize={hubTileSize}
            cover={covers.get(item.id) ?? { status: 'fallback' }}
          />
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
});
