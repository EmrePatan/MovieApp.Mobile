import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { AppText } from '@/components/common/AppText';
import type { SocialProfileMilestone } from '../types';
import { colors } from '@/theme/colors';
import { layout } from '@/theme/layout';
import { borderRadius, spacing } from '@/theme/spacing';

interface SocialProfileMilestoneListProps {
  milestones: SocialProfileMilestone[];
}

export function SocialProfileMilestoneList({ milestones }: SocialProfileMilestoneListProps) {
  const { t } = useTranslation();

  if (milestones.length === 0) {
    return null;
  }

  return (
    <View style={styles.section}>
      <AppText variant="subtitle" style={styles.sectionTitle}>
        {t('social.achievements')}
      </AppText>
      <View style={styles.list}>
        {milestones.map((milestone) => (
          <View key={milestone.id} style={styles.card}>
            <View style={styles.iconWrap}>
              <Ionicons name="trophy" size={18} color={colors.accent} />
            </View>
            <View style={styles.copy}>
              <AppText variant="bodySmall" style={styles.title}>
                {milestone.title}
              </AppText>
              <AppText variant="caption" muted numberOfLines={3}>
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
    paddingHorizontal: layout.screenPaddingHorizontal,
    marginTop: spacing.md,
  },
  sectionTitle: {
    fontWeight: '700',
  },
  list: {
    gap: spacing.sm,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.borderSubtle,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.accentTint12,
  },
  copy: {
    flex: 1,
    gap: spacing.xs,
  },
  title: {
    fontWeight: '600',
  },
});