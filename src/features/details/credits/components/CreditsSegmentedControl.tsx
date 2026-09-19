import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';
import { AppText } from '@/components/common/AppText';
import { colors } from '@/theme/colors';
import { borderRadius, spacing } from '@/theme/spacing';
import { interaction } from '@/theme/interaction';

export type CreditsTab = 'cast' | 'crew';

interface CreditsSegmentedControlProps {
  activeTab: CreditsTab;
  onTabChange: (tab: CreditsTab) => void;
}

export function CreditsSegmentedControl({
  activeTab,
  onTabChange,
}: CreditsSegmentedControlProps) {
  const { t } = useTranslation();
  const tabs: { key: CreditsTab; label: string }[] = [
    { key: 'cast', label: t('details.credits.cast') },
    { key: 'crew', label: t('details.credits.crew') },
  ];

  return (
    <View style={styles.container} testID="credits-segmented-control">
      {tabs.map((tab) => {
        const isActive = tab.key === activeTab;

        return (
          <Pressable
            key={tab.key}
            accessibilityRole="button"
            accessibilityState={{ selected: isActive }}
            accessibilityLabel={tab.label}
            onPress={() => onTabChange(tab.key)}
            style={({ pressed }) => [
              styles.chip,
              isActive && styles.chipActive,
              pressed && styles.pressed,
            ]}
            testID={`credits-tab-${tab.key}`}
          >
            <AppText variant="caption" style={[styles.label, isActive && styles.labelActive]}>
              {tab.label}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    minHeight: 36,
    justifyContent: 'center',
  },
  chipActive: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  label: {
    color: colors.textPrimary,
    fontWeight: '600',
  },
  labelActive: {
    color: colors.background,
  },
  pressed: {
    opacity: interaction.pressedOpacity,
  },
});
