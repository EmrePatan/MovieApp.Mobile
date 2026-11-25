import { Pressable, StyleSheet, View } from 'react-native';
import { AppText } from '@/components/common/AppText';
import { authTypography } from '@/features/auth/auth-typography';
import { colors } from '@/theme/colors';
import { glass } from '@/theme/glass';
import { spacing } from '@/theme/spacing';

export interface ProfileCount {
  key: string;
  value: number;
  label: string;
  onPress?: () => void;
  /** Optional Ionicons glyph shown beside the numeral (compact stat rows). */
  icon?: string;
}

/** Glass strip of tappable counts: gold serif numeral over a lowercase label. */
export function ProfileCountStrip({ counts }: { counts: ProfileCount[] }) {
  return (
    <View style={styles.strip}>
      {counts.map((count, index) => (
        <View key={count.key} style={styles.item}>
          {index > 0 ? <View style={styles.divider} /> : null}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`${count.value} ${count.label}`}
            onPress={count.onPress}
            disabled={!count.onPress}
            hitSlop={6}
            style={({ pressed }) => [styles.cell, pressed && styles.pressed]}
          >
            <AppText style={styles.value}>{count.value}</AppText>
            <AppText style={styles.label} numberOfLines={1}>
              {count.label.toLowerCase()}
            </AppText>
          </Pressable>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  strip: {
    flexDirection: 'row',
    alignItems: 'stretch',
    marginTop: spacing.sm,
    paddingVertical: spacing.sm,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: glass.hairline,
    backgroundColor: glass.panel,
  },
  item: { flex: 1, flexDirection: 'row' },
  divider: {
    width: StyleSheet.hairlineWidth,
    backgroundColor: glass.hairline,
    marginVertical: 2,
  },
  cell: { flex: 1, alignItems: 'center', gap: 2 },
  value: {
    fontFamily: authTypography.wordmarkSemibold,
    fontSize: 20,
    lineHeight: 26,
    color: colors.accent,
    fontVariant: ['tabular-nums'],
  },
  label: { fontSize: 11, lineHeight: 14, color: colors.textSecondary },
  pressed: { opacity: 0.88 },
});
