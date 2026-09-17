import { useCallback, useEffect, useRef } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { MovieAppRefreshControl } from '@/components/refresh/MovieAppRefreshControl';
import { useRouter } from 'expo-router';
import { isApiError } from '@/api/errors';
import { AppText } from '@/components/common/AppText';
import { ErrorView } from '@/components/common/ErrorView';
import { HomeHeaderProfileAvatar } from '@/features/home/components/HomeHeaderProfileAvatar';
import { useInsightsAnalytics } from '../hooks/useInsightsAnalytics';
import { useInsightsSummary } from '../hooks/useInsightsSummary';
import { beginInsightsTrace, markInsightsPerfEvent, resetInsightsTrace } from '@/perf/insights-trace';
import { InsightsAnalyticsError } from './InsightsAnalyticsError';
import { InsightsEstimatedTimeSection } from './InsightsEstimatedTimeSection';
import { InsightsErasSection } from './InsightsErasSection';
import { InsightsLoadingSkeleton } from './InsightsLoadingSkeleton';
import { InsightsMilestonesSection } from './InsightsMilestonesSection';
import { InsightsMovieDnaHero } from './InsightsMovieDnaHero';
import { InsightsRatingsSection } from './InsightsRatingsSection';
import { InsightsSectionSkeleton } from './InsightsSectionSkeleton';
import { InsightsTasteSection } from './InsightsTasteSection';
import { InsightsWatchingMixSection } from './InsightsWatchingMixSection';
import { InsightsYourYearSection } from './InsightsYourYearSection';
import { colors } from '@/theme/colors';
import { layout } from '@/theme/layout';
import { spacing } from '@/theme/spacing';

export function InsightsHubContent() {
  const router = useRouter();
  const summaryQuery = useInsightsSummary();
  const analyticsQuery = useInsightsAnalytics();
  const hasMarkedSummaryStart = useRef(false);
  const hasMarkedAnalyticsStart = useRef(false);

  useEffect(() => {
    beginInsightsTrace();
    return () => {
      resetInsightsTrace();
    };
  }, []);

  useEffect(() => {
    if (summaryQuery.isFetching && !hasMarkedSummaryStart.current) {
      hasMarkedSummaryStart.current = true;
      markInsightsPerfEvent('insights_summary_api_start');
    }

    if (summaryQuery.isSuccess && hasMarkedSummaryStart.current) {
      markInsightsPerfEvent('insights_summary_api_end');
    }
  }, [summaryQuery.isFetching, summaryQuery.isSuccess]);

  useEffect(() => {
    if (analyticsQuery.isFetching && !hasMarkedAnalyticsStart.current) {
      hasMarkedAnalyticsStart.current = true;
      markInsightsPerfEvent('insights_analytics_api_start');
    }

    if (analyticsQuery.isSuccess && hasMarkedAnalyticsStart.current) {
      markInsightsPerfEvent('insights_analytics_api_end');
      markInsightsPerfEvent('insights_analytics_render');
    }
  }, [analyticsQuery.isFetching, analyticsQuery.isSuccess]);

  useEffect(() => {
    if (summaryQuery.data) {
      markInsightsPerfEvent('insights_first_meaningful_render');
    }
  }, [summaryQuery.data]);

  const handleRefresh = useCallback(() => {
    void summaryQuery.refetch();
    void analyticsQuery.refetch();
  }, [analyticsQuery, summaryQuery]);

  const isRefreshing =
    (summaryQuery.isRefetching && !summaryQuery.isLoading) ||
    (analyticsQuery.isRefetching && !analyticsQuery.isLoading);

  const showFullSkeleton =
    summaryQuery.isLoading && !summaryQuery.data && analyticsQuery.isLoading && !analyticsQuery.data;

  if (summaryQuery.isError && !summaryQuery.data) {
    const message = isApiError(summaryQuery.error)
      ? summaryQuery.error.userMessage
      : 'Unable to load your insights. Please try again.';

    return (
      <View style={styles.errorContainer}>
        <InsightsScreenHeader onOpenProfile={() => router.push('/(tabs)/profile')} />
        <ErrorView message={message} onRetry={() => void summaryQuery.refetch()} retryLabel="Try Again" />
      </View>
    );
  }

  if (showFullSkeleton) {
    return (
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <InsightsScreenHeader onOpenProfile={() => router.push('/(tabs)/profile')} />
        <InsightsLoadingSkeleton />
      </ScrollView>
    );
  }

  const summary = summaryQuery.data;
  const analytics = analyticsQuery.data;
  const analyticsFailed = analyticsQuery.isError && !analytics;

  const analyticsContent = analytics ? (
    <>
      <InsightsYourYearSection activity={analytics.activity} />
      <InsightsTasteSection taste={analytics.taste} />
      <InsightsErasSection eras={analytics.eras} />
      <InsightsEstimatedTimeSection estimatedTime={analytics.estimatedTimeWatched} />
      <InsightsRatingsSection ratings={analytics.ratings} />
    </>
  ) : analyticsFailed ? (
    <InsightsAnalyticsError
      message={
        isApiError(analyticsQuery.error)
          ? analyticsQuery.error.userMessage
          : 'Unable to load detailed analytics right now.'
      }
      onRetry={() => void analyticsQuery.refetch()}
    />
  ) : (
    <>
      <InsightsSectionSkeleton height={180} />
      <InsightsSectionSkeleton height={160} />
      <InsightsSectionSkeleton height={150} />
      <InsightsSectionSkeleton height={130} />
      <InsightsSectionSkeleton height={170} />
    </>
  );

  const milestonesContent = analytics ? (
    <InsightsMilestonesSection milestones={analytics.milestones} />
  ) : analyticsFailed ? null : (
    <InsightsSectionSkeleton height={140} />
  );

  return (
    <ScrollView
      contentContainerStyle={styles.scrollContent}
      refreshControl={
        <MovieAppRefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
      }
    >
      <InsightsScreenHeader onOpenProfile={() => router.push('/(tabs)/profile')} />

      {summary ? (
        <>
          <InsightsMovieDnaHero labels={summary.movieDna} summary={summary.summary} />
          {analyticsContent}
          <InsightsWatchingMixSection watchingMix={summary.watchingMix} />
          {milestonesContent}
        </>
      ) : (
        <InsightsLoadingSkeleton />
      )}
    </ScrollView>
  );
}

function InsightsScreenHeader({ onOpenProfile }: { onOpenProfile: () => void }) {
  return (
    <View style={styles.header}>
      <View style={styles.headerCopy}>
        <AppText variant="title">Insights</AppText>
        <AppText variant="bodySmall" muted>
          What your watching history reveals
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
