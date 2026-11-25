import { useEffect, useRef } from 'react';
import { Pressable, TextInput, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/theme/colors';
import { glass } from '@/theme/glass';
import { interaction } from '@/theme/interaction';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

interface LibraryInlineSearchInputProps {
  value: string;
  onChangeText: (value: string) => void;
  onClear: () => void;
  onCancel?: () => void;
  autoFocus?: boolean;
}

export function LibraryInlineSearchInput({
  value,
  onChangeText,
  onClear,
  onCancel,
  autoFocus = false,
}: LibraryInlineSearchInputProps) {
  const { t } = useTranslation();
  const inputRef = useRef<TextInput>(null);
  const showClear = value.length > 0;

  useEffect(() => {
    if (autoFocus) {
      const timer = setTimeout(() => inputRef.current?.focus(), 16);
      return () => clearTimeout(timer);
    }
  }, [autoFocus]);

  return (
    <View style={styles.row}>
      <View style={styles.field}>
        <Ionicons name="search-outline" size={18} color={colors.textMuted} />
        <TextInput
          ref={inputRef}
          accessibilityLabel={t('library.hub.searchPlaceholder')}
          accessibilityRole="search"
          value={value}
          onChangeText={onChangeText}
          placeholder={t('library.hub.searchPlaceholder')}
          placeholderTextColor={colors.textMuted}
          style={[styles.input, typography.bodySmall]}
          returnKeyType="search"
          autoCapitalize="none"
          autoCorrect={false}
          clearButtonMode="never"
        />
        {showClear ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('search.bar.clear')}
            onPress={onClear}
            hitSlop={8}
            style={({ pressed }) => pressed && { opacity: interaction.subtlePressedOpacity }}
          >
            <Ionicons name="close-circle" size={18} color={colors.textMuted} />
          </Pressable>
        ) : null}
      </View>
      {onCancel ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('common.cancel')}
          onPress={onCancel}
          hitSlop={8}
          style={({ pressed }) => [styles.cancel, pressed && { opacity: interaction.subtlePressedOpacity }]}
        >
          <Ionicons name="close" size={20} color={colors.textSecondary} />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  field: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    minHeight: 44,
    paddingHorizontal: spacing.md,
    borderRadius: 999,
    backgroundColor: glass.panelInput,
    borderWidth: 1,
    borderColor: glass.hairline,
  },
  input: {
    flex: 1,
    paddingVertical: spacing.sm,
    color: colors.textPrimary,
  },
  cancel: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
