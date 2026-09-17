import { fireEvent, render, screen } from '@testing-library/react-native';
import { ApiError } from '@/api/errors';
import { InsightsHubContent } from '@/features/insights/components/InsightsHubContent';
import { useInsightsAnalytics } from '@/features/insights/hooks/useInsightsAnalytics';
import { useInsightsSummary } from '@/features/insights/hooks/useInsightsSummary';
import {
  insightsAnalyticsFixture,
  insightsSummaryFixture,
} from '@/features/insights/utils/insights-fixtures';

const mockPush = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockPush }),
}));

jest.mock('@/features/insights/hooks/useInsightsSummary', () => ({
  useInsightsSummary: jest.fn(),
}));

jest.mock('@/features/insights/hooks/useInsightsAnalytics', () => ({
  useInsightsAnalytics: jest.fn(),
}));

jest.mock('@/features/home/components/HomeHeaderProfileAvatar', () => ({
  HomeHeaderProfileAvatar: ({ onPress }: { onPress?: () => void }) => {
    const { Pressable, Text } = require('react-native');
    return (
      <Pressable accessibilityRole="button" accessibilityLabel="Open profile" onPress={onPress}>
        <Text>Avatar</Text>
      </Pressable>
    );
  },
}));

function createSummaryQuery(overrides: Record<string, unknown> = {}) {
  return {
    data: undefined,
    isLoading: false,
    isFetching: false,
    isRefetching: false,
    isError: false,
    isSuccess: false,
    refetch: jest.fn(),
    ...overrides,
  };
}

function createAnalyticsQuery(overrides: Record<string, unknown> = {}) {
  return {
    data: undefined,
    isLoading: false,
    isFetching: false,
    isRefetching: false,
    isError: false,
    isSuccess: false,
    refetch: jest.fn(),
    ...overrides,
  };
}

describe('InsightsHubContent', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useInsightsSummary as jest.Mock).mockReturnValue(createSummaryQuery());
    (useInsightsAnalytics as jest.Mock).mockReturnValue(createAnalyticsQuery());
  });

  it('renders Movie DNA before analytics resolves', () => {
    (useInsightsSummary as jest.Mock).mockReturnValue(
      createSummaryQuery({ data: insightsSummaryFixture, isSuccess: true }),
    );
    (useInsightsAnalytics as jest.Mock).mockReturnValue(
      createAnalyticsQuery({ isLoading: true }),
    );

    render(<InsightsHubContent />);

    expect(screen.getByText('Movie DNA')).toBeTruthy();
    expect(screen.getAllByLabelText('Loading insights section').length).toBeGreaterThan(0);
    expect(screen.queryByText('Your Taste')).toBeNull();
  });

  it('shows full error when summary fails without cache', () => {
    (useInsightsSummary as jest.Mock).mockReturnValue(
      createSummaryQuery({
        isError: true,
        error: new ApiError({ kind: 'server', userMessage: 'Summary failed' }),
      }),
    );

    render(<InsightsHubContent />);

    expect(screen.getByText('Summary failed')).toBeTruthy();
  });

  it('keeps summary visible when analytics fails and supports retry', () => {
    const refetchAnalytics = jest.fn();
    (useInsightsSummary as jest.Mock).mockReturnValue(
      createSummaryQuery({ data: insightsSummaryFixture, isSuccess: true }),
    );
    (useInsightsAnalytics as jest.Mock).mockReturnValue(
      createAnalyticsQuery({
        isError: true,
        error: new ApiError({ kind: 'server', userMessage: 'Analytics failed' }),
        refetch: refetchAnalytics,
      }),
    );

    render(<InsightsHubContent />);

    expect(screen.getByText('Sci-Fi explorer')).toBeTruthy();
    expect(screen.getByText('Analytics failed')).toBeTruthy();
    fireEvent.press(screen.getByLabelText('Retry loading analytics'));
    expect(refetchAnalytics).toHaveBeenCalled();
  });

  it('refetches summary and analytics on pull to refresh', () => {
    const refetchSummary = jest.fn();
    const refetchAnalytics = jest.fn();
    (useInsightsSummary as jest.Mock).mockReturnValue(
      createSummaryQuery({
        data: insightsSummaryFixture,
        isSuccess: true,
        refetch: refetchSummary,
      }),
    );
    (useInsightsAnalytics as jest.Mock).mockReturnValue(
      createAnalyticsQuery({
        data: insightsAnalyticsFixture,
        isSuccess: true,
        refetch: refetchAnalytics,
      }),
    );

    const { UNSAFE_getByType } = render(<InsightsHubContent />);
    const { ScrollView } = require('react-native');
    const scrollView = UNSAFE_getByType(ScrollView);
    scrollView.props.refreshControl.props.onRefresh();

    expect(refetchSummary).toHaveBeenCalled();
    expect(refetchAnalytics).toHaveBeenCalled();
  });

  it('opens profile from header avatar', () => {
    (useInsightsSummary as jest.Mock).mockReturnValue(
      createSummaryQuery({ data: insightsSummaryFixture, isSuccess: true }),
    );
    (useInsightsAnalytics as jest.Mock).mockReturnValue(
      createAnalyticsQuery({ data: insightsAnalyticsFixture, isSuccess: true }),
    );

    render(<InsightsHubContent />);
    fireEvent.press(screen.getByLabelText('Open profile'));
    expect(mockPush).toHaveBeenCalledWith('/(tabs)/profile');
  });
});
