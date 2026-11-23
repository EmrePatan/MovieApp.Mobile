import { useEffect, useState, type ReactNode } from 'react';
import { Animated, Easing, Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '@/components/common/AppText';
import { colors } from '@/theme/colors';
import { glass } from '@/theme/glass';
import { spacing } from '@/theme/spacing';
import type { ProfileCount } from './ProfileCountStrip';

const COUNT_UP_MS = 700;

/** Counts 0 → target once when the target first becomes known, then follows later changes directly. */
function useCountUp(target: number) {
  const [shown, setShown] = useState(0);
  useEffect(() => {
    const value = new Animated.Value(0);
    const id = value.addListener(({ value: next }) => setShown(Math.round(next)));
    Animated.timing(value, {
      toValue: target,
      duration: COUNT_UP_MS,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
    return () => {
      value.removeListener(id);
      value.stopAnimation();
    };
  }, [target]);
  return shown;
}

function CountCell({
  count,
  divider,
  spread,
}: {
  count: ProfileCount;
  divider: boolean;
  spread: boolean;
}) {
  const shown = useCountUp(count.value);
  return (
    <>
      {divider ? <View style={styles.divider} /> : null}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${count.value} ${count.label}`}
        onPress={count.onPress}
        disabled={!count.onPress}
        hitSlop={8}
        style={({ pressed }) => [
          styles.item,
          spread && styles.itemSpread,
          pressed && styles.pressed,
        ]}
      >
        {count.icon ? (
          <Ionicons
            name={count.icon as keyof typeof Ionicons.glyphMap}
            size={17}
            color={colors.textSecondary}
          />
        ) : null}
        <View style={styles.cellText}>
          <AppText style={styles.value}>{shown}</AppText>
          <AppText style={styles.label} numberOfLines={1}>
            {count.label.toLowerCase()}
          </AppText>
        </View>
      </Pressable>
    </>
  );
}

/** Stat row: big counting-up numeral over a muted label, hairline dividers between cells. */
export function ProfileInlineCounts({
  counts,
  trailing,
  spread = true,
}: {
  counts: ProfileCount[];
  /** Optional control pinned to the right of the counts (e.g. edit button). */
  trailing?: ReactNode;
  /** Three equal full-width columns (default) or compact, left-aligned cells. */
  spread?: boolean;
}) {
  return (
    <View style={styles.wrap}>
      <View style={spread ? styles.row : styles.rowStart}>
        {counts.map((count, index) => (
          <CountCell key={count.key} count={count} divider={index > 0} spread={spread} />
        ))}
      </View>
      {trailing ? <View style={styles.trailing}>{trailing}</View> : null}
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
    alignItems: 'center',
  },
  rowStart: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 0,
    gap: spacing.md,
  },
  trailing: {
    flex: 1,
    minWidth: 0,
  },
  cellText: {
    gap: 1,
  },
  item: {
    flexShrink: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  itemSpread: {
    flex: 1,
    flexShrink: 1,
    justifyContent: 'center',
  },
  divider: {
    width: 1,
    height: 24,
    backgroundColor: glass.hairline,
  },
  value: {
    fontSize: 17,
    lineHeight: 21,
    fontWeight: '800',
    color: colors.textPrimary,
    fontVariant: ['tabular-nums'],
  },
  label: {
    fontSize: 11,
    lineHeight: 14,
    color: colors.textSecondary,
  },
  pressed: {
    opacity: 0.7,
  },
});
