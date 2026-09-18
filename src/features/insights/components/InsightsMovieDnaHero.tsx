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
          'rgba(10, 10, 15, 0.35)',
          'rgba(10, 10, 15, 0.2)',
          'rgba(10, 10, 15, 0.55)',
          'rgba(10, 10, 15, 0.95)',
        ]}
        locations={[0, 0.32, 0.62, 1]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={styles.scrimLayer}
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
  const resolvedBackdrop = resolveImageUri(backdropImagePath, 'w500');

  const content = (
    <>
      <HeroScrimLayers />
      <View style={styles.content}>
        <View style={styles.upperBlock}>
          <AppText variant="caption" center style={styles.kicker}>
            Your Movie DNA
          </AppText>
          <AppText variant="hero" center style={styles.headline}>
            {displayTitle}
          </AppText>
        </View>

        <View style={styles.middleBlock}>
          {gravitation ? (
            <AppText variant="body" center style={styles.description}>
              {gravitation}
            </AppText>
          ) : (
            <AppText variant="body" center style={styles.description}>
              Keep watching and rating to shape your Movie DNA.
            </AppText>
          )}

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
            <View
              style={styles.mixRow}
              accessibilityRole="text"
              accessibilityLabel={`Movies ${movieDna.watchingMix.movieTitleCount}, series ${movieDna.watchingMix.seriesTitleCount}`}
            >
              <MixColumn
                icon="tv-outline"
                label="Series"
                percent={movieDna.watchingMix.seriesSharePercent}
              />
              <MixColumn
                icon="film-outline"
                label="Movies"
                percent={movieDna.watchingMix.movieSharePercent}
              />
            </View>
          ) : null}
        </View>

        <View style={styles.lowerBlock}>
          <View style={styles.quotePanel} accessibilityRole="text">
            <AppText variant="caption" style={styles.quoteMark}>“</AppText>
            <AppText variant="bodySmall" center style={styles.quoteText}>
              {editorialLine}
            </AppText>
            <AppText variant="caption" style={styles.quoteMark}>”</AppText>
          </View>
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

function MixColumn({
  icon,
  label,
  percent,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  percent: number;
}) {
  const widthPercent = Math.max(8, Math.min(100, percent));

  return (
    <View style={styles.mixColumn}>
      <View style={styles.mixHeader}>
        <Ionicons name={icon} size={15} color={colors.accentStrong} />
        <AppText variant="caption" style={styles.mixLabel}>{label}</AppText>
        <AppText variant="caption" style={styles.mixPercent}>{Math.round(percent)}%</AppText>
      </View>
      <View style={styles.mixTrack}>
        <View style={[styles.mixFill, { width: `${widthPercent}%` }]} />
      </View>
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
  content: {
    flex: 1,
    minHeight: 420,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl + spacing.sm,
    paddingBottom: spacing.lg,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  upperBlock: {
    width: '100%',
    maxWidth: 340,
    alignItems: 'center',
    gap: spacing.sm,
  },
  middleBlock: {
    width: '100%',
    maxWidth: 340,
    alignItems: 'center',
    gap: spacing.md,
    flexShrink: 0,
  },
  lowerBlock: {
    width: '100%',
    maxWidth: 340,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingTop: spacing.sm,
  },
  kicker: {
    textTransform: 'uppercase',
    letterSpacing: 2.2,
    fontSize: 11,
    color: colors.accentStrong,
    fontWeight: '700',
    ...TEXT_LIFT,
  },
  headline: {
    color: colors.textPrimary,
    letterSpacing: -0.8,
    fontWeight: '700',
    fontSize: 38,
    lineHeight: 44,
    maxWidth: '100%',
    ...TEXT_LIFT,
  },
  description: {
    lineHeight: 24,
    color: colors.textSecondary,
    maxWidth: '96%',
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
    borderColor: colors.borderAccent,
    backgroundColor: 'rgba(10, 10, 15, 0.55)',
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
  },
  genreText: {
    color: colors.accentStrong,
    fontWeight: '600',
    ...TEXT_LIFT,
  },
  mixRow: {
    flexDirection: 'row',
    gap: spacing.xl,
    width: '100%',
    paddingHorizontal: spacing.sm,
  },
  mixColumn: {
    flex: 1,
    gap: spacing.sm,
  },
  mixHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  mixLabel: {
    flex: 1,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  mixPercent: {
    color: colors.accentStrong,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  mixTrack: {
    height: 6,
    borderRadius: borderRadius.full,
    backgroundColor: colors.progressTrack,
    overflow: 'hidden',
  },
  mixFill: {
    height: '100%',
    backgroundColor: colors.accent,
    borderRadius: borderRadius.full,
  },
  quotePanel: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.xs,
  },
  quoteMark: {
    color: colors.accentMuted,
    fontSize: 26,
    lineHeight: 26,
    ...TEXT_LIFT,
  },
  quoteText: {
    color: colors.textSecondary,
    fontStyle: 'italic',
    lineHeight: 22,
    maxWidth: '88%',
    fontSize: 13,
    ...TEXT_LIFT,
  },
});
