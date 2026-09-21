import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';
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
  return (
    <SafeAreaView style={commonStyles.screen} edges={edges} testID={testID}>
      {header ? <View collapsable={false}>{header}</View> : null}
      <View testID={`${layoutScope}-body`} style={styles.body} collapsable={false}>
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
