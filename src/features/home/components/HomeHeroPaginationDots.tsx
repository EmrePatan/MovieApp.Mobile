import { memo } from 'react';
import { StyleSheet, View } from 'react-native';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';

interface HomeHeroPaginationDotsProps {
  count: number;
  activeIndex: number;
}

export const HomeHeroPaginationDots = memo(function HomeHeroPaginationDots({
  count,
  activeIndex,
}: HomeHeroPaginationDotsProps) {
  if (count <= 1) {
    return null;
  }

  return (
    <View
      style={styles.row}
      accessibilityRole="tablist"
      importantForAccessibility="no-hide-descendants"
    >
      {Array.from({ length: count }, (_, index) => (
        <View
          key={index}
          style={[
            styles.dot,
            index === activeIndex ? styles.dotActive : styles.dotInactive,
          ]}
          accessibilityElementsHidden
          importantForAccessibility="no"
        />
      ))}
    </View>
  );
});

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  dot: {
    borderRadius: 999,
    height: 6,
  },
  dotActive: {
    width: 18,
    backgroundColor: colors.accent,
  },
  dotInactive: {
    width: 6,
    backgroundColor: 'rgba(245, 245, 247, 0.28)',
  },
});
