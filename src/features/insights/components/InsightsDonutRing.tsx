import { StyleSheet, View } from 'react-native';
import { colors } from '@/theme/colors';

interface InsightsDonutRingProps {
  size: number;
  strokeWidth: number;
  progressPercent: number;
}

export function InsightsDonutRing({
  size,
  strokeWidth,
  progressPercent,
}: InsightsDonutRingProps) {
  const clamped = Math.max(0, Math.min(100, progressPercent));
  const showAccent = clamped > 0;

  return (
    <View
      style={[
        styles.ring,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth: strokeWidth,
        },
      ]}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      {showAccent ? (
        <View
          style={[
            styles.progressArc,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              borderWidth: strokeWidth,
              transform: [{ rotate: `${-90 + (clamped / 100) * 360}deg` }],
            },
          ]}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  ring: {
    borderColor: colors.progressTrack,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressArc: {
    position: 'absolute',
    borderColor: colors.accent,
    borderTopColor: colors.accent,
    borderRightColor: colors.accent,
    borderBottomColor: 'transparent',
    borderLeftColor: 'transparent',
  },
});
