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
  textShadowColor: 'rgba(0, 0, 0, 0.9)',
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
        colors={['rgba(196, 163, 90, 0.07)', 'transparent', 'rgba(196, 163, 90, 0.05)']}
        locations={[0, 0.45, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.scrimLayer}
      />
      <LinearGradient
        colors={['transparent', 'rgba(10, 10, 15, 0.18)', 'rgba(10, 10, 15, 0.72)']}
        locations={[0.28, 0.52, 1]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={styles.scrimLayer}
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
        <View style={styles.posterReveal} />

        <View style={styles.mainPanel}>
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
    ...StyleSheet.absoluteFillObject,
  },
  content: {
    flex: 1,
    minHeight: 420,
    justifyContent: 'flex-end',
  },
  posterReveal: {
    flex: 1,
    minHeight: 108,
  },
  mainPanel: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.md + spacing.xs,
    gap: spacing.lg,
    borderRadius: borderRadius.lg,
    backgroundColor: 'rgba(10, 10, 15, 0.92)',
    borderWidth: 1,
    borderColor: colors.borderAccent,
  },
  identityCluster: {
    alignItems: 'center',
    gap: spacing.md,
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
  },
  headline: {
    color: colors.textPrimary,
    letterSpacing: -0.6,
    fontWeight: '700',
    fontSize: 32,
    lineHeight: 38,
    maxWidth: '100%',
    ...TEXT_LIFT,
  },
  description: {
    lineHeight: 22,
    fontSize: 15,
    letterSpacing: 0.15,
    color: colors.textSecondary,
    maxWidth: '100%',
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
    backgroundColor: colors.accentTint14,
    paddingHorizontal: spacing.md + 2,
    paddingVertical: 7,
  },
  genreText: {
    color: colors.accentStrong,
    fontWeight: '700',
    fontSize: 12,
    letterSpacing: 0.35,
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
    color: colors.textSecondary,
    fontWeight: '500',
    fontSize: 11,
    letterSpacing: 0.2,
  },
  mixPercent: {
    color: colors.accentStrong,
    fontWeight: '700',
    fontSize: 11,
    fontVariant: ['tabular-nums'],
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
  },
  mixSegmentMuted: {
    height: '100%',
    backgroundColor: 'rgba(196, 163, 90, 0.28)',
  },
  bottomBand: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
    backgroundColor: 'rgba(10, 10, 15, 0.94)',
    borderTopWidth: 1,
    borderTopColor: colors.borderAccent,
  },
  quoteText: {
    color: colors.textSecondary,
    fontStyle: 'italic',
    lineHeight: 21,
    letterSpacing: 0.2,
    maxWidth: '92%',
    alignSelf: 'center',
    fontSize: 13,
  },
});
