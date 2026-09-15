import type { ReactNode, RefObject } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '@/components/common/AppText';
import { SearchBar } from './SearchBar';
import { colors } from '@/theme/colors';
import { layout } from '@/theme/layout';
import { spacing } from '@/theme/spacing';

interface SearchScreenHeaderProps {
  value: string;
  onChangeText: (value: string) => void;
  onSubmit: () => void;
  onClear: () => void;
  onBack?: () => void;
  inputRef?: RefObject<TextInput | null>;
  autoFocus?: boolean;
  children?: ReactNode;
}

export function SearchScreenHeader({
  value,
  onChangeText,
  onSubmit,
  onClear,
  onBack,
  inputRef,
  autoFocus = false,
  children,
}: SearchScreenHeaderProps) {
  return (
    <View style={styles.container}>
      <View style={styles.titleRow}>
        {onBack ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Back"
            onPress={onBack}
            style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
          >
            <Ionicons name="chevron-back" size={22} color={colors.textPrimary} />
          </Pressable>
        ) : null}
        <AppText variant="bodySmall" muted style={styles.eyebrow} accessibilityRole="header">
          Search
        </AppText>
      </View>
      <SearchBar
        value={value}
        onChangeText={onChangeText}
        onSubmit={onSubmit}
        onClear={onClear}
        inputRef={inputRef}
        autoFocus={autoFocus}
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
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  backButton: {
    minWidth: layout.touchTarget,
    minHeight: layout.touchTarget,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: -spacing.sm,
  },
  eyebrow: {
    letterSpacing: 0.3,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  pressed: {
    opacity: 0.85,
  },
});
