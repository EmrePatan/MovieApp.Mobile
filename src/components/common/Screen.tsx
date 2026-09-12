import { ReactNode } from 'react';
import { ScrollView, StyleSheet, View, ViewProps } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { commonStyles } from '@/theme/theme';
import { layout } from '@/theme/layout';

interface ScreenProps extends ViewProps {
  children: ReactNode;
  scrollable?: boolean;
  padded?: boolean;
}

export function Screen({
  children,
  scrollable = false,
  padded = true,
  style,
  ...props
}: ScreenProps) {
  const content = (
    <View style={[padded && styles.padded, style]} {...props}>
      {children}
    </View>
  );

  return (
    <SafeAreaView style={commonStyles.screen} edges={['top', 'left', 'right']}>
      {scrollable ? (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
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
  padded: {
    flex: 1,
    paddingHorizontal: layout.screenPaddingHorizontal,
    paddingVertical: layout.screenPaddingVertical,
  },
  scrollContent: {
    flexGrow: 1,
  },
});
