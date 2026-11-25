import { ReactNode } from 'react';
import { ScrollView, StyleSheet, View, ViewProps } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { commonStyles } from '@/theme/theme';
import { layout } from '@/theme/layout';

interface ScreenProps extends ViewProps {
  children: ReactNode;
  scrollable?: boolean;
  padded?: boolean;
  /** Scrollable forms: the scroll view lifts focused fields above the keyboard (iOS). */
  keyboardAware?: boolean;
}

export function Screen({
  children,
  scrollable = false,
  padded = true,
  keyboardAware = false,
  style,
  ...props
}: ScreenProps) {
  const content = (
    <View style={[styles.container, padded && styles.padded, style]} {...props}>
      {children}
    </View>
  );

  return (
    <SafeAreaView style={commonStyles.screen} edges={['top', 'left', 'right']}>
      {scrollable ? (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          automaticallyAdjustKeyboardInsets={keyboardAware}
          showsVerticalScrollIndicator={false}
        >
          {content}
        </ScrollView>
      ) : (
        content
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  padded: {
    paddingHorizontal: layout.screenPaddingHorizontal,
    paddingVertical: layout.screenPaddingVertical,
  },
  scrollContent: {
    flexGrow: 1,
  },
});
