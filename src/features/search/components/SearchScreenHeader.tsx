import type { ReactNode, RefObject } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { AppText } from '@/components/common/AppText';
import { SearchBar } from './SearchBar';
import { colors } from '@/theme/colors';
import { interaction } from '@/theme/interaction';
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
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <View style={styles.titleRow}>
        {onBack ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('search.header.back')}
            onPress={onBack}
            style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
          >
            <Ionicons name="chevron-back" size={24} color={colors.textPrimary} />
            <AppText variant="body">{t('search.header.back')}</AppText>
          </Pressable>
        ) : (
          <AppText variant="bodySmall" muted style={styles.eyebrow} accessibilityRole="header">
            Search
          </AppText>
        )}
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
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    minWidth: interaction.touchTarget,
    minHeight: interaction.touchTarget,
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    paddingRight: spacing.md,
    marginLeft: -spacing.sm,
  },
  eyebrow: {
    letterSpacing: 0.3,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  pressed: {
    opacity: interaction.pressedOpacity,
  },
});
