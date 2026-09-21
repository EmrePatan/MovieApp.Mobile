import type { ReactNode } from 'react';
import { StyleSheet, type ViewStyle } from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';
import { RenderBoundaryProbe } from '@/debug/render-boundary-probe';
import { createLayoutDiagnosticHandler, logNavigationDiagnostic } from '@/debug/navigation-diagnostics';
import { commonStyles } from '@/theme/theme';

/** Flex body style without minHeight:0, which collapsed native lists on Android. */
export const LIST_SCREEN_BODY_STYLE: ViewStyle = {
  flex: 1,
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
  if (__DEV__) {
    logNavigationDiagnostic('render:stack-list-screen', {
      testID,
      hasTopBar: Boolean(topBar),
      hasHeader: Boolean(header),
    });
  }

  return (
    <SafeAreaView
      style={commonStyles.screen}
      edges={edges}
      collapsable={false}
      testID={testID}
      onLayout={createLayoutDiagnosticHandler('stack-list-screen-root')}
    >
      {topBar ? (
        <RenderBoundaryProbe name="stack-list-top-bar">{topBar}</RenderBoundaryProbe>
      ) : null}
      {header ? (
        <RenderBoundaryProbe name="stack-list-header">{header}</RenderBoundaryProbe>
      ) : null}
      <RenderBoundaryProbe name="stack-list-body" style={styles.body} testID={testID ? `${testID}-body` : undefined}>
        {children}
      </RenderBoundaryProbe>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  body: LIST_SCREEN_BODY_STYLE,
});
