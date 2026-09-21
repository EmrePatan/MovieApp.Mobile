import type { ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import {
  createLayoutDiagnosticHandler,
  logNavigationDiagnostic,
} from './navigation-diagnostics';

interface RenderBoundaryProbeProps {
  name: string;
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

export function RenderBoundaryProbe({
  name,
  children,
  style,
  testID,
}: RenderBoundaryProbeProps) {
  if (__DEV__) {
    logNavigationDiagnostic(`render:${name}`, {
      testID: testID ?? name,
    });
  }

  return (
    <View
      collapsable={false}
      style={style}
      testID={testID ?? `render-boundary-${name}`}
      onLayout={createLayoutDiagnosticHandler(name)}
    >
      {children}
    </View>
  );
}

export const renderProbeStyles = StyleSheet.create({
  flexBody: {
    flex: 1,
  },
});
