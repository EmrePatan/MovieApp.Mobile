import { StyleSheet, View, type ViewStyle } from 'react-native';
import { colors } from '@/theme/colors';
import { borderRadius } from '@/theme/spacing';

interface SkeletonBlockProps {
  width: number | `${number}%`;
  height: number;
  style?: ViewStyle;
}

export function SkeletonBlock({ width, height, style }: SkeletonBlockProps) {
  return <View style={[styles.block, { width, height }, style]} accessibilityElementsHidden />;
}

const styles = StyleSheet.create({
  block: {
    borderRadius: borderRadius.md,
    backgroundColor: colors.skeleton,
  },
});
