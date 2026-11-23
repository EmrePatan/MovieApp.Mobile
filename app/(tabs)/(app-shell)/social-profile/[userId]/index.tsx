import { useCallback, useEffect, useMemo, useState } from 'react';
import { normalizeRouteParam } from '@/features/navigation/normalize-route-param';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppText } from '@/components/common/AppText';
import { useAuthFonts } from '@/features/auth/useAuthFonts';
import {
  useSocialProfile,
  useSocialProfileStatistics,
} from '@/features/social/hooks/useSocialQueries';
import {
  useFollowSocialUser,
  useReportSocialContent,
  useSocialBlockMutations,
  useUnfollowSocialUser,
} from '@/features/social/hooks/useSocialMutations';
import { useCreateDirectConversation } from '@/features/messages/hooks/useMessageMutations';
import { SocialProfileCoverPickerSheet } from '@/features/social/components/SocialProfileCoverPickerSheet';
import { SocialProfileHeader } from '@/features/social/components/SocialProfileHeader';
import { SocialTasteMatchCard } from '@/features/social/components/SocialTasteMatchCard';
import { useSocialProfileCoverEditor } from '@/features/social/hooks/useSocialProfileCoverEditor';
import { SocialProfileActionRow } from '@/features/social/components/SocialProfileActionRow';
import { SocialProfileLibrary } from '@/features/social/components/SocialProfileLibrary';
import { SocialConfirmActionSheet } from '@/features/social/components/SocialConfirmActionSheet';
import { SocialReportReasonSheet } from '@/features/social/components/SocialReportReasonSheet';
import { useSocialReportReasonSheet } from '@/features/social/hooks/useSocialReportReasonSheet';
import type { SocialProfileShelfItem } from '@/features/social/types';
import { resolveProfileLibraryTitles } from '@/features/social/utils/resolve-profile-library-titles';
import { openCatalogDetailFromTab } from '@/features/details/shared/navigation/open-catalog-detail-from-tab';
import { colors } from '@/theme/colors';
import { layout } from '@/theme/layout';
import { spacing } from '@/theme/spacing';

export default function SocialProfileScreen() {
  useAuthFonts();
  const router = useRouter();
  const { t } = useTranslation();
  const params = useLocalSearchParams<{ userId: string | string[] }>();
  const userId = useMemo(() => normalizeRouteParam(params.userId), [params.userId]);

  const profile = useSocialProfile(userId);
  const canViewLibrary =
    !!profile.data &&
    (!profile.data.isPrivate ||
      profile.data.followStatus === 'Accepted' ||
      profile.data.followStatus === 'Self');
  const statistics = useSocialProfileStatistics(userId, canViewLibrary);
  const follow = useFollowSocialUser(userId);
  const startConversation = useCreateDirectConversation();
  const unfollow = useUnfollowSocialUser(userId);
  const block = useSocialBlockMutations(userId);
  const report = useReportSocialContent();
  const { openUserReport, reportSheetProps } = useSocialReportReasonSheet(report);
  const [blockSheetVisible, setBlockSheetVisible] = useState(false);
  const [coverPickerVisible, setCoverPickerVisible] = useState(false);
  const coverEditor = useSocialProfileCoverEditor(userId);
  const shelfPosters = useMemo(() => {
    const items = resolveProfileLibraryTitles(statistics.data);
    return items
      .map((item) => item.posterPath)
      .filter((path): path is string => Boolean(path?.trim()));
  }, [statistics.data]);
  const fallbackCoverPoster = shelfPosters[0] ?? null;

  const handleFollow = useCallback(() => {
    if (profile.data?.followStatus === 'Accepted' || profile.data?.followStatus === 'Pending') {
      unfollow.mutate();
    } else {
      follow.mutate();
    }
  }, [follow, profile.data?.followStatus, unfollow]);

  const handleOpenTitle = useCallback(
    (item: SocialProfileShelfItem) => {
      openCatalogDetailFromTab(
        router,
        item.id,
        item.contentType === 'Movie' ? 'movie' : 'tv',
        'home',
      );
    },
    [router],
  );

  const handleOpenWatchlist = useCallback(
    (watchlistId: string) => {
      if (!userId) return;
      router.push(`/(tabs)/(app-shell)/social-profile/${userId}/watchlist/${watchlistId}`);
    },
    [router, userId],
  );

  const handleBlock = useCallback(() => setBlockSheetVisible(true), []);

  const confirmBlock = useCallback(() => {
    block.block.mutate(undefined, {
      onSuccess: () => {
        setBlockSheetVisible(false);
        router.back();
      },
    });
  }, [block.block, router]);

  const handleRefresh = useCallback(() => {
    void profile.refetch();
    if (canViewLibrary) void statistics.refetch();
  }, [canViewLibrary, profile, statistics]);

  const openReviews = useCallback(() => {
    if (!userId) return;
    router.push(`/profile/user-comments/${userId}`);
  }, [router, userId]);

  const followStatus = profile.data?.followStatus;
  useEffect(() => {
    // The signed-in user's own profile lives on the bottom Profile tab; never render it here.
    if (followStatus === 'Self') {
      router.replace('/library');
    }
  }, [followStatus, router]);

  if (!userId) {
    return (
      <SafeAreaView style={styles.screen}>
        <View style={styles.center}>
          <AppText variant="bodySmall" muted>
            {t('social.profileNotFound')}
          </AppText>
          <Pressable onPress={() => router.back()}>
            <AppText variant="caption" style={styles.retry}>
              {t('social.back')}
            </AppText>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  if (profile.isLoading) {
    return (
      <SafeAreaView style={styles.screen}>
        <View style={styles.center}>
          <ActivityIndicator color={colors.accent} />
        </View>
      </SafeAreaView>
    );
  }

  if (profile.isError || !profile.data) {
    return (
      <SafeAreaView style={styles.screen}>
        <View style={styles.center}>
          <AppText variant="bodySmall" muted>
            {profile.isError ? t('social.profileLoadError') : t('social.profileNotFound')}
          </AppText>
          {profile.isError ? (
            <Pressable onPress={() => void profile.refetch()}>
              <AppText variant="caption" style={styles.retry}>
                {t('common.retry')}
              </AppText>
            </Pressable>
          ) : null}
        </View>
      </SafeAreaView>
    );
  }

  const item = profile.data;
  const isSelf = item.followStatus === 'Self';
  const showPrivateNotice =
    item.isPrivate && item.followStatus !== 'Accepted' && item.followStatus !== 'Self';

  return (
    <SafeAreaView style={styles.screen} edges={['left', 'right']}>
      <ScrollView
        style={styles.list}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={profile.isRefetching || statistics.isRefetching}
            onRefresh={handleRefresh}
            tintColor={colors.accent}
          />
        }
      >
        <SocialProfileHeader
          profile={item}
          statistics={canViewLibrary ? statistics.data : undefined}
          fallbackPosterPath={fallbackCoverPoster}
          canEditCover={isSelf}
          coverBusy={coverEditor.isBusy}
          onEditCover={() => setCoverPickerVisible(true)}
          onBack={() => router.back()}
          identityTrailing={
            !isSelf && canViewLibrary ? <SocialTasteMatchCard userId={userId} enabled /> : undefined
          }
          actions={
            <SocialProfileActionRow
              followStatus={item.followStatus}
              isFollowLoading={follow.isPending || unfollow.isPending}
              onFollowPress={handleFollow}
              onMessagePress={
                !isSelf && userId ? () => startConversation.mutate(userId) : undefined
              }
              isMessageLoading={startConversation.isPending}
              onBlockPress={!isSelf ? handleBlock : undefined}
              onReportPress={!isSelf ? () => openUserReport(userId) : undefined}
            />
          }
          onFollowersPress={() =>
            router.push(`/(tabs)/(app-shell)/social-people/${item.id}?type=followers`)
          }
          onFollowingPress={() =>
            router.push(`/(tabs)/(app-shell)/social-people/${item.id}?type=following`)
          }
          onReviewsPress={
            isSelf
              ? () => router.push('/profile/my-comments')
              : canViewLibrary
                ? openReviews
                : undefined
          }
        />

        {showPrivateNotice ? (
          <AppText variant="bodySmall" muted style={styles.privateNotice}>
            {t('social.privateProfileNotice')}
          </AppText>
        ) : null}

        {canViewLibrary && statistics.isLoading ? (
          <ActivityIndicator color={colors.accent} style={styles.headerLoader} />
        ) : null}
        {canViewLibrary && statistics.isError ? (
          <View style={styles.inlineError}>
            <AppText variant="caption" muted>
              {t('social.statsLoadError')}
            </AppText>
            <Pressable onPress={() => void statistics.refetch()}>
              <AppText variant="caption" style={styles.retry}>
                {t('common.retry')}
              </AppText>
            </Pressable>
          </View>
        ) : null}
        {canViewLibrary && statistics.data ? (
          <SocialProfileLibrary
            userId={userId}
            statistics={statistics.data}
            onOpenTitle={handleOpenTitle}
            onOpenWatchlist={handleOpenWatchlist}
            quickActionsEnabled={!isSelf}
          />
        ) : null}
      </ScrollView>

      <SocialReportReasonSheet {...reportSheetProps} />
      <SocialConfirmActionSheet
        visible={blockSheetVisible}
        title={t('social.blockUserTitle')}
        message={t('social.blockUserMessage')}
        confirmLabel={t('social.blockUser')}
        destructive
        confirmLoading={block.block.isPending}
        onClose={() => setBlockSheetVisible(false)}
        onConfirm={confirmBlock}
      />
      <SocialProfileCoverPickerSheet
        visible={coverPickerVisible}
        posterPaths={shelfPosters}
        isBusy={coverEditor.isBusy}
        onClose={() => setCoverPickerVisible(false)}
        onPickPhoto={() => {
          setCoverPickerVisible(false);
          void coverEditor.pickAndUploadPhoto();
        }}
        onPickPoster={(path) => {
          coverEditor.setPoster(path);
          setCoverPickerVisible(false);
        }}
        onRemoveCover={() => {
          coverEditor.removeCover();
          setCoverPickerVisible(false);
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  list: { flex: 1 },
  listContent: { paddingBottom: spacing.xxl },
  privateNotice: {
    textAlign: 'center',
    paddingHorizontal: layout.screenPaddingHorizontal,
    paddingBottom: spacing.md,
  },
  headerLoader: {
    paddingBottom: spacing.lg,
  },
  inlineError: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    paddingHorizontal: layout.screenPaddingHorizontal,
    paddingVertical: spacing.sm,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
    gap: spacing.sm,
  },
  retry: { color: colors.accent },
});
