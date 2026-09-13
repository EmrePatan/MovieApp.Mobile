import { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { colors } from '@/theme/colors';

export { DetailBackButton } from './DetailBackButton';

interface DetailScreenScaffoldProps {
  children: ReactNode;
}

export function DetailScreenScaffold({ children }: DetailScreenScaffoldProps) {
  return <View style={styles.screen}>{children}</View>;
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
});
