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

const FALLBACK_HERO = require('../../../../assets/insights/movie-dna-hero-fallback.png');

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
        colors={[
          'rgba(10, 10, 15, 0.72)',
          'rgba(10, 10, 15, 0.38)',
          'rgba(10, 10, 15, 0.06)',
          'transparent',
        ]}
        locations={[0, 0.42, 0.72, 1]}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.4 }}
        style={styles.scrimLayer}
      />
      <LinearGradient
        colors={['transparent', 'rgba(10, 10, 15, 0.05)', 'rgba(10, 10, 15, 0.28)']}
        locations={[0, 0.45, 1]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={styles.scrimLayer}
      />
      <LinearGradient
        colors={['transparent', 'rgba(10, 10, 15, 0.5)', 'rgba(10, 10, 15, 0.82)']}
        locations={[0, 0.42, 1]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={styles.scrimLayer}
      />
    </>
  );
}

function MixCard({
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
    <View style={styles.mixCard}>
      <View style={styles.mixHeader}>
        <Ionicons name={icon} size={14} color={colors.accentStrong} />
        <AppText variant="caption" style={styles.mixLabel}>{label}</AppText>
        <AppText variant="caption" style={styles.mixPercent}>{Math.round(percent)}%</AppText>
      </View>
      <View style={styles.mixTrack}>
        <View style={[styles.mixFill, { width: `${widthPercent}%` }]} />
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
  const resolvedBackdrop = resolveImageUri(backdropImagePath, 'w500');

  const heroBody = (
    <>
      <HeroScrimLayers />
      <View style={styles.content}>
        <View style={styles.copyBlock}>
          <AppText variant="caption" center style={styles.kicker}>
            Your Movie DNA
          </AppText>
          <AppText variant="hero" center style={styles.headline}>
            {displayTitle}
          </AppText>
          {gravitation ? (
            <AppText variant="bodySmall" center style={styles.description}>
              {gravitation}
            </AppText>
          ) : (
            <AppText variant="bodySmall" center style={styles.description}>
              Keep watching and rating to shape your Movie DNA.
            </AppText>
          )}
        </View>

        {visibleGenres.length > 0 ? (
          <View style={styles.genreRow}>
            {visibleGenres.map((genre, index) => {
              const isActive = index === 0;
              return (
                <View
                  key={genre.genreId}
                  style={[styles.genreChip, isActive ? styles.genreChipActive : styles.genreChipMuted]}
                >
                  <AppText
                    variant="caption"
                    style={[styles.genreText, !isActive && styles.genreTextMuted]}
                  >
                    {genre.name}
                  </AppText>
                </View>
              );
            })}
          </View>
        ) : null}

        {hasMix ? (
          <View
            style={styles.mixRow}
            accessibilityRole="text"
            accessibilityLabel={`Movies ${movieDna.watchingMix.movieTitleCount}, series ${movieDna.watchingMix.seriesTitleCount}`}
          >
            <MixCard
              icon="tv-outline"
              label="Series"
              percent={movieDna.watchingMix.seriesSharePercent}
            />
            <MixCard
              icon="film-outline"
              label="Movies"
              percent={movieDna.watchingMix.movieSharePercent}
            />
          </View>
        ) : null}

        <View style={styles.quotePanel} accessibilityRole="text">
          <AppText variant="caption" style={styles.quoteMark}>“</AppText>
          <AppText variant="bodySmall" center style={styles.quoteText}>
            {editorialLine}
          </AppText>
          <AppText variant="caption" style={styles.quoteMark}>”</AppText>
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
          {heroBody}
        </ImageBackground>
      ) : (
        <View style={styles.gradient}>
          <Image source={FALLBACK_HERO} style={styles.fallbackBackdrop} resizeMode="cover" />
          {heroBody}
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
    justifyContent: 'center',
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
    paddingVertical: spacing.xl,
    gap: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  copyBlock: {
    gap: spacing.sm,
    maxWidth: '94%',
    width: '100%',
    alignItems: 'center',
  },
  kicker: {
    textTransform: 'uppercase',
    letterSpacing: 1.8,
    color: colors.accentStrong,
    fontWeight: '700',
    ...TEXT_LIFT,
  },
  headline: {
    color: colors.accentStrong,
    letterSpacing: -0.6,
    fontWeight: '700',
    fontSize: 34,
    lineHeight: 40,
    ...TEXT_LIFT,
  },
  description: {
    lineHeight: 22,
    color: colors.textPrimary,
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
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 5,
  },
  genreChipActive: {
    borderColor: colors.borderAccent,
    backgroundColor: colors.accentTint18,
  },
  genreChipMuted: {
    borderColor: colors.borderSubtle,
    backgroundColor: 'rgba(10, 10, 15, 0.45)',
  },
  genreText: {
    color: colors.accentStrong,
    fontWeight: '600',
    ...TEXT_LIFT,
  },
  genreTextMuted: {
    color: colors.textSecondary,
    fontWeight: '500',
  },
  mixRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    width: '100%',
    maxWidth: 340,
  },
  mixCard: {
    flex: 1,
    gap: spacing.xs,
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    backgroundColor: 'rgba(10, 10, 15, 0.68)',
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
    height: 4,
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
    maxWidth: 340,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.xs,
    paddingTop: spacing.xs,
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
