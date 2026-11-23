import type { ReactNode, RefObject } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { AppText } from '@/components/common/AppText';
import { SearchBar } from './SearchBar';
import { authTypography } from '@/features/auth/auth-typography';
import { useAuthFonts } from '@/features/auth/useAuthFonts';
import { colors } from '@/theme/colors';
import { interaction } from '@/theme/interaction';
import { layout } from '@/theme/layout';
import { spacing } from '@/theme/spacing';

interface SearchScreenHeaderProps {
  value: string;
  onChangeText: (value: string) => void;
  onSubmit: (submittedText?: string) => void;
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
  useAuthFonts();
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
          <AppText style={styles.title} accessibilityRole="header">
            {t('search.header.title')}
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
  title: {
    fontFamily: authTypography.wordmarkSemibold,
    fontSize: 30,
    lineHeight: 36,
    letterSpacing: -0.4,
  },
  pressed: {
    opacity: interaction.pressedOpacity,
  },
});
