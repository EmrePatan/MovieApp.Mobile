import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';
import { describeViewStyle } from '@/debug/stack-layout-probe';
import {
  routeLayoutHandler,
  useRouteLayoutContext,
} from '@/debug/route-layout-probe';
import { commonStyles } from '@/theme/theme';

const LAYOUT_SCOPE = 'stack-list-screen';

interface StackListScreenProps {
  topBar?: ReactNode;
  header?: ReactNode;
  children: ReactNode;
  edges?: Edge[];
  testID?: string;
}

/**
 * Root-stack list shell with header siblings and a flex body host for scrollable content.
 */
export function StackListScreen({
  topBar,
  header,
  children,
  edges = ['top', 'left', 'right'],
  testID,
}: StackListScreenProps) {
  const route = useRouteLayoutContext();

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
        {children}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  bodyHost: {
    flex: 1,
    minHeight: 0,
  },
});
