import { render, screen } from '@testing-library/react-native';
import { InsightsEstimatedTimeSection } from '@/features/insights/components/InsightsEstimatedTimeSection';
import { InsightsMovieDnaHero } from '@/features/insights/components/InsightsMovieDnaHero';
import { InsightsRatingsSection } from '@/features/insights/components/InsightsRatingsSection';
import { InsightsWatchingMixSection } from '@/features/insights/components/InsightsWatchingMixSection';
import { InsightsYourYearSection } from '@/features/insights/components/InsightsYourYearSection';
import {
  emptyInsightsSummaryFixture,
  insightsAnalyticsFixture,
  insightsSummaryFixture,
} from '@/features/insights/utils/insights-fixtures';

describe('insights sections', () => {
  it('renders up to three Movie DNA labels', () => {
    render(
      <InsightsMovieDnaHero
        labels={insightsSummaryFixture.movieDna}
        summary={insightsSummaryFixture.summary}
      />,
    );

    expect(screen.getByText('Sci-Fi explorer')).toBeTruthy();
    expect(screen.getByText('Series-first viewer')).toBeTruthy();
    expect(screen.getByText('New release curious')).toBeTruthy();
    expect(screen.queryByText('Fourth label')).toBeNull();
  });

  it('shows empty Movie DNA discovery state', () => {
    render(
      <InsightsMovieDnaHero
        labels={emptyInsightsSummaryFixture.movieDna}
        summary={emptyInsightsSummaryFixture.summary}
      />,
    );

    expect(screen.getByLabelText('Still discovering your taste')).toBeTruthy();
  });

  it('distinguishes beforeJoin heatmap cells from no activity', () => {
    render(<InsightsYourYearSection activity={insightsAnalyticsFixture.activity} />);

    expect(screen.getAllByLabelText(/before you joined MovieApp/).length).toBeGreaterThan(0);
    expect(screen.getAllByLabelText(/no activity/).length).toBeGreaterThan(0);
    expect(screen.getAllByLabelText(/watched items/).length).toBeGreaterThan(0);
  });

  it('shows unavailable estimated time when no runtime is known', () => {
    render(
      <InsightsEstimatedTimeSection
        estimatedTime={{
          ...insightsAnalyticsFixture.estimatedTimeWatched,
          knownRuntimeItemCount: 0,
          totalEstimatedMinutes: 0,
        }}
      />,
    );

    expect(screen.getByText(/Runtime data is not available/)).toBeTruthy();
    expect(screen.queryByText('0m')).toBeNull();
  });

  it('shows ratings empty state and most-used only at five or more ratings', () => {
    render(
      <InsightsRatingsSection
        ratings={{
          ratingCount: 3,
          averageStarRating: 4,
          distribution: [{ stars: 4, count: 3 }],
          mostUsedStars: 4,
        }}
      />,
    );

    expect(screen.queryByText('Most used')).toBeNull();

    render(
      <InsightsRatingsSection ratings={insightsAnalyticsFixture.ratings} />,
    );

    expect(screen.getByText('Most used')).toBeTruthy();
  });

  it('uses title counts for movies vs series', () => {
    render(
      <InsightsWatchingMixSection watchingMix={insightsSummaryFixture.watchingMix} />,
    );

    expect(screen.getByLabelText('Movies 28, series 9')).toBeTruthy();
  });
});
