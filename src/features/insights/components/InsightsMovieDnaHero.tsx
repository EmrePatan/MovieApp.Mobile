import { Image, ImageBackground, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { AppText } from '@/components/common/AppText';
import type { InsightsV3MovieDna } from '../types';
import {
  formatGenreGravitation,
  formatMovieDnaDisplayTitle,
  formatMovieDnaEditorialLine,
  formatWatchingMixLine,
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

interface InsightsMovieDnaHeroProps {
  movieDna: InsightsV3MovieDna;
  backdropImagePath?: string | null;
}

function HeroScrimLayers() {
  return (
    <>
      <LinearGradient
        colors={['rgba(10, 10, 15, 0.25)', 'rgba(10, 10, 15, 0.1)', 'rgba(10, 10, 15, 0.25)']}
        locations={[0, 0.5, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.scrimLayer}
      />
      <LinearGradient
        colors={[
          'rgba(10, 10, 15, 0.62)',
          'rgba(10, 10, 15, 0.42)',
          'rgba(10, 10, 15, 0.2)',
          'rgba(10, 10, 15, 0.55)',
          'rgba(10, 10, 15, 0.94)',
        ]}
        locations={[0, 0.2, 0.42, 0.72, 1]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={styles.scrimLayer}
      />
      <LinearGradient
        colors={['rgba(10, 10, 15, 0.72)', 'rgba(10, 10, 15, 0.38)', 'transparent']}
        locations={[0, 0.45, 1]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={styles.headlineScrim}
      />
    </>
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
  const mixLine = hasMix
    ? formatWatchingMixLine(
        movieDna.watchingMix.movieSharePercent,
        movieDna.watchingMix.seriesSharePercent,
      )
    : null;
  const showGravitation = visibleGenres.length === 0;
  const resolvedBackdrop = resolveImageUri(backdropImagePath, 'w500');

  const content = (
    <>
      <HeroScrimLayers />
      <View style={styles.content}>
        <View style={styles.heroColumn}>
          <View style={styles.identityCluster}>
            <AppText variant="caption" center style={styles.kicker}>
              Your Movie DNA
            </AppText>
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
        </View>

        <View style={styles.bottomBand}>
          {mixLine ? (
            <AppText
              variant="caption"
              center
              style={styles.mixLine}
              accessibilityRole="text"
              accessibilityLabel={`${Math.round(movieDna.watchingMix.movieSharePercent)}% movies, ${Math.round(movieDna.watchingMix.seriesSharePercent)}% series`}
            >
              {mixLine}
            </AppText>
          ) : null}
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
    justifyContent: 'space-between',
  },
  heroColumn: {
    width: '100%',
    maxWidth: 320,
    alignSelf: 'center',
    gap: spacing.lg,
  },
  identityCluster: {
    alignItems: 'center',
    gap: spacing.md,
  },
  kicker: {
    textTransform: 'uppercase',
    letterSpacing: 3,
    fontSize: 10,
    color: colors.accentMuted,
    fontWeight: '600',
    ...TEXT_LIFT,
  },
  headline: {
    color: colors.textPrimary,
    letterSpacing: -0.6,
    fontWeight: '700',
    fontSize: 34,
    lineHeight: 40,
    maxWidth: '92%',
    ...TEXT_LIFT,
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
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255, 255, 255, 0.14)',
    backgroundColor: 'rgba(10, 10, 15, 0.38)',
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 5,
  },
  genreText: {
    color: 'rgba(245, 245, 247, 0.88)',
    fontWeight: '500',
    fontSize: 11,
    letterSpacing: 0.3,
    ...TEXT_LIFT,
  },
  bottomBand: {
    marginHorizontal: -spacing.lg,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
    gap: spacing.sm,
    backgroundColor: 'rgba(10, 10, 15, 0.58)',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(255, 255, 255, 0.12)',
  },
  mixLine: {
    color: 'rgba(245, 245, 247, 0.72)',
    fontWeight: '500',
    fontSize: 11,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    ...TEXT_LIFT,
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
