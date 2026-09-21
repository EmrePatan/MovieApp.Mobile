import type { ReactNode } from 'react';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';
import { logNavigationDiagnostic } from '@/debug/navigation-diagnostics';
import { commonStyles } from '@/theme/theme';

interface StackListScreenProps {
  topBar?: ReactNode;
  header?: ReactNode;
  children: ReactNode;
  edges?: Edge[];
  testID?: string;
}

/**
 * Root-stack list shell aligned with working library screens (e.g. favorites):
 * SafeAreaView → optional chrome → scroll child, with no intermediate flex wrapper.
 */
export function StackListScreen({
  topBar,
  header,
  children,
  edges = ['top', 'left', 'right'],
  testID,
}: StackListScreenProps) {
  if (__DEV__) {
    logNavigationDiagnostic('trace:stack-list-screen', {
      testID,
      hasTopBar: Boolean(topBar),
      hasHeader: Boolean(header),
    });
  }

  return (
    <SafeAreaView style={commonStyles.screen} edges={edges} testID={testID}>
      {topBar ?? null}
      {header ?? null}
      {children}
    </SafeAreaView>
  );
}
