import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '@/components/common/AppText';
import type { ProfileMilestoneResponse } from '../types';
import { ProfileSectionHeader } from './ProfileSectionHeader';
import { colors } from '@/theme/colors';
import { borderRadius, spacing } from '@/theme/spacing';

interface ProfileMilestonesSectionProps {
  milestones: ProfileMilestoneResponse[];
}

export function ProfileMilestonesSection({ milestones }: ProfileMilestonesSectionProps) {
  if (milestones.length === 0) {
    return null;
  }

  return (
    <View style={styles.section}>
      <ProfileSectionHeader title="Milestones" subtitle="Quiet markers from your journey" />
      <View style={styles.list}>
        {milestones.map((milestone) => (
          <View
            key={milestone.id}
            style={styles.item}
            accessibilityRole="text"
            accessibilityLabel={`${milestone.title}. ${milestone.description}`}
          >
            <View style={styles.icon}>
              <Ionicons name="ribbon-outline" size={14} color={colors.accent} />
            </View>
            <View style={styles.copy}>
              <AppText variant="bodySmall" style={styles.title}>
                {milestone.title}
              </AppText>
              <AppText variant="caption" muted>
                {milestone.description}
              </AppText>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: spacing.sm,
  },
  list: {
    gap: spacing.sm,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    padding: spacing.sm,
  },
  icon: {
    width: 28,
    height: 28,
    borderRadius: borderRadius.full,
    backgroundColor: colors.accentTint12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  copy: {
    flex: 1,
    gap: 2,
  },
  title: {
    color: colors.textPrimary,
    fontWeight: '600',
  },
});
