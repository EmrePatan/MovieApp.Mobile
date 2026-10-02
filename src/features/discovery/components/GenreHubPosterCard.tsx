import { Pressable, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { AppText } from '@/components/common/AppText';
import { SkeletonBlock } from '@/components/loading/SkeletonBlock';
import { CatalogImage } from '@/features/details/shared/components/CatalogImage';
import type { GenreCoverSlot } from '@/features/discovery/genre-cover-selection';
import { resolveDiscoverGenreCanonicalName } from '@/features/discovery/main-discover-genres';
import type { Genre } from '@/features/discovery/types';
import { createDiscoverHref } from '@/features/discovery/utils/discover-params';
import { openLibraryStackScreen } from '@/features/library/navigation/library-stack-navigation';
import { translateGenreName } from '@/i18n/catalog-labels';
import { colors } from '@/theme/colors';
import { interaction } from '@/theme/interaction';
import { borderRadius, spacing } from '@/theme/spacing';

export interface GenreHubTileSize {
  width: number;
  height: number;
}

const GENRE_TILE_GRADIENTS: Record<string, readonly [string, string, string]> = {
  action: ['#5C1C1C', '#8E2E2E', '#1A0C0C'],
  adventure: ['#1C4A34', '#2F7A52', '#0C1610'],
  animation: ['#24356E', '#3E5CB8', '#10141F'],
  comedy: ['#6A4A16', '#C4923A', '#1A140C'],
  crime: ['#2C2438', '#5A4A78', '#100E14'],
  documentary: ['#1E3A2A', '#3E6A48', '#0C1410'],
  drama: ['#4A2430', '#8A4458', '#140C10'],
  family: ['#4A3820', '#8A6840', '#16100C'],
  fantasy: ['#1E3A44', '#3E7A88', '#0C1416'],
  history: ['#3A3020', '#6A5838', '#14100C'],
  horror: ['#3A1014', '#7A1E28', '#10080A'],
  kids: ['#1E4A44', '#3E8A78', '#0C1614'],
  music: ['#3A2048', '#6A3888', '#120C16'],
  mystery: ['#1A2430', '#3A4E66', '#0C1014'],
  news: ['#243044', '#4A6280', '#0C1014'],
  reality: ['#3A2818', '#7A5430', '#140E0C'],
  romance: ['#5A2038', '#A84870', '#160C12'],
  'science fiction': ['#16304A', '#2E6A9A', '#0C1218'],
  soap: ['#4A2040', '#8A4878', '#140C12'],
  talk: ['#2A2438', '#524868', '#100E14'],
  thriller: ['#242424', '#4A4A4A', '#0C0C0C'],
  war: ['#3A2A18', '#6A4A28', '#140E0A'],
  western: ['#4A3018', '#8A5A30', '#16100C'],
};

function genreGradient(name: string): readonly [string, string, string] {
  const canonical = resolveDiscoverGenreCanonicalName(name) ?? name;
  return GENRE_TILE_GRADIENTS[canonical.trim().toLowerCase()] ?? ['#242430', '#3A3A4A', '#101014'];
}

interface GenreHubPosterCardProps {
  genre: Genre;
  tileSize: GenreHubTileSize;
  cover: GenreCoverSlot;
}

export function GenreHubPosterCard({ genre, tileSize, cover }: GenreHubPosterCardProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const label = translateGenreName(genre.name);
  const gradient = genreGradient(genre.name);

  const openGenre = () => {
    openLibraryStackScreen(
      router,
      createDiscoverHref({
        mode: 'popular',
        type: 'all',
        filters: { genreIds: [genre.id] },
      }),
      '/discover',
    );
  };

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={t('discover.genresHub.openGenre', { genre: label })}
      onPress={openGenre}
      style={({ pressed }) => [
        styles.tile,
        { width: tileSize.width, height: tileSize.height },
        pressed && styles.pressed,
      ]}
      testID={`genre-hub-tile-${genre.id}`}
    >
      {cover.status === 'pending' ? (
        <SkeletonBlock width={tileSize.width} height={tileSize.height} />
      ) : cover.status === 'poster' ? (
        <>
          <View style={StyleSheet.absoluteFill} pointerEvents="none">
            <CatalogImage
              path={cover.posterUrl}
              width={tileSize.width}
              height={tileSize.height}
              rounded={false}
              accessibilityLabel=""
            />
          </View>
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.78)']}
            locations={[0.45, 1]}
            style={StyleSheet.absoluteFill}
          />
          <View
            testID={`genre-hub-cover-${genre.id}`}
            accessibilityLabel={cover.title}
            accessible={false}
          />
          <AppText variant="subtitle" style={styles.tileLabel} numberOfLines={3}>
            {label}
          </AppText>
        </>
      ) : (
        <>
          <LinearGradient
            colors={[gradient[0], gradient[1], gradient[2]]}
            locations={[0, 0.42, 1]}
            start={{ x: 0.1, y: 0 }}
            end={{ x: 0.9, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
          <View testID={`genre-hub-fallback-${genre.id}`} accessible={false} />
          <AppText variant="subtitle" style={styles.tileLabel} numberOfLines={3}>
            {label}
          </AppText>
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
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
  pressed: {
    opacity: interaction.pressedOpacity,
  },
});
