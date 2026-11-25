import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';
import { AppText } from '@/components/common/AppText';
import { premiumSheet } from '@/theme/premium-sheet';
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
    backgroundColor: premiumSheet.secondary,
    borderWidth: 1,
    borderColor: premiumSheet.rowBorder,
    minHeight: 36,
    justifyContent: 'center',
  },
  chipActive: {
    backgroundColor: premiumSheet.elevated,
    borderColor: premiumSheet.goldBorder,
  },
  label: {
    color: premiumSheet.textPrimary,
    fontWeight: '600',
  },
  labelActive: {
    color: premiumSheet.mutedGold,
  },

  pressed: {
    opacity: interaction.pressedOpacity,
  },
});
