import { useEffect, useRef, type RefObject } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { colors } from '@/theme/colors';
import { borderRadius, spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { interaction } from '@/theme/interaction';

interface SearchBarProps {
  value: string;
  onChangeText: (value: string) => void;
  onSubmit: () => void;
  onClear: () => void;
  placeholder?: string;
  inputRef?: RefObject<TextInput | null>;
  autoFocus?: boolean;
}

export function SearchBar({
  value,
  onChangeText,
  onSubmit,
  onClear,
  placeholder,
  inputRef,
  autoFocus = false,
}: SearchBarProps) {
  const { t } = useTranslation();
  const internalInputRef = useRef<TextInput>(null);
  const resolvedInputRef = inputRef ?? internalInputRef;
  const showClear = value.length > 0;
  const resolvedPlaceholder = placeholder ?? t('search.bar.placeholder');

  useEffect(() => {
    if (!autoFocus) {
      return;
    }

    const focusTimer = setTimeout(() => {
      resolvedInputRef.current?.focus();
    }, 280);

    return () => {
      clearTimeout(focusTimer);
    };
  }, [autoFocus, resolvedInputRef]);

  return (
    <View style={styles.container}>
      <Ionicons name="search" size={18} color={colors.textMuted} style={styles.searchIcon} />
      <TextInput
        ref={resolvedInputRef}
        accessibilityLabel={t('search.bar.accessibility')}
        accessibilityRole="search"
        autoCapitalize="none"
        autoCorrect={false}
        clearButtonMode="never"
        placeholder={resolvedPlaceholder}
        placeholderTextColor={colors.textMuted}
        returnKeyType="search"
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        onSubmitEditing={onSubmit}
      />
      {showClear ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('search.bar.clear')}
          hitSlop={8}
          onPress={onClear}
          style={({ pressed }) => [styles.clearButton, pressed && styles.clearPressed]}
        >
          <Ionicons name="close-circle" size={18} color={colors.textMuted} />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 48,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
  },
  searchIcon: {
    marginRight: spacing.sm,
  },
  input: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: typography.body.fontSize,
    lineHeight: typography.body.lineHeight,
    paddingVertical: spacing.sm,
    paddingRight: spacing.xs,
  },
  clearButton: {
    minWidth: interaction.touchTarget,
    minHeight: interaction.touchTarget,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: -spacing.xs,
  },
  clearPressed: {
    opacity: interaction.subtlePressedOpacity,
  },
});
