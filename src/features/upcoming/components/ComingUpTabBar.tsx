import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';
import { AppText } from '@/components/common/AppText';
import type { ComingUpTab } from '../navigation/coming-up-navigation';
import { colors } from '@/theme/colors';
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
            style={styles.tabButton}
          >
            <AppText
              variant="body"
              style={[styles.tabLabel, selected && styles.tabLabelSelected]}
            >
              {label}
            </AppText>
            {selected ? <View style={styles.indicator} /> : <View style={styles.indicatorSpacer} />}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: spacing.lg,
    paddingHorizontal: layout.screenPaddingHorizontal,
    paddingTop: spacing.sm,
  },
  tabButton: {
    minHeight: layout.touchTarget,
    justifyContent: 'center',
    paddingTop: spacing.xs,
  },
  tabLabel: {
    color: colors.textSecondary,
    fontWeight: '500',
  },
  tabLabelSelected: {
    color: colors.textPrimary,
    fontWeight: '600',
  },
  indicator: {
    marginTop: spacing.sm,
    height: 2,
    borderRadius: 1,
    backgroundColor: colors.accent,
  },
  indicatorSpacer: {
    marginTop: spacing.sm,
    height: 2,
  },
});
