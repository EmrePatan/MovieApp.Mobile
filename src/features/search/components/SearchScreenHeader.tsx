import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { AppText } from '@/components/common/AppText';
import { SearchBar } from './SearchBar';
import { layout } from '@/theme/layout';
import { spacing } from '@/theme/spacing';

interface SearchScreenHeaderProps {
  value: string;
  onChangeText: (value: string) => void;
  onSubmit: () => void;
  onClear: () => void;
  children?: ReactNode;
}

export function SearchScreenHeader({
  value,
  onChangeText,
  onSubmit,
  onClear,
  children,
}: SearchScreenHeaderProps) {
  return (
    <View style={styles.container}>
      <AppText variant="bodySmall" muted style={styles.eyebrow} accessibilityRole="header">
        Search
      </AppText>
      <SearchBar
        value={value}
        onChangeText={onChangeText}
        onSubmit={onSubmit}
        onClear={onClear}
      />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: spacing.sm,
    paddingHorizontal: layout.screenPaddingHorizontal,
    gap: spacing.sm,
  },
  eyebrow: {
    letterSpacing: 0.3,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
});
