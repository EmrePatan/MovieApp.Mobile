import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '@/components/common/AppText';
import { resolveTabBarLayoutMetrics } from '@/features/navigation/tab-bar-layout-metrics';
import { colors } from '@/theme/colors';
import { glass } from '@/theme/glass';
import { interaction } from '@/theme/interaction';
import { borderRadius, spacing } from '@/theme/spacing';
import {
  isWatchHistoryHintHeld,
  subscribeWatchHistoryHint,
  subscribeWatchHistoryHintHold,
} from '../utils/watch-history-hint-requests';
import {
  claimWatchHistoryHintShow,
  markWatchHistoryHintLearned,
} from '../utils/watch-history-hint-storage';

export const WATCH_HISTORY_HINT_DURATION_MS = 6000;

interface HintToast {
  id: number;
  count: number | null;
  claimed: boolean;
}

/**
 * A one-line toast above the tab bar that points to the watch history. It leaves by itself
 * and stops appearing once the user knows the way (see the storage rules).
 */
export function WatchHistoryHint() {
  const { t } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  /** `null` means nothing to show. A show is counted (`claimed`) only once nothing covers it. */
  const [toast, setToast] = useState<HintToast | null>(null);
  const held = useSyncExternalStore(subscribeWatchHistoryHintHold, isWatchHistoryHintHeld);
  const claimingRef = useRef<number | null>(null);
  const requestIdRef = useRef(0);

  useEffect(
    () =>
      subscribeWatchHistoryHint((count) => {
        requestIdRef.current += 1;
        const id = requestIdRef.current;
        // A toast already counted stays counted; only its text changes.
        setToast((current) => ({ id, count, claimed: current?.claimed ?? false }));
      }),
    [],
  );

  useEffect(() => {
    if (held || !toast || toast.claimed || claimingRef.current === toast.id) {
      return;
    }

    const { id } = toast;
    claimingRef.current = id;
    void claimWatchHistoryHintShow().then((allowed) => {
      setToast((current) => {
        if (current?.id !== id) {
          return current;
        }

        return allowed ? { ...current, claimed: true } : null;
      });
    });
  }, [held, toast]);

  const visible = !held && toast?.claimed === true;

  // Covered again before it left: the full duration restarts once uncovered.
  useEffect(() => {
    if (!visible) {
      return;
    }

    const timer = setTimeout(() => setToast(null), WATCH_HISTORY_HINT_DURATION_MS);
    return () => clearTimeout(timer);
  }, [visible, toast?.id]);

  if (!visible || !toast) {
    return null;
  }

  const message =
    toast.count === null
      ? t('extras.historyHintMessage')
      : t('extras.historyHintMessageCount', { count: toast.count });

  return (
    <View
      style={[styles.host, { bottom: resolveTabBarLayoutMetrics(insets).totalHeight + spacing.md }]}
      pointerEvents="box-none"
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${message}. ${t('extras.historyHintAction')}`}
        accessibilityLiveRegion="polite"
        onPress={() => {
          setToast(null);
          void markWatchHistoryHintLearned();
          router.push('/watch-history');
        }}
        style={({ pressed }) => [styles.toast, pressed && styles.pressed]}
        testID="watch-history-hint"
      >
        <AppText variant="caption" numberOfLines={1} style={styles.message}>
          {message}
        </AppText>
        <View style={styles.action}>
          <AppText variant="caption" numberOfLines={1} style={styles.actionText}>
            {t('extras.historyHintAction')}
          </AppText>
          <Ionicons name="chevron-forward" size={14} color={colors.accent} />
        </View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  host: {
    position: 'absolute',
    left: spacing.lg,
    right: spacing.lg,
    alignItems: 'center',
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    maxWidth: '100%',
    minHeight: 44,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: glass.hairline,
    shadowColor: '#000',
    shadowOpacity: 0.45,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  message: {
    flexShrink: 1,
    color: colors.textPrimary,
  },
  action: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  actionText: {
    color: colors.accent,
    fontWeight: '600',
  },
  pressed: {
    opacity: interaction.pressedOpacity,
  },
});
