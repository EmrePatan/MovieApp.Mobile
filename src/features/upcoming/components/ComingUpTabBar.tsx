import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';
import { AppText } from '@/components/common/AppText';
import type { ComingUpTab } from '../navigation/coming-up-navigation';
import { glass } from '@/theme/glass';
import { premiumSheet } from '@/theme/premium-sheet';
import { layout } from '@/theme/layout';
import { spacing } from '@/theme/spacing';

const TABS: ComingUpTab[] = ['for-you', 'upcoming'];

interface ComingUpTabBarProps {
  activeTab: ComingUpTab;
  onTabChange: (tab: ComingUpTab) => void;
}

export function ComingUpTabBar({ activeTab, onTabChange }: ComingUpTabBarProps) {
  const { t } = useTranslation();

  return (
    <View style={styles.container} accessibilityRole="tablist">
      {TABS.map((tabId) => {
        const selected = activeTab === tabId;
        const label =
          tabId === 'for-you' ? t('upcoming.tabs.forYou') : t('upcoming.tabs.upcoming');

        return (
          <Pressable
            key={tabId}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            accessibilityLabel={label}
            onPress={() => onTabChange(tabId)}
            style={[styles.tabButton, selected && styles.tabButtonSelected]}
          >
            <AppText
              variant="body"
              style={[styles.tabLabel, selected && styles.tabLabelSelected]}
            >
              {label}
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
    gap: spacing.xs,
    padding: spacing.xs,
    marginHorizontal: layout.screenPaddingHorizontal,
    marginTop: spacing.sm,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: glass.hairline,
    backgroundColor: glass.panelInput,
  },
  tabButton: {
    flex: 1,
    minHeight: 40,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  tabButtonSelected: {
    backgroundColor: glass.accentFill,
    borderColor: glass.accentBorder,
  },
  tabLabel: {
    color: premiumSheet.textSecondary,
    fontWeight: '500',
  },
  tabLabelSelected: {
    color: premiumSheet.textPrimary,
    fontWeight: '600',
  },
});
