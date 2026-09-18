import { fireEvent, render, screen } from '@testing-library/react-native';
import { ApiError } from '@/api/errors';
import { InsightsHubContent } from '@/features/insights/components/InsightsHubContent';
import { useInsightsV3 } from '@/features/insights/hooks/useInsightsV3';
import { insightsV3Fixture } from '@/features/insights/utils/insights-fixtures';

const mockPush = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockPush }),
}));

jest.mock('@/features/insights/hooks/useInsightsV3', () => ({
  useInsightsV3: jest.fn(),
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

function createInsightsQuery(overrides: Record<string, unknown> = {}) {
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
    (useInsightsV3 as jest.Mock).mockReturnValue(createInsightsQuery());
  });

  it('shows loading skeleton while insights load', () => {
    (useInsightsV3 as jest.Mock).mockReturnValue(
      createInsightsQuery({ isLoading: true }),
    );

    render(<InsightsHubContent />);

    expect(screen.getAllByLabelText('Loading insights section').length).toBeGreaterThan(0);
    expect(screen.queryByText('The Sci-Fi Series Devotee')).toBeNull();
  });

  it('shows full error when insights fail without cache', () => {
    (useInsightsV3 as jest.Mock).mockReturnValue(
      createInsightsQuery({
        isError: true,
        error: new ApiError({ kind: 'server', userMessage: 'Insights failed' }),
      }),
    );

    render(<InsightsHubContent />);

    expect(screen.getByText('Insights failed')).toBeTruthy();
  });

  it('renders all insight sections when data is available', () => {
    (useInsightsV3 as jest.Mock).mockReturnValue(
      createInsightsQuery({ data: insightsV3Fixture, isSuccess: true }),
    );

    render(<InsightsHubContent />);

    expect(screen.getByText('The Sci-Fi Series Devotee')).toBeTruthy();
    expect(screen.getByText('Your Year')).toBeTruthy();
    expect(screen.getByText('Your Taste')).toBeTruthy();
    expect(screen.getByText('Time in Stories')).toBeTruthy();
    expect(screen.getByText('Your Ratings')).toBeTruthy();
    expect(screen.getByText('Your Era')).toBeTruthy();
    expect(screen.getByText('Your Records')).toBeTruthy();
    expect(screen.getByText('Achievements')).toBeTruthy();
  });

  it('refetches insights on pull to refresh', () => {
    const refetch = jest.fn();
    (useInsightsV3 as jest.Mock).mockReturnValue(
      createInsightsQuery({
        data: insightsV3Fixture,
        isSuccess: true,
        refetch,
      }),
    );

    const { UNSAFE_getByType } = render(<InsightsHubContent />);
    const { ScrollView } = require('react-native');
    const scrollView = UNSAFE_getByType(ScrollView);
    scrollView.props.refreshControl.props.onRefresh();

    expect(refetch).toHaveBeenCalled();
  });

  it('opens profile from header avatar', () => {
    (useInsightsV3 as jest.Mock).mockReturnValue(
      createInsightsQuery({ data: insightsV3Fixture, isSuccess: true }),
    );

    render(<InsightsHubContent />);
    fireEvent.press(screen.getByLabelText('Open profile'));
    expect(mockPush).toHaveBeenCalledWith('/(tabs)/profile');
  });
});
