import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { AppButton } from '@/components/buttons/AppButton';
import { AppText } from '@/components/common/AppText';
import type { WatchlistSummaryResponse } from '../types';
import { colors } from '@/theme/colors';
import { borderRadius, spacing } from '@/theme/spacing';

interface WatchlistSelectorProps {
  watchlists: WatchlistSummaryResponse[];
  selectedWatchlistId: string | null;
  isLoading: boolean;
  isError: boolean;
  onSelect: (watchlistId: string) => void;
  onCreatePress: () => void;
  onRetry: () => void;
}

export function WatchlistSelector({
  watchlists,
  selectedWatchlistId,
  isLoading,
  isError,
  onSelect,
  onCreatePress,
  onRetry,
}: WatchlistSelectorProps) {
  const [visible, setVisible] = useState(false);

  const selectedWatchlist = useMemo(
    () => watchlists.find((watchlist) => watchlist.id === selectedWatchlistId) ?? null,
    [selectedWatchlistId, watchlists],
  );

  const sortedWatchlists = useMemo(
    () => [...watchlists].sort((left, right) => left.name.localeCompare(right.name)),
    [watchlists],
  );

  return (
    <>
      <View style={styles.container}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={
            selectedWatchlist
              ? `Selected watchlist ${selectedWatchlist.name}. Change watchlist.`
              : 'Select watchlist'
          }
          disabled={isLoading || watchlists.length === 0}
          onPress={() => setVisible(true)}
          style={({ pressed }) => [styles.selector, pressed && styles.pressed]}
        >
          <View style={styles.selectorMeta}>
            <AppText variant="caption" muted>
              Selected list
            </AppText>
            <AppText variant="body">
              {selectedWatchlist?.name ?? 'Choose a watchlist'}
            </AppText>
          </View>
          <Ionicons name="chevron-down" size={20} color={colors.textSecondary} />
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Create watchlist"
          onPress={onCreatePress}
          style={({ pressed }) => [styles.createButton, pressed && styles.pressed]}
        >
          <Ionicons name="add" size={22} color={colors.textPrimary} />
        </Pressable>
      </View>

      <Modal visible={visible} animationType="slide" transparent onRequestClose={() => setVisible(false)}>
        <View style={styles.overlay}>
          <SafeAreaView style={styles.sheet} edges={['bottom']}>
            <View style={styles.sheetHeader}>
              <AppText variant="subtitle">Your Watchlists</AppText>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Close watchlist selector"
                onPress={() => setVisible(false)}
              >
                <Ionicons name="close" size={24} color={colors.textPrimary} />
              </Pressable>
            </View>

            {isLoading ? (
              <View style={styles.centered}>
                <ActivityIndicator color={colors.accent} />
              </View>
            ) : isError ? (
              <View style={styles.centered}>
                <AppText variant="bodySmall" muted center>
                  Could not load watchlists.
                </AppText>
                <AppButton title="Retry" variant="ghost" onPress={onRetry} />
              </View>
            ) : sortedWatchlists.length === 0 ? (
              <View style={styles.centered}>
                <AppText variant="bodySmall" muted center>
                  You do not have any watchlists yet.
                </AppText>
                <AppButton
                  title="Create Watchlist"
                  variant="secondary"
                  onPress={() => {
                    setVisible(false);
                    onCreatePress();
                  }}
                />
              </View>
            ) : (
              <ScrollView contentContainerStyle={styles.list}>
                {sortedWatchlists.map((watchlist) => {
                  const selected = watchlist.id === selectedWatchlistId;

                  return (
                    <Pressable
                      key={watchlist.id}
                      accessibilityRole="button"
                      accessibilityLabel={`Select ${watchlist.name}`}
                      accessibilityState={{ selected }}
                      onPress={() => {
                        onSelect(watchlist.id);
                        setVisible(false);
                      }}
                      style={({ pressed }) => [
                        styles.row,
                        selected && styles.rowSelected,
                        pressed && styles.pressed,
                      ]}
                    >
                      <View style={styles.rowMeta}>
                        <AppText variant="body">{watchlist.name}</AppText>
                        <AppText variant="caption" muted>
                          {watchlist.itemCount} items
                        </AppText>
                      </View>
                      {selected ? (
                        <Ionicons name="checkmark-circle" size={22} color={colors.accent} />
                      ) : null}
                    </Pressable>
                  );
                })}
              </ScrollView>
            )}
          </SafeAreaView>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  selector: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    minHeight: 56,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceElevated,
  },
  selectorMeta: {
    flex: 1,
    gap: 2,
  },
  createButton: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: colors.overlay,
  },
  sheet: {
    maxHeight: '70%',
    backgroundColor: colors.surface,
    borderTopLeftRadius: borderRadius.lg,
    borderTopRightRadius: borderRadius.lg,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
    gap: spacing.md,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  list: {
    gap: spacing.sm,
    paddingBottom: spacing.lg,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceElevated,
  },
  rowSelected: {
    borderColor: colors.accent,
  },
  rowMeta: {
    flex: 1,
    gap: spacing.xs,
  },
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.lg,
  },
  pressed: {
    opacity: 0.85,
  },
});
