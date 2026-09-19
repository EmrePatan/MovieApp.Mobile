import { Pressable, StyleSheet, View } from 'react-native';
import { AppText } from '@/components/common/AppText';
import { getLanguageLabel } from '@/i18n/locale-tags';
import type { UiLanguage } from '@/i18n/types';
import { SUPPORTED_UI_LANGUAGES } from '@/i18n/types';
import { colors } from '@/theme/colors';
import { borderRadius, spacing } from '@/theme/spacing';

interface LanguageSelectorProps {
  label: string;
  value: UiLanguage;
  viewerLanguage: UiLanguage;
  expanded: boolean;
  onToggleExpanded: () => void;
  onSelect: (language: UiLanguage) => void;
  testID?: string;
}

export function LanguageSelector({
  label,
  value,
  viewerLanguage,
  expanded,
  onToggleExpanded,
  onSelect,
  testID,
}: LanguageSelectorProps) {
  return (
    <View style={styles.container} testID={testID}>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ expanded }}
        onPress={onToggleExpanded}
        style={styles.trigger}
      >
        <AppText variant="bodySmall" muted>{label}</AppText>
        <AppText variant="body">{getLanguageLabel(value, viewerLanguage)}</AppText>
      </Pressable>

      {expanded ? (
        <View style={styles.options}>
          {SUPPORTED_UI_LANGUAGES.map((language) => {
            const selected = language === value;

            return (
              <Pressable
                key={language}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                onPress={() => onSelect(language)}
                style={[styles.option, selected && styles.optionSelected]}
              >
                <AppText variant="body">{getLanguageLabel(language, viewerLanguage)}</AppText>
              </Pressable>
            );
          })}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
  },
  trigger: {
    gap: spacing.xs,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  options: {
    gap: spacing.xs,
  },
  option: {
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  optionSelected: {
    borderColor: colors.accent,
    backgroundColor: colors.accentTint12,
  },
});
