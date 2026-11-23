import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, type Href } from 'expo-router';
import { AppText } from '@/components/common/AppText';
import { colors } from '@/theme/colors';
import { glass } from '@/theme/glass';
import { spacing } from '@/theme/spacing';
import { useSeason } from '../../season/hooks/useSeason';
import { buildEpisodeDetailRoute } from '../../shared/routes';

interface EpisodeSiblingNavProps {
  tvShowId: string;
  seasonNumber: number;
  episodeNumber: number;
}

/** Previous / next episode shortcuts inside the same season. */
export function EpisodeSiblingNav({
  tvShowId,
  seasonNumber,
  episodeNumber,
}: EpisodeSiblingNavProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const season = useSeason(tvShowId, seasonNumber);

  const { previous, next } = useMemo(() => {
    const episodes = [...(season.data?.episodes ?? [])].sort(
      (a, b) => a.episodeNumber - b.episodeNumber,
    );
    return {
      previous: [...episodes].reverse().find((episode) => episode.episodeNumber < episodeNumber),
      next: episodes.find((episode) => episode.episodeNumber > episodeNumber),
    };
  }, [episodeNumber, season.data?.episodes]);

  if (!previous && !next) {
    return null;
  }

  // replace keeps "back" pointing at the season instead of stacking episodes.
  const go = (target: number) =>
    router.replace(buildEpisodeDetailRoute(tvShowId, seasonNumber, target) as Href);

  return (
    <View style={styles.row} testID="episode-sibling-nav">
      {previous ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('extras.previousEpisode')}
          onPress={() => go(previous.episodeNumber)}
          style={({ pressed }) => [styles.button, pressed && styles.pressed]}
        >
          <Ionicons name="chevron-back" size={16} color={colors.textSecondary} />
          <AppText variant="caption" style={styles.label}>
            {t('extras.previousEpisode')}
          </AppText>
        </Pressable>
      ) : (
        <View style={styles.spacer} />
      )}
      {next ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('extras.nextEpisode')}
          onPress={() => go(next.episodeNumber)}
          style={({ pressed }) => [styles.button, styles.primary, pressed && styles.pressed]}
          testID="episode-next-button"
        >
          <AppText variant="caption" style={[styles.label, styles.primaryLabel]}>
            {t('extras.nextEpisode')}
          </AppText>
          <Ionicons name="chevron-forward" size={16} color={colors.accent} />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  spacer: { flex: 1 },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    minHeight: 44,
    paddingHorizontal: spacing.md,
    borderRadius: 999,
    backgroundColor: glass.panel,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: glass.hairline,
  },
  primary: {
    marginLeft: 'auto',
    borderColor: 'rgba(236, 210, 150, 0.45)',
    backgroundColor: 'rgba(212, 179, 106, 0.12)',
  },
  label: { color: colors.textSecondary, fontWeight: '600' },
  primaryLabel: { color: colors.accent, fontWeight: '700' },
  pressed: { opacity: 0.85 },
});
