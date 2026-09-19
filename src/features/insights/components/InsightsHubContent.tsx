import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, View } from 'react-native';
import { GestureDetector } from 'react-native-gesture-handler';
import Animated from 'react-native-reanimated';
import { createIosRefreshControl } from '@/components/refresh/createIosRefreshControl';
import { useAndroidPullToRefresh } from '@/components/refresh/useAndroidPullToRefresh';
import { useRouter } from 'expo-router';
import { isApiError } from '@/api/errors';
import { AppText } from '@/components/common/AppText';
import { ErrorView } from '@/components/common/ErrorView';
import { HomeHeaderProfileAvatar } from '@/features/home/components/HomeHeaderProfileAvatar';
import { useInsightsV3 } from '../hooks/useInsightsV3';
import { beginInsightsTrace, markInsightsPerfEvent, resetInsightsTrace } from '@/perf/insights-trace';
import { buildSelectableYears } from '../utils/insights-format';
import { InsightsErasSection } from './InsightsErasSection';
import { InsightsLoadingSkeleton } from './InsightsLoadingSkeleton';
import { InsightsMilestonesSection } from './InsightsMilestonesSection';
import { InsightsMovieDnaHero } from './InsightsMovieDnaHero';
import { InsightsRatingsSection } from './InsightsRatingsSection';
import { InsightsRecordsSection } from './InsightsRecordsSection';
import { InsightsTasteSection } from './InsightsTasteSection';
import { InsightsTimeInStoriesSection } from './InsightsTimeInStoriesSection';
import { InsightsYourYearSection } from './InsightsYourYearSection';
import { colors } from '@/theme/colors';
import { layout } from '@/theme/layout';
import { spacing } from '@/theme/spacing';

const AnimatedScrollView = Animated.createAnimatedComponent(ScrollView);

export function InsightsHubContent() {
  const { t } = useTranslation();
  const router = useRouter();
  const [selectedYear, setSelectedYear] = useState<number | undefined>(undefined);
  const insightsQuery = useInsightsV3(selectedYear);
  const hasMarkedApiStart = useRef(false);

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
      <ScrollView contentContainerStyle={styles.scrollContent}>
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
      contentContainerStyle={styles.scrollContent}
      refreshControl={refreshControl}
      onScroll={androidPullToRefresh.scrollHandler}
      scrollEventThrottle={16}
    >
      {androidPullToRefresh.RefreshHeader}
      <InsightsScreenHeader onOpenProfile={() => router.push('/(tabs)/profile')} />
      <InsightsMovieDnaHero
        movieDna={insights.movieDna}
        backdropImagePath={insights.yourEra.oldestTitle?.posterPath}
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
      <InsightsRecordsSection
        records={insights.yourRecords}
        favoriteWeekday={insights.yourYear.favoriteWeekday}
      />
      <InsightsMilestonesSection achievements={insights.achievements} />
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

function InsightsScreenHeader({ onOpenProfile }: { onOpenProfile: () => void }) {
  const { t } = useTranslation();

  return (
    <View style={styles.header}>
      <View style={styles.headerCopy}>
        <AppText variant="title">{t('insights.hub.title')}</AppText>
        <AppText variant="bodySmall" muted>
          {t('insights.hub.subtitle')}
        </AppText>
      </View>
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
