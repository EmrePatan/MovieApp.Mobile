import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ApiError } from '@/api/errors';
import { AiRecommendationsContent } from '@/features/ai-recommendations/components/AiRecommendationsContent';
import { postAiRecommendations } from '@/features/ai-recommendations/api/ai-recommendations-api';
import { useAiRecommendationQuota } from '@/features/ai-recommendations/hooks/useAiRecommendationQuota';
import { trackProductMetric } from '@/features/metrics/track-product-metric';

const mockPush = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockPush, back: jest.fn(), canGoBack: jest.fn(() => true) }),
  useSegments: () => ['ai-recommendations'],
}));

jest.mock('@/features/ai-recommendations/api/ai-recommendations-api', () => ({
  postAiRecommendations: jest.fn(),
  getAiRecommendationQuota: jest.fn(),
}));

const mockQuotaData = { remaining: 3, limit: 3 };

jest.mock('@/features/ai-recommendations/hooks/useAiRecommendationQuota', () => ({
  useAiRecommendationQuota: jest.fn(() => ({
    data: mockQuotaData,
    isLoading: false,
    isError: false,
  })),
}));

jest.mock('@/features/metrics/track-product-metric', () => ({
  trackProductMetric: jest.fn(),
}));

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

async function waitForQuotaHydration() {
  await waitFor(() => {
    expect(screen.getByTestId('ai-recommendations-quota-remaining')).not.toHaveTextContent(
      'Checking today’s request limit…',
    );
  });
}

function renderScreen() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <AiRecommendationsContent />
    </QueryClientProvider>,
  );
}

const successResponse = {
  sessionId: 'session-1',
  isAiGenerated: true,
  partialResults: false,
  requestedCount: 10,
  returnedCount: 1,
  quotaRemaining: 2,
  recommendations: [
    {
      id: 'movie-1',
      type: 'movie' as const,
      title: 'Arrival',
      originalTitle: null,
      overview: 'A linguist works with the military.',
      posterUrl: '/poster.jpg',
      backdropUrl: null,
      releaseDate: '2016-01-01',
      voteAverage: 7.8,
      voteCount: 1000,
      year: 2016,
      runtimeMinutes: 116,
      reason: 'Mind-bending sci-fi with emotional stakes',
    },
  ],
  validationSummary: {
    geminiSuggestionCount: 1,
    validatedCount: 1,
    rejectedCount: 0,
  },
};

const validationHeavyResponse = {
  ...successResponse,
  partialResults: true,
  validationSummary: {
    geminiSuggestionCount: 3,
    validatedCount: 1,
    rejectedCount: 2,
  },
};

describe('AiRecommendationsContent', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useAiRecommendationQuota as jest.Mock).mockReturnValue({
      data: mockQuotaData,
      isLoading: false,
      isError: false,
    });
  });

  it('renders the prompt composer and suggested prompts', async () => {
    renderScreen();

    expect(screen.getByText('AI Recommendations')).toBeTruthy();
    await waitFor(() => {
      expect(screen.getByTestId('ai-recommendations-quota-remaining')).toHaveTextContent(
        '3 of 3 requests left today',
      );
    });
    expect(screen.getByLabelText('AI recommendation prompt')).toBeTruthy();
    expect(screen.getByText('Get Recommendations')).toBeTruthy();
    expect(screen.getByLabelText('Use prompt: A cozy mystery for a rainy night')).toBeTruthy();
  });

  it('shows validation feedback for short prompts', async () => {
    renderScreen();
    await waitForQuotaHydration();

    fireEvent.changeText(screen.getByLabelText('AI recommendation prompt'), 'hi');
    fireEvent.press(screen.getByText('Get Recommendations'));

    expect(screen.getByText('Describe what you want in at least 3 characters.')).toBeTruthy();
    expect(postAiRecommendations).not.toHaveBeenCalled();
  });

  it('renders successful AI recommendations with composer still visible', async () => {
    (postAiRecommendations as jest.Mock).mockResolvedValue(successResponse);

    renderScreen();
    await waitForQuotaHydration();

    const promptInput = screen.getByLabelText('AI recommendation prompt');
    fireEvent.changeText(promptInput, 'mind-bending sci-fi with emotional stakes');
    fireEvent.press(screen.getByText('Get Recommendations'));

    await waitFor(() => {
      expect(screen.getByTestId('ai-recommendations-results')).toBeTruthy();
    });

    expect(screen.getByText('Arrival')).toBeTruthy();
    expect(screen.getByDisplayValue('mind-bending sci-fi with emotional stakes')).toBeTruthy();
    expect(screen.queryByTestId('ai-recommendations-collapsed-prompt')).toBeNull();
    expect(screen.queryByText('Start Fresh')).toBeNull();
    expect(screen.getByText('1 of up to 10 picks · 2 requests left today')).toBeTruthy();
    expect(screen.getByText('Each request returns up to 10 catalog matches.')).toBeTruthy();
    expect(postAiRecommendations).toHaveBeenCalledWith({
      message: 'mind-bending sci-fi with emotional stakes',
      sessionId: null,
    });
    expect(trackProductMetric).toHaveBeenCalledWith('ai_recommendations_generated');
  });

  it('allows editing the prompt and submitting again with the same session', async () => {
    (postAiRecommendations as jest.Mock).mockResolvedValue(successResponse);

    renderScreen();
    await waitForQuotaHydration();

    const promptInput = screen.getByLabelText('AI recommendation prompt');
    fireEvent.changeText(promptInput, 'mind-bending sci-fi with emotional stakes');
    fireEvent.press(screen.getByText('Get Recommendations'));

    await waitFor(() => {
      expect(screen.getByTestId('ai-recommendations-results')).toBeTruthy();
    });

    (postAiRecommendations as jest.Mock).mockResolvedValue({
      ...successResponse,
      returnedCount: 2,
      quotaRemaining: 1,
      recommendations: [
        ...successResponse.recommendations,
        {
          ...successResponse.recommendations[0],
          id: 'movie-2',
          title: 'Interstellar',
        },
      ],
    });

    fireEvent.changeText(promptInput, 'more emotional sci-fi epics');
    fireEvent.press(screen.getByText('Get Recommendations'));

    await waitFor(() => {
      expect(postAiRecommendations).toHaveBeenLastCalledWith({
        message: 'more emotional sci-fi epics',
        sessionId: 'session-1',
      });
      expect(screen.getByText('Interstellar')).toBeTruthy();
    });
  });

  it('does not render catalog validation messaging on results', async () => {
    (postAiRecommendations as jest.Mock).mockResolvedValue(validationHeavyResponse);

    renderScreen();
    await waitForQuotaHydration();

    fireEvent.changeText(
      screen.getByLabelText('AI recommendation prompt'),
      'mind-bending sci-fi with emotional stakes',
    );
    fireEvent.press(screen.getByText('Get Recommendations'));

    await waitFor(() => {
      expect(screen.getByTestId('ai-recommendations-results')).toBeTruthy();
    });

    expect(
      screen.queryByText(
        '2 suggestions could not be matched to the Movie Cave catalog. Showing what we found.',
      ),
    ).toBeNull();
    expect(
      screen.queryByText(
        'Only 1 of up to 10 picks matched the catalog. 2 suggestions were filtered out.',
      ),
    ).toBeNull();
  });

  it('disables submit while a request is pending', async () => {
    let resolveRequest: (value: typeof successResponse) => void = () => {};
    (postAiRecommendations as jest.Mock).mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveRequest = resolve;
        }),
    );

    renderScreen();
    await waitForQuotaHydration();

    fireEvent.changeText(
      screen.getByLabelText('AI recommendation prompt'),
      'mind-bending sci-fi with emotional stakes',
    );
    fireEvent.press(screen.getByText('Get Recommendations'));

    await waitFor(() => {
      expect(screen.getByTestId('ai-recommendations-loading')).toBeTruthy();
    });

    expect(screen.getByLabelText('Get Recommendations').props.accessibilityState?.disabled).toBe(
      true,
    );
    expect(screen.getByLabelText('AI recommendation prompt').props.value).toBe(
      'mind-bending sci-fi with emotional stakes',
    );

    resolveRequest(successResponse);

    await waitFor(() => {
      expect(screen.getByTestId('ai-recommendations-results')).toBeTruthy();
    });
  });

  it('shows quota exceeded state for rate limited responses', async () => {
    (postAiRecommendations as jest.Mock).mockRejectedValue(
      new ApiError({
        kind: 'rate_limited',
        status: 429,
        title: 'Daily limit reached',
        detail:
          "You've used all 3 AI recommendation requests for today. Try again tomorrow.",
      }),
    );

    renderScreen();
    await waitForQuotaHydration();

    fireEvent.changeText(
      screen.getByLabelText('AI recommendation prompt'),
      'feel-good comedy under two hours',
    );
    fireEvent.press(screen.getByText('Get Recommendations'));

    await waitFor(() => {
      expect(screen.getByTestId('ai-recommendations-quota-exceeded')).toBeTruthy();
    });

    expect(screen.getByLabelText('AI recommendation prompt')).toBeTruthy();
    expect(screen.getByDisplayValue('feel-good comedy under two hours')).toBeTruthy();
    expect(screen.getByLabelText('Get Recommendations').props.accessibilityState?.disabled).toBe(
      true,
    );
  });

  it('shows generic empty state with composer available', async () => {
    (postAiRecommendations as jest.Mock).mockResolvedValue({
      ...successResponse,
      returnedCount: 0,
      recommendations: [],
      validationSummary: {
        geminiSuggestionCount: 1,
        validatedCount: 0,
        rejectedCount: 1,
      },
    });

    renderScreen();
    await waitForQuotaHydration();

    fireEvent.changeText(
      screen.getByLabelText('AI recommendation prompt'),
      'impossible match request',
    );
    fireEvent.press(screen.getByText('Get Recommendations'));

    await waitFor(() => {
      expect(screen.getByTestId('ai-recommendations-empty')).toBeTruthy();
    });

    expect(screen.getByText('No recommendations this time')).toBeTruthy();
    expect(
      screen.getByText(
        "We couldn't find suitable recommendations this time. Edit your request and try again.",
      ),
    ).toBeTruthy();
    expect(screen.queryByText(/could not be verified/i)).toBeNull();
    expect(screen.queryByText('Start Fresh')).toBeNull();
    expect(screen.getByLabelText('AI recommendation prompt')).toBeTruthy();
    expect(screen.getByDisplayValue('impossible match request')).toBeTruthy();
  });

  it('does not track ai_recommendations_generated when generation returns no picks', async () => {
    (postAiRecommendations as jest.Mock).mockResolvedValue({
      ...successResponse,
      returnedCount: 0,
      recommendations: [],
    });

    renderScreen();
    await waitForQuotaHydration();

    fireEvent.changeText(
      screen.getByLabelText('AI recommendation prompt'),
      'mind-bending sci-fi with emotional stakes',
    );
    fireEvent.press(screen.getByText('Get Recommendations'));

    await waitFor(() => {
      expect(postAiRecommendations).toHaveBeenCalled();
    });

    expect(trackProductMetric).not.toHaveBeenCalled();
  });
});
