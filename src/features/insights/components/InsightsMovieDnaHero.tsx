import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { AppText } from '@/components/common/AppText';
import type { InsightsV3MovieDna } from '../types';
import { formatGenreGravitation } from '../utils/insights-format';
import { colors } from '@/theme/colors';
import { borderRadius, spacing } from '@/theme/spacing';

interface InsightsMovieDnaHeroProps {
  movieDna: InsightsV3MovieDna;
}

export function InsightsMovieDnaHero({ movieDna }: InsightsMovieDnaHeroProps) {
  const visibleGenres = movieDna.topGenres.slice(0, 3);
  const gravitation = formatGenreGravitation(visibleGenres.map((genre) => genre.name));
  const quoteLabel = movieDna.labels[0]?.label ?? null;
  const hasMix =
    movieDna.watchingMix.movieTitleCount + movieDna.watchingMix.seriesTitleCount > 0;

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[colors.accentTint18, colors.surfaceElevated, colors.background]}
        locations={[0, 0.45, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <LinearGradient
          colors={['transparent', colors.overlay]}
          style={styles.scrim}
        />
        <View style={styles.content}>
          <AppText variant="caption" muted style={styles.kicker}>
            Your Movie DNA
          </AppText>
          <AppText variant="hero" style={styles.headline}>
            {movieDna.identityTitle}
          </AppText>

          {gravitation ? (
            <AppText variant="bodySmall" muted style={styles.description}>
              {gravitation}
            </AppText>
          ) : (
            <AppText variant="bodySmall" muted style={styles.description}>
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
            <View style={styles.quoteBlock} accessibilityRole="text">
              <AppText variant="caption" style={styles.quoteMark}>“</AppText>
              <AppText variant="bodySmall" style={styles.quoteText}>
                {quoteLabel}
              </AppText>
              <AppText variant="caption" style={styles.quoteMarkEnd}>”</AppText>
            </View>
          ) : null}
        </View>
      </LinearGradient>
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
        <Ionicons name={icon} size={14} color={colors.accent} />
        <AppText variant="caption" style={styles.mixLabel}>{label}</AppText>
        <AppText variant="caption" muted>{Math.round(percent)}%</AppText>
      </View>
      <View style={styles.mixTrack}>
        <View style={[styles.mixFill, { width: `${widthPercent}%` }]} />
      </View>
      <AppText variant="caption" muted>{count} titles</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.borderAccent,
  },
  gradient: {
    minHeight: 320,
    justifyContent: 'flex-end',
  },
  scrim: {
    ...StyleSheet.absoluteFill,
  },
  content: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  kicker: {
    textTransform: 'uppercase',
    letterSpacing: 1.4,
    color: colors.accentStrong,
  },
  headline: {
    color: colors.textPrimary,
    letterSpacing: -0.4,
  },
  description: {
    lineHeight: 22,
    maxWidth: '95%',
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
    backgroundColor: colors.accentTint12,
    paddingHorizontal: spacing.sm,
    paddingVertical: 5,
  },
  genreText: {
    color: colors.accentStrong,
    fontWeight: '600',
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
    backgroundColor: colors.accentTint12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.borderSubtle,
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
  quoteBlock: {
    paddingTop: spacing.xs,
    gap: 2,
  },
  quoteMark: {
    color: colors.accentMuted,
    fontSize: 18,
    lineHeight: 18,
  },
  quoteMarkEnd: {
    color: colors.accentMuted,
    fontSize: 18,
    lineHeight: 18,
    alignSelf: 'flex-end',
  },
  quoteText: {
    color: colors.textSecondary,
    fontStyle: 'italic',
    lineHeight: 22,
    paddingHorizontal: spacing.xs,
  },
});
