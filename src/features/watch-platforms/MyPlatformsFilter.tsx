import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/auth/useAuth';
import { AppText } from '@/components/common/AppText';
import type { DiscoveryWatchProvider } from '@/features/discovery/watch-provider-types';
import { premiumSheet } from '@/theme/premium-sheet';
import { spacing } from '@/theme/spacing';
import { useWatchPlatforms } from './watch-platforms';

interface MyPlatformsFilterProps {
  availableProviders: DiscoveryWatchProvider[] | undefined;
  selectedProviderIds: number[];
  /** Receives the user's platforms to filter by, or an empty list to turn the filter off. */
  onChange: (providerIds: number[]) => void;
  /** Called when the user has no saved platforms and wants to pick them. */
  onChoose: () => void;
  /**
   * Set where this row is the only platform control: any applied filter shows as on, so it
   * can always be turned off, even after the saved platforms changed.
   */
  isOnlyPlatformControl?: boolean;
}

/** One-tap "only on my platforms" row in the discover filter sheet. */
export function MyPlatformsFilter({
  availableProviders,
  selectedProviderIds,
  onChange,
  onChoose,
  isOnlyPlatformControl = false,
}: MyPlatformsFilterProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const saved = useWatchPlatforms();

  if (!isAuthenticated || !saved.data) {
    return null;
  }

  const savedIds = saved.data.providerIds;

  const applied = isOnlyPlatformControl && selectedProviderIds.length > 0;

  if (savedIds.length === 0 && !applied) {
    return (
      <Pressable
        accessibilityRole="button"
        onPress={() => {
          onChoose();
          router.push('/profile/platforms');
        }}
        style={styles.row}
        testID="discover-my-platforms-choose"
      >
        <AppText variant="body" style={styles.label}>
          {t('extras.myPlatformsChoose')}
        </AppText>
        <Ionicons name="chevron-forward" size={18} color={premiumSheet.mutedGold} />
      </Pressable>
    );
  }

  const usableIds = savedIds.filter((id) =>
    availableProviders?.some((provider) => provider.providerId === id),
  );
  const unavailable = availableProviders !== undefined && usableIds.length === 0;
  const checked =
    applied ||
    (usableIds.length > 0 &&
      usableIds.length === selectedProviderIds.length &&
      usableIds.every((id) => selectedProviderIds.includes(id)));
  const disabled = !checked && usableIds.length === 0;

  return (
    <View style={styles.block}>
      <Pressable
        accessibilityRole="checkbox"
        accessibilityState={{ checked, disabled }}
        disabled={disabled}
        onPress={() => onChange(checked ? [] : usableIds)}
        style={[styles.row, checked && styles.rowChecked]}
        testID="discover-my-platforms"
      >
        <AppText variant="body" style={styles.label}>
          {t('extras.myPlatformsOnly')}
        </AppText>
        <Ionicons
          name={checked ? 'checkmark-circle' : 'ellipse-outline'}
          size={20}
          color={premiumSheet.mutedGold}
        />
      </Pressable>
      {unavailable && !checked ? (
        <AppText variant="caption" style={styles.note}>
          {t('extras.myPlatformsUnavailable')}
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  block: { gap: spacing.xs },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    // Same box as FilterSelectorRow, which sits next to this row.
    minHeight: 52,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: premiumSheet.rowBorder,
    backgroundColor: premiumSheet.secondary,
  },
  rowChecked: { borderColor: premiumSheet.goldBorder },
  label: { flexShrink: 1, color: premiumSheet.textPrimary },
  note: { color: premiumSheet.textSecondary },
});
