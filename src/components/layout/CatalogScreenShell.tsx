import type { ReactNode } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';
import { describeViewStyle } from '@/debug/stack-layout-probe';
import {
  routeLayoutHandler,
  useRouteLayoutContext,
} from '@/debug/route-layout-probe';
import { commonStyles } from '@/theme/theme';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';

interface CatalogScreenShellProps {
  layoutScope: string;
  header?: ReactNode;
  children: ReactNode;
  edges?: Edge[];
  testID?: string;
}

/**
 * Root-stack shell with header sibling + flex:1 body. Used by discover-browse and streaming.
 */
export function CatalogScreenShell({
  layoutScope,
  header,
  children,
  edges = ['top', 'left', 'right'],
  testID,
}: CatalogScreenShellProps) {
  const route = useRouteLayoutContext();

  return (
    <SafeAreaView
      style={commonStyles.screen}
      edges={edges}
      testID={testID}
      onLayout={routeLayoutHandler(layoutScope, 'root', route, {
        testID,
        shell: 'CatalogScreenShell',
        style: describeViewStyle(commonStyles.screen),
      })}
    >
      {header ? (
        <View
          collapsable={false}
          onLayout={routeLayoutHandler(layoutScope, 'header', route, { testID })}
        >
          {header}
        </View>
      ) : null}
      <View
        testID={`${layoutScope}-body`}
        style={styles.body}
        collapsable={false}
        onLayout={routeLayoutHandler(layoutScope, 'body', route, {
          testID,
          style: describeViewStyle(styles.body),
          childrenHost: 'direct-sibling-after-canary',
          childrenWrapper: 'none',
          usesFragment: false,
          usesCloneElement: false,
        })}
      >
        {__DEV__ && Platform.OS === 'android' ? (
          <View
            testID={`${layoutScope}-body-canary`}
            collapsable={false}
            style={styles.bodyCanary}
            onLayout={routeLayoutHandler(layoutScope, 'body-canary', route, {
              testID,
              siblingOf: 'children',
            })}
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
  body: {
    flex: 1,
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
