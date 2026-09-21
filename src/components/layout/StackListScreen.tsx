import type { ReactNode } from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';
import { commonStyles } from '@/theme/theme';

export const LIST_SCREEN_BODY_STYLE: ViewStyle = {
  flex: 1,
  minHeight: 0,
};

interface StackListScreenProps {
  topBar?: ReactNode;
  header?: ReactNode;
  children: ReactNode;
  edges?: Edge[];
  testID?: string;
}

export function StackListScreen({
  topBar,
  header,
  children,
  edges = ['top', 'left', 'right'],
  testID,
}: StackListScreenProps) {
  return (
    <SafeAreaView style={commonStyles.screen} edges={edges} testID={testID}>
      {topBar ?? null}
      {header ?? null}
      <View style={styles.body} testID={testID ? `${testID}-body` : undefined}>
        {children}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  body: LIST_SCREEN_BODY_STYLE,
});
