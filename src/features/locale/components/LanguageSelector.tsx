import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '@/components/common/AppText';
import { getLanguageFlagEmoji, getLanguageLabel } from '@/i18n/locale-tags';
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

function LanguageFlagBadge({ language }: { language: UiLanguage }) {
  return (
    <View style={styles.flagBadge} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <AppText style={styles.flagEmoji}>{getLanguageFlagEmoji(language)}</AppText>
    </View>
  );
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
  const selectedLabel = getLanguageLabel(value, viewerLanguage);

  return (
    <View style={styles.container} testID={testID}>
      <AppText variant="bodySmall" muted>
        {label}
      </AppText>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ expanded }}
        accessibilityLabel={`${label} ${selectedLabel}`}
        onPress={onToggleExpanded}
        style={({ pressed }) => [styles.selector, pressed && styles.pressed]}
      >
        <View style={styles.selectorContent}>
          <LanguageFlagBadge language={value} />
          <AppText variant="body">{selectedLabel}</AppText>
        </View>
        <Ionicons
          name={expanded ? 'chevron-up' : 'chevron-down'}
          size={18}
          color={colors.textSecondary}
        />
      </Pressable>

      {expanded ? (
        <View style={styles.options}>
          {SUPPORTED_UI_LANGUAGES.map((language) => {
            const selected = language === value;
            const optionLabel = getLanguageLabel(language, viewerLanguage);

            return (
              <Pressable
                key={language}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                accessibilityLabel={optionLabel}
                onPress={() => onSelect(language)}
                style={({ pressed }) => [
                  styles.option,
                  selected && styles.optionSelected,
                  pressed && styles.pressed,
                ]}
              >
                <View style={styles.optionContent}>
                  <LanguageFlagBadge language={language} />
                  <AppText
                    variant="bodySmall"
                    style={selected ? styles.optionLabelSelected : undefined}
                  >
                    {optionLabel}
                  </AppText>
                </View>
                {selected ? <Ionicons name="checkmark" size={16} color={colors.accent} /> : null}
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
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    minHeight: 48,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  selectorContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
  },
  options: {
    gap: spacing.xs,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  optionSelected: {
    borderColor: colors.borderAccent,
    backgroundColor: colors.accentTint12,
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
  },
  optionLabelSelected: {
    color: colors.accent,
    fontWeight: '600',
  },
  flagBadge: {
    width: 28,
    height: 28,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  flagEmoji: {
    fontSize: 16,
    lineHeight: 18,
  },
  pressed: {
    opacity: 0.85,
  },
});
