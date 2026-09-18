import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { AppText } from '@/components/common/AppText';
import type { InsightsV3MovieDna } from '../types';
import { colors } from '@/theme/colors';
import { borderRadius, spacing } from '@/theme/spacing';

interface InsightsMovieDnaHeroProps {
  movieDna: InsightsV3MovieDna;
}

export function InsightsMovieDnaHero({ movieDna }: InsightsMovieDnaHeroProps) {
  const visibleGenres = movieDna.topGenres.slice(0, 3);
  const hasMix =
    movieDna.watchingMix.movieTitleCount + movieDna.watchingMix.seriesTitleCount > 0;

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[colors.accentTint18, colors.accentSurface]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <AppText variant="caption" muted style={styles.kicker}>
          Movie DNA
        </AppText>
        <AppText variant="title" style={styles.headline}>
          {movieDna.identityTitle}
        </AppText>

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
        ) : (
          <AppText variant="bodySmall" muted>
            Keep watching and rating to shape your Movie DNA.
          </AppText>
        )}

        {hasMix ? (
          <View
            style={styles.mixBlock}
            accessibilityRole="text"
            accessibilityLabel={`Movies ${movieDna.watchingMix.movieTitleCount}, series ${movieDna.watchingMix.seriesTitleCount}`}
          >
            <AppText variant="caption" muted style={styles.mixLabel}>
              Movies vs Series
            </AppText>
            <View style={styles.splitTrack}>
              <View
                style={[styles.movieFill, { flex: Math.max(movieDna.watchingMix.movieSharePercent, 1) }]}
              />
              <View
                style={[styles.seriesFill, { flex: Math.max(movieDna.watchingMix.seriesSharePercent, 1) }]}
              />
            </View>
            <View style={styles.mixLegend}>
              <AppText variant="caption" style={styles.mixValue}>
                Movies {movieDna.watchingMix.movieTitleCount} · {Math.round(movieDna.watchingMix.movieSharePercent)}%
              </AppText>
              <AppText variant="caption" style={styles.mixValue}>
                Series {movieDna.watchingMix.seriesTitleCount} · {Math.round(movieDna.watchingMix.seriesSharePercent)}%
              </AppText>
            </View>
          </View>
        ) : null}
      </LinearGradient>
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
    padding: spacing.lg,
    gap: spacing.md,
  },
  kicker: {
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  headline: {
    color: colors.textPrimary,
  },
  genreRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  genreChip: {
    borderRadius: borderRadius.full,
    backgroundColor: colors.accentTint12,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  genreText: {
    color: colors.accentStrong,
    fontWeight: '600',
  },
  mixBlock: {
    gap: spacing.sm,
    paddingTop: spacing.xs,
  },
  mixLabel: {
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  splitTrack: {
    flexDirection: 'row',
    height: 10,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
    backgroundColor: colors.progressTrack,
  },
  movieFill: {
    backgroundColor: colors.accent,
    minWidth: 4,
  },
  seriesFill: {
    backgroundColor: colors.libraryWatching,
    minWidth: 4,
  },
  mixLegend: {
    gap: 2,
  },
  mixValue: {
    color: colors.textSecondary,
  },
});
