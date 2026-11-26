import { Pressable, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { AppText } from '@/components/common/AppText';
import { glass } from '@/theme/glass';
import { premiumSheet } from '@/theme/premium-sheet';
import { spacing } from '@/theme/spacing';

const TABS = [
  { undated: false, labelKey: 'extras.historyDatesTabDated', testID: 'watch-history-tab-dated' },
  {
    undated: true,
    labelKey: 'extras.historyDatesUnknownSection',
    testID: 'watch-history-tab-undated',
  },
];

interface WatchHistoryTabsProps {
  undated: boolean;
  onChange: (undated: boolean) => void;
}

export function WatchHistoryTabs({ undated, onChange }: WatchHistoryTabsProps) {
  const { t } = useTranslation();

  return (
    <View style={styles.row} accessibilityRole="tablist">
      {TABS.map((tab) => {
        const active = tab.undated === undated;
        const label = t(tab.labelKey);

        return (
          <Pressable
            key={tab.testID}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            accessibilityLabel={label}
            onPress={() => onChange(tab.undated)}
            style={[styles.tab, active && styles.tabActive]}
            hitSlop={{ top: 6, bottom: 6 }}
            testID={tab.testID}
          >
            <AppText style={[styles.label, active && styles.labelActive]} numberOfLines={1}>
              {label}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}

// Same compact pill track as the social feed segments.
const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: 2,
    padding: 3,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: glass.hairline,
    backgroundColor: glass.panelInput,
  },
  tab: {
    flex: 1,
    minHeight: 32,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.sm,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  tabActive: {
    backgroundColor: glass.accentFill,
    borderColor: glass.accentBorder,
  },
  label: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600',
    color: premiumSheet.textSecondary,
  },
  labelActive: { color: premiumSheet.textPrimary },
});
