import type { ReactNode } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';
import { describeViewStyle } from '@/debug/stack-layout-probe';
import { logNavigationDiagnostic } from '@/debug/navigation-diagnostics';
import {
  routeLayoutHandler,
  useRouteLayoutContext,
} from '@/debug/route-layout-probe';
import { commonStyles } from '@/theme/theme';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';

const LAYOUT_SCOPE = 'stack-list-screen';

interface StackListScreenProps {
  topBar?: ReactNode;
  header?: ReactNode;
  children: ReactNode;
  edges?: Edge[];
  testID?: string;
}

/**
 * Root-stack list shell. Children render inside a diagnostic body host without flex:1
 * so #45 can compare against working detail nested stacks and CatalogScreenShell.
 */
export function StackListScreen({
  topBar,
  header,
  children,
  edges = ['top', 'left', 'right'],
  testID,
}: StackListScreenProps) {
  const route = useRouteLayoutContext();

  if (__DEV__) {
    logNavigationDiagnostic(`layout:${LAYOUT_SCOPE}:trace`, {
      pathname: route.pathname,
      segments: route.segments,
      testID,
      hasTopBar: Boolean(topBar),
      hasHeader: Boolean(header),
      bodyHostStyle: describeViewStyle(styles.bodyHost),
    });
  }

  return (
    <SafeAreaView
      style={commonStyles.screen}
      edges={edges}
      testID={testID}
      onLayout={routeLayoutHandler(LAYOUT_SCOPE, 'root', route, {
        testID,
        shell: 'StackListScreen',
        style: describeViewStyle(commonStyles.screen),
      })}
    >
      {topBar ? (
        <View
          collapsable={false}
          onLayout={routeLayoutHandler(LAYOUT_SCOPE, 'topbar', route, { testID })}
        >
          {topBar}
        </View>
      ) : null}
      {header ? (
        <View
          collapsable={false}
          onLayout={routeLayoutHandler(LAYOUT_SCOPE, 'header', route, { testID })}
        >
          {header}
        </View>
      ) : null}
      <View
        testID="stack-list-screen-body"
        style={styles.bodyHost}
        collapsable={false}
        onLayout={routeLayoutHandler(LAYOUT_SCOPE, 'body', route, {
          testID,
          style: describeViewStyle(styles.bodyHost),
        })}
      >
        {__DEV__ && Platform.OS === 'android' ? (
          <View
            testID="stack-body-canary"
            collapsable={false}
            style={styles.bodyCanary}
            onLayout={routeLayoutHandler(LAYOUT_SCOPE, 'body-canary', route, { testID })}
          >
            <Text style={styles.bodyCanaryText}>BODY CANARY</Text>
          </View>
        ) : null}
        {children}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  bodyHost: {
    // Intentionally no flex:1 — documents the pre-fix StackListScreen body host.
  },
  bodyCanary: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.xs,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    backgroundColor: '#00FFFF',
    borderWidth: 1,
    borderColor: colors.accent,
  },
  bodyCanaryText: {
    color: '#000000',
    fontWeight: '700',
  },
});
