import type { LayoutChangeEvent, StyleProp, ViewStyle } from 'react-native';
import { StyleSheet } from 'react-native';
import { logNavigationDiagnostic } from './navigation-diagnostics';

export function logStackLayout(
  scope: string,
  event: LayoutChangeEvent,
  extra: Record<string, unknown> = {},
): void {
  if (!__DEV__) {
    return;
  }

  const { x, y, width, height } = event.nativeEvent.layout;
  logNavigationDiagnostic(scope, {
    x,
    y,
    width,
    height,
    ...extra,
  });
}

export function describeViewStyle(style: StyleProp<ViewStyle>): Record<string, unknown> {
  const flattened = StyleSheet.flatten(style);

  if (!flattened) {
    return {};
  }

  return {
    flex: flattened.flex,
    flexGrow: flattened.flexGrow,
    flexShrink: flattened.flexShrink,
    minHeight: flattened.minHeight,
    height: flattened.height,
    width: flattened.width,
    overflow: flattened.overflow,
    opacity: flattened.opacity,
    position: flattened.position,
    display: flattened.display,
  };
}
