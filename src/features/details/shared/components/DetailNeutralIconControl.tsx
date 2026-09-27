import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { DETAIL_DIRECTIONAL_FRAME_BORDER } from '../detailDirectionalFrame';
import { DetailDirectionalFrame } from './DetailDirectionalFrame';
import { interaction } from '@/theme/interaction';

export const DETAIL_NEUTRAL_ICON_CONTROL_SIZE = interaction.touchTarget;
const INNER_SIZE = DETAIL_NEUTRAL_ICON_CONTROL_SIZE - DETAIL_DIRECTIONAL_FRAME_BORDER * 2;

interface DetailNeutralIconControlProps {
  children: ReactNode;
  surfaceColor?: string;
}

/** Circular hero/modal control with directional neutral frame (back, close, etc.). */
export function DetailNeutralIconControl({
  children,
  surfaceColor = 'rgba(10, 10, 15, 0.78)',
}: DetailNeutralIconControlProps) {
  return (
    <DetailDirectionalFrame
      variant="neutral"
      borderRadius={DETAIL_NEUTRAL_ICON_CONTROL_SIZE / 2}
      style={styles.frame}
    >
      <View style={[styles.surface, { backgroundColor: surfaceColor }]}>{children}</View>
    </DetailDirectionalFrame>
  );
}

const styles = StyleSheet.create({
  frame: {
    width: DETAIL_NEUTRAL_ICON_CONTROL_SIZE,
    height: DETAIL_NEUTRAL_ICON_CONTROL_SIZE,
  },
  surface: {
    width: INNER_SIZE,
    height: INNER_SIZE,
    borderRadius: INNER_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
