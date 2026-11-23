import { BlurView } from 'expo-blur';
import { GlassView, isGlassEffectAPIAvailable, isLiquidGlassAvailable } from 'expo-glass-effect';
import type { ReactNode } from 'react';
import { Platform, StyleSheet, View, type StyleProp, type ViewProps, type ViewStyle } from 'react-native';
import { glass } from '@/theme/glass';

export type GlassTone = 'default' | 'accent';

export interface GlassSurfaceProps extends Omit<ViewProps, 'style'> {
  children?: ReactNode;
  /** Corner radius and layout. Radius is applied to the clip, so pass it here. */
  style?: StyleProp<ViewStyle>;
  /** `accent` gives the gold-tinted glass used for active / selected states. */
  tone?: GlassTone;
}

function detectNativeLiquidGlass(): boolean {
  if (Platform.OS !== 'ios') {
    return false;
  }
  try {
    return isGlassEffectAPIAvailable() && isLiquidGlassAvailable();
  } catch {
    return false;
  }
}

const hasNativeLiquidGlass = detectNativeLiquidGlass();

/**
 * Glass material with three tiers:
 * - iOS 26+: native Liquid Glass (`GlassView`)
 * - older iOS / web: `BlurView` with a lit edge
 * - Android: translucent solid fill (no blur) for predictable cost and legibility
 *
 * The effect is a sibling layer behind `children`, so child opacity never
 * affects the glass (a documented GlassView limitation).
 */
export function GlassSurface({ children, style, tone = 'default', ...rest }: GlassSurfaceProps) {
  const isAccent = tone === 'accent';
  const showsBorder = !hasNativeLiquidGlass;

  return (
    <View
      {...rest}
      style={[
        styles.clip,
        showsBorder && {
          borderWidth: glass.borderWidth,
          borderColor: isAccent ? glass.accentBorder : glass.border,
        },
        style,
      ]}
    >
      {hasNativeLiquidGlass ? (
        <GlassView
          pointerEvents="none"
          style={StyleSheet.absoluteFill}
          glassEffectStyle="regular"
          colorScheme="dark"
          tintColor={isAccent ? glass.accentTint : undefined}
        />
      ) : Platform.OS === 'android' ? (
        <View
          pointerEvents="none"
          style={[
            StyleSheet.absoluteFill,
            { backgroundColor: isAccent ? glass.accentFillSolid : glass.fillSolid },
          ]}
        />
      ) : (
        <>
          <BlurView
            pointerEvents="none"
            style={StyleSheet.absoluteFill}
            intensity={glass.blurIntensity}
            tint="dark"
          />
          <View
            pointerEvents="none"
            style={[
              StyleSheet.absoluteFill,
              { backgroundColor: isAccent ? glass.accentFill : glass.fill },
            ]}
          />
        </>
      )}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  clip: {
    overflow: 'hidden',
  },
});
