import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { AppText } from '@/components/common/AppText';
import {
  getOriginCountryLabel,
  getOriginCountryOptions,
} from '@/features/discovery/world-cinema-collections';
import { premiumSheet } from '@/theme/premium-sheet';
import { borderRadius, spacing } from '@/theme/spacing';

interface OriginCountrySelectorProps {
  value: string;
  expanded: boolean;
  onToggleExpanded: () => void;
  onSelect: (originCountry: string) => void;
  testID?: string;
}

export function OriginCountrySelector({
  value,
  expanded,
  onToggleExpanded,
  onSelect,
  testID,
}: OriginCountrySelectorProps) {
  const { t } = useTranslation();
  const countryLabel = getOriginCountryLabel(value);
  const originCountryOptions = getOriginCountryOptions();

  return (
    <View style={styles.container}>
      <AppText variant="bodySmall" muted>
        {t('common.originCountry')}
      </AppText>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${t('common.originCountry')} ${countryLabel}`}
        onPress={onToggleExpanded}
        style={({ pressed }) => [styles.selector, pressed && styles.pressed]}
        testID={testID}
      >
        <AppText variant="body">{countryLabel}</AppText>
        <Ionicons
          name={expanded ? 'chevron-up' : 'chevron-down'}
          size={18}
          color={premiumSheet.textSecondary}
        />
      </Pressable>
      {expanded ? (
        <View style={styles.options}>
          {originCountryOptions.map((option) => {
            const selected = option.code === value;

            return (
              <Pressable
                key={option.code}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                accessibilityLabel={option.label}
                onPress={() => onSelect(option.code)}
                style={({ pressed }) => [
                  styles.option,
                  selected && styles.optionSelected,
                  pressed && styles.pressed,
                ]}
              >
                <AppText variant="bodySmall" style={selected ? styles.optionLabelSelected : undefined}>
                  {option.label}
                </AppText>
                {selected ? (
                  <Ionicons name="checkmark" size={16} color={premiumSheet.mutedGold} />
                ) : null}
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
    borderWidth: 1,
    borderColor: premiumSheet.rowBorder,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: premiumSheet.secondary,
  },
  options: {
    gap: spacing.xs,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: premiumSheet.rowBorder,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: premiumSheet.secondary,
  },
  optionSelected: {
    borderColor: premiumSheet.goldBorder,
    backgroundColor: premiumSheet.elevated,
  },
  optionLabelSelected: {
    color: premiumSheet.mutedGold,
    fontWeight: '600',
  },
  pressed: {
    opacity: 0.85,
  },
});

