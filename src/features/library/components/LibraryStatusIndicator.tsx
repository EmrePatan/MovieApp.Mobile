import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '@/components/common/AppText';
import type { LibraryCollectionStatus } from '../types/library-status';
import { colors } from '@/theme/colors';
import { borderRadius, spacing } from '@/theme/spacing';

interface LibraryStatusIndicatorProps {
  status: LibraryCollectionStatus;
  label: string;
  detail?: string | null;
  progressPercentage?: number | null;
}

function resolveAccentColor(status: LibraryCollectionStatus): string {
  switch (status) {
    case 'completed':
      return colors.libraryCompleted;
    case 'watching':
      return colors.libraryWatching;
    case 'saved':
      return colors.textSecondary;
    case 'watched':
      return colors.libraryCompleted;
    default:
      return colors.textSecondary;
  }
}

function resolveIcon(status: LibraryCollectionStatus): keyof typeof Ionicons.glyphMap {
  switch (status) {
    case 'completed':
      return 'checkmark-circle-outline';
    case 'watching':
      return 'play-circle-outline';
    case 'saved':
      return 'bookmark-outline';
    case 'watched':
      return 'eye-outline';
    default:
      return 'ellipse-outline';
  }
}

export function LibraryStatusIndicator({
  status,
  label,
  detail,
  progressPercentage,
}: LibraryStatusIndicatorProps) {
  const accent = resolveAccentColor(status);

  return (
    <View style={styles.container} accessibilityRole="text">
      <View style={[styles.accentRail, { backgroundColor: accent }]} />
      <View style={styles.content}>
        <View style={styles.labelRow}>
          <Ionicons name={resolveIcon(status)} size={14} color={accent} />
          <AppText variant="caption" style={[styles.label, { color: accent }]}>
            {label}
          </AppText>
          {detail ? (
            <AppText variant="caption" muted>
              {detail}
            </AppText>
          ) : null}
        </View>
        {progressPercentage != null && progressPercentage > 0 && progressPercentage < 100 ? (
          <View
            style={styles.progressTrack}
            accessibilityRole="progressbar"
            accessibilityValue={{
              min: 0,
              max: 100,
              now: Math.round(progressPercentage),
            }}
          >
            <View
              style={[
                styles.progressFill,
                { width: `${Math.min(progressPercentage, 100)}%`, backgroundColor: accent },
              ]}
            />
          </View>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: spacing.sm,
  },
  accentRail: {
    width: 3,
    borderRadius: borderRadius.sm,
  },
  content: {
    flex: 1,
    gap: spacing.xs,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  label: {
    fontWeight: '600',
  },
  progressTrack: {
    height: 3,
    borderRadius: borderRadius.full,
    backgroundColor: colors.progressTrack,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: borderRadius.full,
  },
});
