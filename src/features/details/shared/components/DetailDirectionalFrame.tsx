import type { ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  DETAIL_DIRECTIONAL_FRAME_BORDER,
  type DetailDirectionalFrameVariant,
  detailDirectionalFrameGoldGlow,
  detailDirectionalFrameGradient,
} from '../detailDirectionalFrame';

interface DetailDirectionalFrameProps {
  variant: DetailDirectionalFrameVariant;
  borderRadius: number;
  glow?: boolean;
  style?: StyleProp<ViewStyle>;
  children: ReactNode;
}

export function DetailDirectionalFrame({
  variant,
  borderRadius,
  glow = true,
  style,
  children,
}: DetailDirectionalFrameProps) {
  const gradient = detailDirectionalFrameGradient[variant];
  const innerRadius = Math.max(0, borderRadius - DETAIL_DIRECTIONAL_FRAME_BORDER);

  return (
    <View
      style={[
        styles.shell,
        { borderRadius },
        variant === 'gold' && glow && detailDirectionalFrameGoldGlow,
        style,
      ]}
    >
      <LinearGradient
        colors={gradient.colors}
        locations={gradient.locations}
        start={gradient.start}
        end={gradient.end}
        style={[styles.ring, { borderRadius }]}
      >
        <View style={[styles.inner, { borderRadius: innerRadius }]}>{children}</View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    alignSelf: 'flex-start',
  },
  ring: {
    padding: DETAIL_DIRECTIONAL_FRAME_BORDER,
  },
  inner: {
    overflow: 'hidden',
  },
});
