import { StyleSheet, View, type ReactNode } from 'react-native';
import { layout } from '@/theme/layout';

interface DetailHeaderStackProps {
  children: ReactNode;
}

/** Groups hero, ratings rail, and library actions with one cross-platform gap rhythm. */
export function DetailHeaderStack({ children }: DetailHeaderStackProps) {
  return <View style={styles.stack}>{children}</View>;
}

const styles = StyleSheet.create({
  stack: {
    gap: layout.detailHeaderStack.gap,
    marginBottom: layout.detailHeaderStack.afterStack,
  },
});
