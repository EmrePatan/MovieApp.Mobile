import { Image, ImageBackground, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { AppText } from '@/components/common/AppText';
import type { InsightsV3MovieDna } from '../types';
import {
  formatGenreGravitation,
  formatMovieDnaDisplayTitle,
  formatMovieDnaEditorialLine,
} from '../utils/insights-format';
import { resolveImageUri } from '@/utils/image-url';
import { colors } from '@/theme/colors';
import { borderRadius, spacing } from '@/theme/spacing';

const FALLBACK_HERO = require('../../../../assets/insights/movie-dna-hero-fallback.jpg');

const TEXT_LIFT = {
  textShadowColor: 'rgba(0, 0, 0, 0.85)',
  textShadowOffset: { width: 0, height: 1 },
  textShadowRadius: 10,
} as const;

const CHIP_LIFT = {
  textShadowColor: 'rgba(0, 0, 0, 0.95)',
  textShadowOffset: { width: 0, height: 1 },
  textShadowRadius: 8,
} as const;

interface InsightsMovieDnaHeroProps {
  movieDna: InsightsV3MovieDna;
  backdropImagePath?: string | null;
}

function HeroScrimLayers() {
  return (
    <>
      <LinearGradient
        colors={['rgba(196, 163, 90, 0.1)', 'transparent', 'rgba(196, 163, 90, 0.08)']}
        locations={[0, 0.5, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.scrimLayer}
      />
      <LinearGradient
        colors={[
          'rgba(10, 10, 15, 0.32)',
          'rgba(10, 10, 15, 0.14)',
          'rgba(10, 10, 15, 0.08)',
          'rgba(10, 10, 15, 0.42)',
          'rgba(16, 14, 10, 0.84)',
        ]}
        locations={[0, 0.22, 0.48, 0.74, 1]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={styles.scrimLayer}
      />
      <LinearGradient
        colors={['rgba(196, 163, 90, 0.14)', 'rgba(10, 10, 15, 0.18)', 'transparent']}
        locations={[0, 0.4, 1]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={styles.headlineScrim}
      />
    </>
  );
}

function PremiumWatchingMix({
  movieSharePercent,
  seriesSharePercent,
  movieTitleCount,
  seriesTitleCount,
}: {
  movieSharePercent: number;
  seriesSharePercent: number;
  movieTitleCount: number;
  seriesTitleCount: number;
}) {
  const movieRounded = Math.round(movieSharePercent);
  const seriesRounded = Math.round(seriesSharePercent);
  const movieFlex = Math.max(movieRounded, 8);
  const seriesFlex = Math.max(seriesRounded, 8);

  return (
    <View
      style={styles.mixBlock}
      accessibilityRole="text"
      accessibilityLabel={`Movies ${movieTitleCount}, series ${seriesTitleCount}. ${movieRounded}% movies, ${seriesRounded}% series.`}
    >
      <View style={styles.mixHeaderRow}>
        <View style={styles.mixStat}>
          <Ionicons name="film-outline" size={12} color={colors.accentStrong} />
          <AppText variant="caption" style={styles.mixLabel}>Movies</AppText>
          <AppText variant="caption" style={styles.mixPercent}>{movieRounded}%</AppText>
        </View>
        <View style={styles.mixStat}>
          <Ionicons name="tv-outline" size={12} color={colors.accentMuted} />
          <AppText variant="caption" style={styles.mixLabel}>Series</AppText>
          <AppText variant="caption" style={styles.mixPercent}>{seriesRounded}%</AppText>
        </View>
      </View>
      <View style={styles.mixTrack}>
        <LinearGradient
          colors={[colors.accentMuted, colors.accentStrong]}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={[styles.mixSegment, { flex: movieFlex }]}
        />
        <View style={[styles.mixSegmentMuted, { flex: seriesFlex }]} />
      </View>
    </View>
  );
}

export function InsightsMovieDnaHero({
  movieDna,
  backdropImagePath,
}: InsightsMovieDnaHeroProps) {
  const visibleGenres = movieDna.topGenres.slice(0, 3);
  const displayTitle = formatMovieDnaDisplayTitle(movieDna);
  const gravitation = formatGenreGravitation(visibleGenres.map((genre) => genre.name));
  const editorialLine = formatMovieDnaEditorialLine(movieDna);
  const hasMix =
    movieDna.watchingMix.movieTitleCount + movieDna.watchingMix.seriesTitleCount > 0;
  const showGravitation = visibleGenres.length === 0;
  const resolvedBackdrop = resolveImageUri(backdropImagePath, 'w500');

  const content = (
    <>
      <HeroScrimLayers />
      <View style={styles.content}>
        <View style={styles.identityCluster}>
          <View style={styles.kickerPill}>
            <AppText variant="caption" center style={styles.kicker}>
              Your Movie DNA
            </AppText>
          </View>
          <AppText variant="hero" center style={styles.headline}>
            {displayTitle}
          </AppText>
          {showGravitation ? (
            <AppText variant="body" center style={styles.description}>
              {gravitation ?? 'Keep watching and rating to shape your Movie DNA.'}
            </AppText>
          ) : null}
        </View>

        <View style={styles.middleLowerZone}>
          {visibleGenres.length > 0 ? (
            <View style={styles.genreRow}>
              {visibleGenres.map((genre) => (
                <View key={genre.genreId} style={styles.genreChip}>
                  <AppText variant="caption" style={styles.genreText}>
                    {genre.name}
                  </AppText>
                </View>
              ))}
            </View>
          ) : null}

          {hasMix ? (
            <PremiumWatchingMix
              movieSharePercent={movieDna.watchingMix.movieSharePercent}
              seriesSharePercent={movieDna.watchingMix.seriesSharePercent}
              movieTitleCount={movieDna.watchingMix.movieTitleCount}
              seriesTitleCount={movieDna.watchingMix.seriesTitleCount}
            />
          ) : null}
        </View>

        <View style={styles.bottomBand}>
          <AppText variant="bodySmall" center style={styles.quoteText} accessibilityRole="text">
            {editorialLine}
          </AppText>
        </View>
      </View>
    </>
  );

  return (
    <View style={styles.container}>
      {resolvedBackdrop ? (
        <ImageBackground
          source={{ uri: resolvedBackdrop }}
          style={styles.gradient}
          imageStyle={styles.backdropImage}
        >
          {content}
        </ImageBackground>
      ) : (
        <View style={styles.gradient}>
          <Image source={FALLBACK_HERO} style={styles.fallbackBackdrop} resizeMode="cover" />
          {content}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.borderAccent,
  },
  gradient: {
    minHeight: 420,
  },
  backdropImage: {
    resizeMode: 'cover',
    transform: [{ scale: 1.08 }],
  },
  fallbackBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '280%',
    height: '108%',
  },
  scrimLayer: {
    ...StyleSheet.absoluteFill,
  },
  headlineScrim: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '52%',
  },
  content: {
    flex: 1,
    minHeight: 420,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xxl,
  },
  identityCluster: {
    width: '100%',
    maxWidth: 320,
    alignSelf: 'center',
    alignItems: 'center',
    gap: spacing.md,
  },
  middleLowerZone: {
    flex: 1,
    width: '100%',
    maxWidth: 320,
    alignSelf: 'center',
    justifyContent: 'flex-end',
    gap: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.md,
  },
  kickerPill: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: borderRadius.full,
    backgroundColor: colors.accentTint18,
    borderWidth: 1,
    borderColor: colors.borderAccent,
  },
  kicker: {
    textTransform: 'uppercase',
    letterSpacing: 2.8,
    fontSize: 11,
    color: colors.accentStrong,
    fontWeight: '700',
    ...TEXT_LIFT,
  },
  headline: {
    color: colors.textPrimary,
    letterSpacing: -0.6,
    fontWeight: '700',
    fontSize: 34,
    lineHeight: 40,
    maxWidth: '92%',
    textShadowColor: 'rgba(196, 163, 90, 0.28)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 12,
  },
  description: {
    lineHeight: 22,
    fontSize: 15,
    letterSpacing: 0.15,
    color: 'rgba(245, 245, 247, 0.78)',
    maxWidth: '88%',
    ...TEXT_LIFT,
  },
  genreRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing.xs,
    width: '100%',
  },
  genreChip: {
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.borderAccent,
    backgroundColor: colors.accentTint18,
    paddingHorizontal: spacing.md + 2,
    paddingVertical: 7,
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.22,
    shadowRadius: 6,
    elevation: 3,
  },
  genreText: {
    color: colors.accentStrong,
    fontWeight: '700',
    fontSize: 12,
    letterSpacing: 0.35,
    ...CHIP_LIFT,
  },
  mixBlock: {
    width: '100%',
    gap: spacing.sm,
  },
  mixHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.lg,
  },
  mixStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  mixLabel: {
    color: 'rgba(245, 245, 247, 0.7)',
    fontWeight: '500',
    fontSize: 11,
    letterSpacing: 0.2,
  },
  mixPercent: {
    color: colors.accentStrong,
    fontWeight: '700',
    fontSize: 11,
    fontVariant: ['tabular-nums'],
    ...TEXT_LIFT,
  },
  mixTrack: {
    flexDirection: 'row',
    height: 4,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
    backgroundColor: colors.accentTint14,
  },
  mixSegment: {
    height: '100%',
    borderTopRightRadius: 1,
    borderBottomRightRadius: 1,
  },
  mixSegmentMuted: {
    height: '100%',
    backgroundColor: 'rgba(196, 163, 90, 0.32)',
  },
  bottomBand: {
    marginHorizontal: -spacing.lg,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
    backgroundColor: 'rgba(22, 18, 12, 0.52)',
    borderTopWidth: 1,
    borderTopColor: colors.borderAccent,
  },
  quoteText: {
    color: 'rgba(245, 245, 247, 0.82)',
    fontStyle: 'italic',
    lineHeight: 21,
    letterSpacing: 0.2,
    maxWidth: '92%',
    alignSelf: 'center',
    fontSize: 13,
    ...TEXT_LIFT,
  },
});
