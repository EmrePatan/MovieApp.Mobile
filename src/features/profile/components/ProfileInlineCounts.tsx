import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { AppText } from '@/components/common/AppText';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import type { ProfileCount } from './ProfileCountStrip';

/** Plain inline counts ("1 takipçi · 2 takip"): bold white numeral, muted label, no chrome. */
export function ProfileInlineCounts({
  counts,
  trailing,
}: {
  counts: ProfileCount[];
  /** Optional control pinned to the right of the counts (e.g. edit button). */
  trailing?: ReactNode;
}) {
  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        {counts.map((count) => (
          <Pressable
            key={count.key}
            accessibilityRole="button"
            accessibilityLabel={`${count.value} ${count.label}`}
            onPress={count.onPress}
            disabled={!count.onPress}
            hitSlop={8}
            style={({ pressed }) => [styles.item, pressed && styles.pressed]}
          >
            <AppText style={styles.value}>{count.value}</AppText>
            <AppText style={styles.label} numberOfLines={1}>
              {count.label.toLowerCase()}
            </AppText>
          </Pressable>
        ))}
      </View>
      {trailing}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    paddingTop: spacing.md,
  },
  row: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'baseline',
    flexWrap: 'wrap',
    columnGap: spacing.lg,
    rowGap: spacing.xs,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 5,
  },
  value: {
    fontSize: 16,
    lineHeight: 20,
    fontWeight: '700',
    color: colors.textPrimary,
    fontVariant: ['tabular-nums'],
  },
  label: {
    fontSize: 13,
    lineHeight: 18,
    color: colors.textSecondary,
  },
  pressed: {
    opacity: 0.7,
  },
});
