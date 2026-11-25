import { useCallback, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAuth } from '@/auth/useAuth';
import { AppButton } from '@/components/buttons/AppButton';
import { AppText } from '@/components/common/AppText';
import { authTypography } from '@/features/auth/auth-typography';
import { useAuthFonts } from '@/features/auth/useAuthFonts';
import { DetailBackButton } from '@/features/details/shared/components/DetailScreenScaffold';
import { NotificationsInboxSegmentTabs } from '@/features/notifications/components/NotificationsInboxSegmentTabs';
import { ReleasesNotificationsPane } from '@/features/notifications/components/ReleasesNotificationsPane';
import { SocialNotificationsPane } from '@/features/notifications/components/SocialNotificationsPane';
import { useCombinedUnreadNotificationCount } from '@/features/notifications/hooks/useCombinedUnreadNotificationCount';
import { useMarkAllNotificationsRead } from '@/features/notifications/hooks/useMarkAllNotificationsRead';
import {
  parseNotificationsInboxSegment,
  type NotificationsInboxSegment,
} from '@/features/notifications/types-inbox';
import { useMarkAllSocialNotificationsRead } from '@/features/social/hooks/useSocialMutations';
import { ScrollToTopFab } from '@/features/navigation/ScrollToTopFab';
import { useFlatListScrollToTopControl } from '@/features/navigation/useFlatListScrollToTopControl';
import { colors } from '@/theme/colors';
import { layout } from '@/theme/layout';
import { premiumSheet } from '@/theme/premium-sheet';
import { spacing } from '@/theme/spacing';

export default function NotificationsScreen() {
  const { t } = useTranslation();
  useAuthFonts();
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const params = useLocalSearchParams<{ tab?: string | string[] }>();
  const initialSegment = parseNotificationsInboxSegment(params.tab) ?? 'releases';

  const [segment, setSegment] = useState<NotificationsInboxSegment>(initialSegment);
  const unread = useCombinedUnreadNotificationCount();
  const markAllReleasesRead = useMarkAllNotificationsRead();
  const markAllSocialRead = useMarkAllSocialNotificationsRead();
  const listRef = useRef<FlatList>(null);
  const { fabVisible, onListScroll, scrollToTop, scrollEventThrottle } =
    useFlatListScrollToTopControl(listRef);

  const activeHasUnread = segment === 'social' ? unread.socialUnread > 0 : unread.releasesUnread > 0;
  const markAllPending =
    segment === 'social' ? markAllSocialRead.isPending : markAllReleasesRead.isPending;

  const handleSignIn = useCallback(() => {
    router.push('/(auth)/login');
  }, [router]);

  const handleMarkAllRead = useCallback(() => {
    if (markAllPending || !activeHasUnread) {
      return;
    }

    if (segment === 'social') {
      markAllSocialRead.mutate();
      return;
    }

    markAllReleasesRead.mutate();
  }, [activeHasUnread, markAllPending, markAllReleasesRead, markAllSocialRead, segment]);

  const handleSegmentChange = useCallback((next: NotificationsInboxSegment) => {
    setSegment(next);
    listRef.current?.scrollToOffset({ offset: 0, animated: false });
  }, []);

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <DetailBackButton />
        <View style={styles.titleRow}>
          <AppText variant="title" style={styles.title}>
            {t('notifications.title')}
          </AppText>
          {isAuthenticated ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('notifications.markAllRead')}
              accessibilityState={{ disabled: !activeHasUnread || markAllPending }}
              disabled={!activeHasUnread || markAllPending}
              onPress={handleMarkAllRead}
              style={({ pressed }) => [styles.markAllButton, pressed && styles.pressed]}
            >
              <AppText
                variant="bodySmall"
                style={!activeHasUnread ? styles.markAllDisabled : styles.markAllEnabled}
              >
                {t('notifications.markAllRead')}
              </AppText>
            </Pressable>
          ) : null}
        </View>
      </View>

      {!isAuthenticated ? (
        <View style={styles.filteredEmpty}>
          <AppText variant="subtitle" center>
            {t('notifications.guestTitle')}
          </AppText>
          <AppText variant="bodySmall" muted center>
            {t('notifications.guestMessageUnified')}
          </AppText>
          <AppButton title={t('common.signInTitleCase')} variant="secondary" onPress={handleSignIn} />
        </View>
      ) : (
        <>
          <NotificationsInboxSegmentTabs
            active={segment}
            onChange={handleSegmentChange}
            socialUnread={unread.socialUnread}
            releasesUnread={unread.releasesUnread}
          />
          <View style={styles.listHost}>
            {segment === 'social' ? (
              <SocialNotificationsPane
                listRef={listRef}
                onScroll={onListScroll}
                scrollEventThrottle={scrollEventThrottle}
              />
            ) : (
              <ReleasesNotificationsPane
                listRef={listRef}
                onScroll={onListScroll}
                scrollEventThrottle={scrollEventThrottle}
              />
            )}
            <ScrollToTopFab visible={fabVisible} onPress={scrollToTop} />
          </View>
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingTop: spacing.md,
    paddingHorizontal: layout.screenPaddingHorizontal,
    gap: spacing.sm,
    paddingBottom: spacing.sm,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  // Editorial serif, same voice as the feed and comments screens.
  title: {
    fontFamily: authTypography.wordmarkSemibold,
    fontSize: 28,
    lineHeight: 34,
  },
  markAllButton: {
    minHeight: layout.touchTarget,
    justifyContent: 'center',
    paddingHorizontal: spacing.xs,
  },
  markAllEnabled: {
    color: premiumSheet.mutedGold,
  },
  markAllDisabled: {
    color: colors.textMuted,
  },
  pressed: {
    opacity: 0.85,
  },
  listHost: {
    flex: 1,
  },
  filteredEmpty: {
    paddingHorizontal: layout.screenPaddingHorizontal,
    paddingVertical: spacing.xl,
    gap: spacing.sm,
    alignItems: 'center',
  },
});
