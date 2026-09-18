import { Image, ImageBackground, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { AppText } from '@/components/common/AppText';
import type { InsightsV3MovieDna } from '../types';
import { formatGenreGravitation } from '../utils/insights-format';
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
        colors={[
          'rgba(10, 10, 15, 0.92)',
          'rgba(10, 10, 15, 0.62)',
          'rgba(10, 10, 15, 0.12)',
          'transparent',
        ]}
        locations={[0, 0.42, 0.72, 1]}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.4 }}
        style={styles.scrimLayer}
      />
      <LinearGradient
        colors={['transparent', 'rgba(10, 10, 15, 0.05)', 'rgba(10, 10, 15, 0.35)']}
        locations={[0, 0.45, 1]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={styles.scrimLayer}
      />
      <LinearGradient
        colors={['transparent', 'rgba(10, 10, 15, 0.72)', 'rgba(10, 10, 15, 0.98)']}
        locations={[0, 0.42, 1]}
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
  const gravitation = formatGenreGravitation(visibleGenres.map((genre) => genre.name));
  const quoteLabel = movieDna.labels[0]?.label ?? null;
  const hasMix =
    movieDna.watchingMix.movieTitleCount + movieDna.watchingMix.seriesTitleCount > 0;
  const resolvedBackdrop = resolveImageUri(backdropImagePath, 'w500');

  const content = (
    <>
      <HeroScrimLayers />
      <View style={styles.content}>
        <View style={styles.copyBlock}>
          <AppText variant="caption" style={styles.kicker}>
            Your Movie DNA
          </AppText>
          <AppText variant="hero" style={styles.headline}>
            {movieDna.identityTitle}
          </AppText>

          {gravitation ? (
            <AppText variant="bodySmall" style={styles.description}>
              {gravitation}
            </AppText>
          ) : (
            <AppText variant="bodySmall" style={styles.description}>
              Keep watching and rating to shape your Movie DNA.
            </AppText>
          )}
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
          <View
            style={styles.mixRow}
            accessibilityRole="text"
            accessibilityLabel={`Movies ${movieDna.watchingMix.movieTitleCount}, series ${movieDna.watchingMix.seriesTitleCount}`}
          >
            <MixCard
              icon="tv-outline"
              label="Series"
              percent={movieDna.watchingMix.seriesSharePercent}
              count={movieDna.watchingMix.seriesTitleCount}
            />
            <MixCard
              icon="film-outline"
              label="Movies"
              percent={movieDna.watchingMix.movieSharePercent}
              count={movieDna.watchingMix.movieTitleCount}
            />
          </View>
        ) : null}

        {quoteLabel ? (
          <View style={styles.quotePanel} accessibilityRole="text">
            <Ionicons name="chatbox-ellipses-outline" size={15} color={colors.accentMuted} />
            <AppText variant="bodySmall" style={styles.quoteText}>
              {quoteLabel}
            </AppText>
          </View>
        ) : null}
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

function MixCard({
  icon,
  label,
  percent,
  count,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  percent: number;
  count: number;
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
      <AppText variant="caption" style={styles.mixMeta}>{count} titles</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
  },
  gradient: {
    minHeight: 380,
    justifyContent: 'flex-end',
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
    padding: spacing.lg,
    gap: spacing.md,
  },
  copyBlock: {
    gap: spacing.sm,
    maxWidth: '94%',
  },
  kicker: {
    textTransform: 'uppercase',
    letterSpacing: 1.8,
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
    ...TEXT_LIFT,
  },
  description: {
    lineHeight: 22,
    color: colors.textSecondary,
    ...TEXT_LIFT,
  },
  genreRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  genreChip: {
    borderRadius: borderRadius.full,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.borderAccent,
    backgroundColor: 'rgba(10, 10, 15, 0.55)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 5,
  },
  genreText: {
    color: colors.accentStrong,
    fontWeight: '600',
    ...TEXT_LIFT,
  },
  mixRow: {
    flexDirection: 'row',
    gap: spacing.sm,
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
  mixMeta: {
    color: colors.textMuted,
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
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    backgroundColor: 'rgba(10, 10, 15, 0.72)',
  },
  quoteText: {
    flex: 1,
    color: colors.textSecondary,
    fontStyle: 'italic',
    lineHeight: 22,
    ...TEXT_LIFT,
  },
});
