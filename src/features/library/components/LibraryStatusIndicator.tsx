import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '@/components/common/AppText';
import type { LibraryCollectionStatus } from '../types/library-status';
import { colors } from '@/theme/colors';
import { borderRadius, spacing } from '@/theme/spacing';

export type LibraryStatusDisplay = 'full' | 'badge' | 'poster-progress';

interface LibraryStatusIndicatorProps {
  status: LibraryCollectionStatus;
  label?: string;
  detail?: string | null;
  progressPercentage?: number | null;
  display?: LibraryStatusDisplay;
}

function resolveAccentColor(status: LibraryCollectionStatus): string {
  switch (status) {
    case 'completed':
      return colors.libraryCompleted;
    case 'watching':
      return colors.libraryWatching;
    case 'saved':
      return colors.textSecondary;
    case 'liked':
      return colors.accent;
    case 'watched':
      return colors.libraryCompleted;
    default:
      return colors.textSecondary;
  }
}

function resolveIcon(
  status: LibraryCollectionStatus,
  filled = false,
): keyof typeof Ionicons.glyphMap {
  switch (status) {
    case 'completed':
      return 'checkmark-circle';
    case 'watching':
      return 'play-circle-outline';
    case 'saved':
      return filled ? 'bookmark' : 'bookmark-outline';
    case 'liked':
      return filled ? 'heart' : 'heart-outline';
    case 'watched':
      return 'checkmark-circle';
    default:
      return 'ellipse-outline';
  }
}

export function LibraryStatusIndicator({
  status,
  label = '',
  detail,
  progressPercentage,
  display = 'full',
}: LibraryStatusIndicatorProps) {
  const accent = resolveAccentColor(status);

  if (display === 'badge') {
    return (
      <View style={styles.badge} importantForAccessibility="no-hide-descendants">
        <Ionicons name={resolveIcon(status, status === 'liked')} size={12} color={accent} />
      </View>
    );
  }

  if (display === 'poster-progress') {
    if (
      progressPercentage == null ||
      progressPercentage <= 0 ||
      progressPercentage >= 100
    ) {
      return null;
    }

    return (
      <View
        style={styles.posterProgressOverlay}
        accessibilityRole="progressbar"
        accessibilityValue={{
          min: 0,
          max: 100,
          now: Math.round(progressPercentage),
        }}
        importantForAccessibility="no-hide-descendants"
      >
        <View
          style={[
            styles.posterProgressFill,
            {
              width: `${Math.min(progressPercentage, 100)}%`,
              backgroundColor: accent,
            },
          ]}
        />
      </View>
    );
  }

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
  badge: {
    position: 'absolute',
    top: spacing.xs,
    right: spacing.xs,
    width: 24,
    height: 24,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  posterProgressOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 4,
    backgroundColor: colors.progressTrack,
  },
  posterProgressFill: {
    height: '100%',
    borderRadius: borderRadius.full,
  },
});
