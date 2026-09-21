import type { ReactNode } from 'react';
import { View } from 'react-native';
import { logNavigationDiagnostic } from './navigation-diagnostics';

interface FlatListRowProbeProps {
  scope: string;
  index: number;
  itemId: string;
  children: ReactNode;
}

/** DEV-only row pipeline logging for #45 Android FlatList visibility diagnosis. */
export function FlatListRowProbe({
  scope,
  index,
  itemId,
  children,
}: FlatListRowProbeProps) {
  if (__DEV__ && index === 0) {
    logNavigationDiagnostic(`${scope}:renderItem:index0`, { itemId });
  }

  if (index !== 0) {
    return <>{children}</>;
  }

  return (
    <View
      collapsable={false}
      onLayout={(event) => {
        if (!__DEV__) {
          return;
        }

        const { width, height, x, y } = event.nativeEvent.layout;
        logNavigationDiagnostic(`${scope}:row:layout:index0`, {
          itemId,
          width,
          height,
          x,
          y,
        });
      }}
    >
      {children}
    </View>
  );
}
