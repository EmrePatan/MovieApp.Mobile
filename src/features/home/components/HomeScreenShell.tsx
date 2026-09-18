import { type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@/theme/colors';

interface HomeScreenShellProps {
  children: ReactNode;
}

export function HomeScreenShell({ children }: HomeScreenShellProps) {
  return (
    <View style={styles.screen}>
      <SafeAreaView style={styles.foreground} edges={['top', 'left', 'right']}>
        {children}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  foreground: {
    flex: 1,
  },
});
