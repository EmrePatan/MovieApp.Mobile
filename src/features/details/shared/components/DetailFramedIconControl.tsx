import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { DETAIL_DIRECTIONAL_FRAME_BORDER } from '../detailDirectionalFrame';
import type { DetailDirectionalFrameVariant } from '../detailDirectionalFrame';
import { DetailDirectionalFrame } from './DetailDirectionalFrame';

interface DetailFramedIconControlProps {
  size: number;
  borderRadius: number;
  variant: DetailDirectionalFrameVariant;
  glow?: boolean;
  surfaceColor: string;
  children: ReactNode;
}

/** Square or rounded-rect icon button with directional frame (compact list / legacy actions). */
export function DetailFramedIconControl({
  size,
  borderRadius,
  variant,
  glow = false,
  surfaceColor,
  children,
}: DetailFramedIconControlProps) {
  const innerSize = size - DETAIL_DIRECTIONAL_FRAME_BORDER * 2;
  const innerRadius = Math.max(0, borderRadius - DETAIL_DIRECTIONAL_FRAME_BORDER);

  return (
    <DetailDirectionalFrame
      variant={variant}
      borderRadius={borderRadius}
      glow={glow}
      style={{ width: size, height: size }}
    >
      <View
        style={[
          styles.surface,
          {
            width: innerSize,
            height: innerSize,
            borderRadius: innerRadius,
            backgroundColor: surfaceColor,
          },
        ]}
      >
        {children}
      </View>
    </DetailDirectionalFrame>
  );
}

const styles = StyleSheet.create({
  surface: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
