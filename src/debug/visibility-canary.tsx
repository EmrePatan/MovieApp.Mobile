import { Platform, StyleSheet, Text, View } from 'react-native';
import { logNavigationDiagnostic } from './navigation-diagnostics';

interface VisibilityCanaryProps {
  label: string;
}

/**
 * DEV-only Android visibility probe for #45 route-boundary diagnosis.
 * Must not ship to production builds (__DEV__ gate).
 */
export function VisibilityCanary({ label }: VisibilityCanaryProps) {
  if (!__DEV__ || Platform.OS !== 'android') {
    return null;
  }

  if (__DEV__) {
    logNavigationDiagnostic(`canary:render:${label}`, { label });
  }

  return (
    <View
      testID={`visibility-canary-${label}`}
      collapsable={false}
      onLayout={(event) => {
        const { width, height, x, y } = event.nativeEvent.layout;
        logNavigationDiagnostic(`canary:layout:${label}`, {
          label,
          width,
          height,
          x,
          y,
        });
      }}
      style={styles.canary}
    >
      <Text style={styles.text}>ANDROID {label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  canary: {
    marginHorizontal: 8,
    marginVertical: 4,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 3,
    borderColor: '#00FF00',
    backgroundColor: '#FF00FF',
    zIndex: 9999,
    elevation: 9999,
  },
  text: {
    color: '#000000',
    fontWeight: '900',
    fontSize: 16,
    letterSpacing: 0.5,
  },
});
