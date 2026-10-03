import { Pressable, StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { AppText } from '@/components/common/AppText';
import { SkeletonBlock } from '@/components/loading/SkeletonBlock';
import type { GenreCoverSlot } from '@/features/discovery/genre-cover-selection';
import { resolveDiscoverGenreCanonicalName } from '@/features/discovery/main-discover-genres';
import type { Genre } from '@/features/discovery/types';
import { createDiscoverHref } from '@/features/discovery/utils/discover-params';
import { openLibraryStackScreen } from '@/features/library/navigation/library-stack-navigation';
import { translateGenreName } from '@/i18n/catalog-labels';
import { resolveImageUri } from '@/utils/image-url';
import { colors } from '@/theme/colors';
import { interaction } from '@/theme/interaction';
import { borderRadius, spacing } from '@/theme/spacing';

export interface GenreHubTileSize {
  width: number;
  height: number;
}

export type GenreHubCardBackground = 'poster' | 'vividColor';

const GENRE_HUB_POSTER_BLUR_RADIUS = 20;

/** Same center scrim used on blurred poster art — keeps the soft, muted read on vivid fills. */
const GENRE_HUB_ART_SCRIM = ['rgba(0,0,0,0.38)', 'rgba(0,0,0,0.52)', 'rgba(0,0,0,0.38)'] as const;

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

const GENRE_VIVID_GRADIENTS: Record<string, readonly [string, string, string]> = {
  action: ['#8E2828', '#E04848', '#3A1010'],
  adventure: ['#1E6848', '#3CB878', '#0E2018'],
  animation: ['#3858B8', '#6890F0', '#14182A'],
  comedy: ['#9A6818', '#F0C040', '#2A1C08'],
  crime: ['#483868', '#8878B0', '#18141E'],
  documentary: ['#287048', '#58A878', '#0E1810'],
  drama: ['#6A3048', '#C06080', '#1E0C12'],
  family: ['#6A5020', '#C09850', '#1E1608'],
  fantasy: ['#286878', '#58B0C8', '#0E1820'],
  history: ['#584830', '#A08858', '#1A1408'],
  horror: ['#6A1820', '#C03040', '#18080A'],
  kids: ['#287868', '#58C0A8', '#0E1A18'],
  music: ['#583070', '#A060C8', '#180C1E'],
  mystery: ['#304868', '#6890B0', '#0E141C'],
  news: ['#385878', '#6898C0', '#101820'],
  reality: ['#684828', '#C08048', '#1E1208'],
  romance: ['#7A2850', '#E07098', '#200C14'],
  'science fiction': ['#285890', '#58A8E8', '#0E1420'],
  soap: ['#682850', '#C070A8', '#180C14'],
  talk: ['#484068', '#8878A8', '#14101C'],
  thriller: ['#404040', '#787878', '#101010'],
  war: ['#584020', '#A87840', '#1A1008'],
  western: ['#684020', '#C08848', '#1A1008'],
};

function genreGradientKey(name: string): string {
  const canonical = resolveDiscoverGenreCanonicalName(name) ?? name;
  return canonical.trim().toLowerCase();
}

function genreGradient(name: string): readonly [string, string, string] {
  return GENRE_TILE_GRADIENTS[genreGradientKey(name)] ?? ['#242430', '#3A3A4A', '#101014'];
}

function genreVividGradient(name: string): readonly [string, string, string] {
  return GENRE_VIVID_GRADIENTS[genreGradientKey(name)] ?? ['#3A3A58', '#6868A0', '#1A1A28'];
}

interface GenreHubPosterCardProps {
  genre: Genre;
  tileSize: GenreHubTileSize;
  background?: GenreHubCardBackground;
  cover?: GenreCoverSlot;
}

function GenreHubArtScrim() {
  return (
    <LinearGradient
      pointerEvents="none"
      colors={[...GENRE_HUB_ART_SCRIM]}
      locations={[0, 0.5, 1]}
      style={StyleSheet.absoluteFill}
    />
  );
}

function GenreHubVividColorBackground({
  gradient,
  tileSize,
  genreId,
}: {
  gradient: readonly [string, string, string];
  tileSize: GenreHubTileSize;
  genreId: string;
}) {
  return (
    <>
      <LinearGradient
        colors={[gradient[0], gradient[1], gradient[2]]}
        locations={[0, 0.45, 1]}
        start={{ x: 0.05, y: 0 }}
        end={{ x: 0.95, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.colorGlowWrap} pointerEvents="none">
        <LinearGradient
          colors={[`${gradient[1]}B3`, `${gradient[0]}66`, 'transparent']}
          locations={[0, 0.55, 1]}
          start={{ x: 0.2, y: 0.1 }}
          end={{ x: 0.9, y: 1 }}
          style={[
            styles.colorGlow,
            {
              width: tileSize.width * 1.35,
              height: tileSize.height * 1.35,
              left: -tileSize.width * 0.18,
              top: -tileSize.height * 0.2,
            },
          ]}
        />
      </View>
      <GenreHubArtScrim />
      <View testID={`genre-hub-color-${genreId}`} accessible={false} />
    </>
  );
}

export function GenreHubPosterCard({
  genre,
  tileSize,
  background = 'poster',
  cover,
}: GenreHubPosterCardProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const label = translateGenreName(genre.name);
  const gradient = genreGradient(genre.name);
  const vividGradient = genreVividGradient(genre.name);
  const posterUri =
    cover?.status === 'poster' ? resolveImageUri(cover.posterUrl, 'w780') : null;

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
      {background === 'vividColor' ? (
        <>
          <GenreHubVividColorBackground
            gradient={vividGradient}
            tileSize={tileSize}
            genreId={genre.id}
          />
          <AppText variant="subtitle" style={styles.tileLabel} numberOfLines={3}>
            {label}
          </AppText>
        </>
      ) : cover?.status === 'pending' ? (
        <SkeletonBlock width={tileSize.width} height={tileSize.height} />
      ) : cover?.status === 'poster' && posterUri ? (
        <>
          <View style={StyleSheet.absoluteFill} pointerEvents="none">
            <Image
              source={{ uri: posterUri }}
              style={{ width: tileSize.width, height: tileSize.height }}
              contentFit="cover"
              blurRadius={GENRE_HUB_POSTER_BLUR_RADIUS}
              cachePolicy="memory-disk"
              accessibilityLabel=""
            />
          </View>
          <GenreHubArtScrim />
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
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.sm,
    backgroundColor: colors.background,
  },
  colorGlowWrap: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  colorGlow: {
    position: 'absolute',
    opacity: 0.85,
  },
  tileLabel: {
    color: colors.textPrimary,
    fontWeight: '700',
    textAlign: 'center',
    alignSelf: 'stretch',
    zIndex: 1,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  pressed: {
    opacity: interaction.pressedOpacity,
  },
});
