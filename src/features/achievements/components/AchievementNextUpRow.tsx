import { StyleSheet, View } from 'react-native';
import { AppText } from '@/components/common/AppText';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { getFamilyHue, type AchievementFamily } from '../achievement-model';
import { useAchievementCopy } from '../useAchievementCopy';
import { AchievementMedal } from './AchievementMedal';

interface AchievementNextUpRowProps {
  family: AchievementFamily;
}

/** One "closest to unlocking" line: locked medal with progress arc, goal text, bar and counts. */
export function AchievementNextUpRow({ family }: AchievementNextUpRowProps) {
  const { t, familyName, goal, tierName } = useAchievementCopy();
  const next = family.next;
  if (!next) return null;

  const hue = getFamilyHue(family.category);
  const remaining = Math.max(0, next.target - family.currentValue);

  return (
    <View
      style={styles.row}
      accessible
      accessibilityLabel={`${familyName(family.category)}, ${tierName(next.tier)}, ${goal(
        family.category,
        next.target,
      )}, ${family.currentValue} / ${next.target}`}
    >
      <AchievementMedal
        category={family.category}
        tier={next.tier}
        locked
        progress={family.progress}
        size={48}
      />
      <View style={styles.copy}>
        <View style={styles.titleRow}>
          <AppText style={styles.name} numberOfLines={1}>
            {familyName(family.category)}
          </AppText>
          <AppText style={[styles.tier, { color: hue.light }]}>{tierName(next.tier)}</AppText>
        </View>
        <AppText variant="caption" style={styles.goal} numberOfLines={1}>
          {goal(family.category, next.target)}
        </AppText>
        <View style={styles.track}>
          <View
            style={[
              styles.fill,
              { width: `${Math.round(family.progress * 100)}%`, backgroundColor: hue.base },
            ]}
          />
        </View>
        <View style={styles.countRow}>
          <AppText variant="caption" style={styles.count}>
            {`${family.currentValue.toLocaleString()} / ${next.target.toLocaleString()}`}
          </AppText>
          <AppText variant="caption" style={styles.left}>
            {t('achievements.toGo', { count: remaining })}
          </AppText>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  copy: {
    flex: 1,
    gap: 3,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  name: {
    flexShrink: 1,
    color: colors.textPrimary,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '700',
  },
  tier: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '800',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  goal: {
    color: colors.textSecondary,
    lineHeight: 16,
  },
  track: {
    height: 5,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.08)',
    overflow: 'hidden',
    marginTop: 2,
  },
  fill: {
    height: '100%',
    borderRadius: 3,
  },
  countRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  count: {
    color: colors.textMuted,
    fontVariant: ['tabular-nums'],
  },
  left: {
    color: colors.accentMuted,
    fontWeight: '700',
  },
});
