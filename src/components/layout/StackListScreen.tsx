import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';
import { colors } from '@/theme/colors';
import { commonStyles } from '@/theme/theme';

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
  return (
    <SafeAreaView style={commonStyles.screen} edges={edges} testID={testID}>
      {topBar ? <View collapsable={false}>{topBar}</View> : null}
      {header ? <View collapsable={false} style={styles.header}>{header}</View> : null}
      <View testID="stack-list-screen-body" style={styles.bodyHost} collapsable={false}>
        {children}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: colors.background,
    zIndex: 1,
  },
  bodyHost: {
    flex: 1,
    minHeight: 0,
  },
});
