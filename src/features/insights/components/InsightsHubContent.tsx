import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GestureDetector } from 'react-native-gesture-handler';
import Animated from 'react-native-reanimated';
import { createIosRefreshControl } from '@/components/refresh/createIosRefreshControl';
import { useAndroidPullToRefresh } from '@/components/refresh/useAndroidPullToRefresh';
import { useRouter } from 'expo-router';
import { isApiError } from '@/api/errors';
import { AppText } from '@/components/common/AppText';
import { ErrorView } from '@/components/common/ErrorView';
import { HomeHeaderProfileAvatar } from '@/features/home/components/HomeHeaderProfileAvatar';
import { AchievementsShowcase } from '@/features/achievements/components/AchievementsShowcase';
import { useInsightsV3 } from '../hooks/useInsightsV3';
import { useDnaCover } from '../hooks/useDnaCover';
import { useNewAchievements } from '../hooks/useNewAchievements';
import { InsightsDnaCoverSheet } from './InsightsDnaCoverSheet';
import {
  beginInsightsTrace,
  markInsightsPerfEvent,
  resetInsightsTrace,
} from '@/perf/insights-trace';
import { scrollScrollViewToTop } from '@/features/navigation/scroll-to-top';
import { usePrimaryTabReselectHandler } from '@/features/navigation/usePrimaryTabReselectHandler';
import { buildSelectableYears } from '../utils/insights-format';
import { InsightsAchievementCelebration } from './InsightsAchievementCelebration';
import { InsightsErasSection } from './InsightsErasSection';
import { InsightsLoadingSkeleton } from './InsightsLoadingSkeleton';
import { InsightsMovieDnaHero } from './InsightsMovieDnaHero';
import { InsightsRatingsSection } from './InsightsRatingsSection';
import { InsightsShareSheet } from './InsightsShareSheet';
import { InsightsTasteSection } from './InsightsTasteSection';
import { InsightsTimeInStoriesSection } from './InsightsTimeInStoriesSection';
import { InsightsYourYearSection } from './InsightsYourYearSection';
import { colors } from '@/theme/colors';
import { glass } from '@/theme/glass';
import { layout } from '@/theme/layout';
import { spacing } from '@/theme/spacing';
import { useTabBarOverlayInset } from '@/features/navigation/useTabBarOverlayInset';

const AnimatedScrollView = Animated.createAnimatedComponent(ScrollView);

export function InsightsHubContent() {
  const tabBarInset = useTabBarOverlayInset();
  const { t } = useTranslation();
  const router = useRouter();
  const [selectedYear, setSelectedYear] = useState<number | undefined>(undefined);
  const insightsQuery = useInsightsV3(selectedYear);
  const [shareOpen, setShareOpen] = useState(false);
  const [coverOpen, setCoverOpen] = useState(false);
  const dnaCover = useDnaCover(insightsQuery.data?.meta.memberSinceUtc);
  const newAchievements = useNewAchievements(
    insightsQuery.data?.achievements,
    insightsQuery.data?.meta.memberSinceUtc,
  );
  const hasMarkedApiStart = useRef(false);
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    beginInsightsTrace();
    return () => {
      resetInsightsTrace();
    };
  }, []);

  useEffect(() => {
    if (insightsQuery.isFetching && !hasMarkedApiStart.current) {
      hasMarkedApiStart.current = true;
      markInsightsPerfEvent('insights_v3_api_start');
    }

    if (insightsQuery.isSuccess && hasMarkedApiStart.current) {
      markInsightsPerfEvent('insights_v3_api_end');
      markInsightsPerfEvent('insights_v3_render');
    }
  }, [insightsQuery.isFetching, insightsQuery.isSuccess]);

  useEffect(() => {
    if (insightsQuery.data) {
      markInsightsPerfEvent('insights_first_meaningful_render');
    }
  }, [insightsQuery.data]);

  const selectableYears = useMemo(() => {
    if (!insightsQuery.data) {
      return [];
    }

    const currentYear = new Date().getFullYear();
    return buildSelectableYears(insightsQuery.data.meta.memberSinceUtc, currentYear);
  }, [insightsQuery.data]);

  const activeYear = insightsQuery.data?.meta.year ?? selectedYear ?? new Date().getFullYear();

  const handleRefresh = useCallback(() => {
    void insightsQuery.refetch();
  }, [insightsQuery]);

  const handleShare = useCallback(() => setShareOpen(true), []);

  const scrollInsightsToTop = useCallback(() => {
    scrollScrollViewToTop(scrollRef);
  }, []);

  usePrimaryTabReselectHandler('insights', {
    scrollToTop: scrollInsightsToTop,
    refresh: handleRefresh,
  });

  const isRefreshing = insightsQuery.isRefetching && !insightsQuery.isLoading;
  const refreshControl = createIosRefreshControl({
    refreshing: isRefreshing,
    onRefresh: handleRefresh,
  });

  const androidPullToRefresh = useAndroidPullToRefresh({
    refreshing: isRefreshing,
    onRefresh: handleRefresh,
  });

  if (insightsQuery.isError && !insightsQuery.data) {
    const message = isApiError(insightsQuery.error)
      ? insightsQuery.error.userMessage
      : t('insights.hub.loadError');

    return (
      <View style={styles.errorContainer}>
        <InsightsScreenHeader onOpenProfile={() => router.push('/(tabs)/profile')} />
        <ErrorView message={message} onRetry={() => void insightsQuery.refetch()} />
      </View>
    );
  }

  if (insightsQuery.isLoading && !insightsQuery.data) {
    return (
      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: spacing.xxl + tabBarInset }]}
      >
        <InsightsScreenHeader onOpenProfile={() => router.push('/(tabs)/profile')} />
        <InsightsLoadingSkeleton />
      </ScrollView>
    );
  }

  const insights = insightsQuery.data;
  if (!insights) {
    return null;
  }

  const insightsScrollView = (
    <AnimatedScrollView
      ref={scrollRef}
      contentContainerStyle={[styles.scrollContent, { paddingBottom: spacing.xxl + tabBarInset }]}
      refreshControl={refreshControl}
      onScroll={androidPullToRefresh.scrollHandler}
      scrollEventThrottle={16}
    >
      {androidPullToRefresh.RefreshHeader}
      <InsightsScreenHeader
        onOpenProfile={() => router.push('/(tabs)/profile')}
        onShare={handleShare}
      />
      <InsightsMovieDnaHero
        movieDna={insights.movieDna}
        backdropImagePath={dnaCover.coverPath ?? insights.yourEra.oldestTitle?.posterPath}
        onChangeCover={() => setCoverOpen(true)}
      />
      <InsightsYourYearSection
        yourYear={insights.yourYear}
        year={activeYear}
        years={selectableYears}
        onSelectYear={setSelectedYear}
      />
      <InsightsTasteSection taste={insights.yourTaste} />
      <InsightsTimeInStoriesSection
        timeInStories={insights.timeInStories}
        year={activeYear}
        backdropImagePath={insights.yourEra.oldestTitle?.posterPath}
      />
      <InsightsRatingsSection ratings={insights.yourRatings} />
      <InsightsErasSection era={insights.yourEra} />
      <AchievementsShowcase achievements={insights.achievements} />
      <InsightsAchievementCelebration
        achievements={newAchievements.fresh}
        onClose={newAchievements.dismiss}
      />
      <InsightsShareSheet
        visible={shareOpen}
        onClose={() => setShareOpen(false)}
        insights={insights}
        year={activeYear}
        coverPath={dnaCover.coverPath ?? insights.yourEra.oldestTitle?.posterPath ?? null}
      />
      <InsightsDnaCoverSheet
        visible={coverOpen}
        hasCustomCover={dnaCover.coverPath != null}
        onClose={() => setCoverOpen(false)}
        onPick={dnaCover.setCover}
        onReset={() => dnaCover.setCover(null)}
      />
    </AnimatedScrollView>
  );

  return androidPullToRefresh.enabled ? (
    <GestureDetector gesture={androidPullToRefresh.composedGesture}>
      {insightsScrollView}
    </GestureDetector>
  ) : (
    insightsScrollView
  );
}

function InsightsScreenHeader({
  onOpenProfile,
  onShare,
}: {
  onOpenProfile: () => void;
  onShare?: () => void;
}) {
  const { t } = useTranslation();

  return (
    <View style={styles.header}>
      <View style={styles.headerCopy}>
        <AppText variant="title">{t('insights.hub.title')}</AppText>
        <AppText variant="bodySmall" muted>
          {t('insights.hub.subtitle')}
        </AppText>
      </View>
      {onShare ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('insights.hub.share')}
          onPress={onShare}
          hitSlop={8}
          style={({ pressed }) => [styles.shareGlass, pressed && styles.sharePressed]}
          testID="insights-share"
        >
          <Ionicons name="share-outline" size={18} color={colors.accentStrong} />
        </Pressable>
      ) : null}
      <HomeHeaderProfileAvatar compact onPress={onOpenProfile} />
    </View>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    gap: spacing.lg,
    paddingHorizontal: layout.screenPaddingHorizontal,
    paddingBottom: spacing.xxl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    paddingTop: spacing.xs,
  },
  shareGlass: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: glass.accentFill,
    borderWidth: 1,
    borderColor: glass.accentBorder,
  },
  sharePressed: {
    opacity: 0.8,
  },
  headerCopy: {
    flex: 1,
    gap: 2,
  },
  errorContainer: {
    flex: 1,
    paddingHorizontal: layout.screenPaddingHorizontal,
    gap: spacing.lg,
    paddingTop: spacing.md,
  },
});
