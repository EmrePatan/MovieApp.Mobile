import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';
import { describeViewStyle } from '@/debug/stack-layout-probe';
import {
  routeLayoutHandler,
  useRouteLayoutContext,
} from '@/debug/route-layout-probe';
import { commonStyles } from '@/theme/theme';

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
        })}
      >
        {children}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  body: {
    flex: 1,
    minHeight: 0,
  },
});
