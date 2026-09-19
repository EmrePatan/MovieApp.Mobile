import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ApiError } from '@/api/errors';
import { AiRecommendationsContent } from '@/features/ai-recommendations/components/AiRecommendationsContent';
import { postAiRecommendations } from '@/features/ai-recommendations/api/ai-recommendations-api';

const mockPush = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockPush, back: jest.fn(), canGoBack: jest.fn(() => true) }),
  useSegments: () => ['ai-recommendations'],
}));

jest.mock('@/features/ai-recommendations/api/ai-recommendations-api', () => ({
  postAiRecommendations: jest.fn(),
}));

jest.mock('@/features/metrics/track-product-metric', () => ({
  trackProductMetric: jest.fn(),
}));

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
  requestedCount: 5,
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

describe('AiRecommendationsContent', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the prompt composer and suggested prompts', () => {
    renderScreen();

    expect(screen.getByText('AI Recommendations')).toBeTruthy();
    expect(screen.getByTestId('ai-recommendations-quota-remaining')).toHaveTextContent(
      '3 of 3 requests left today',
    );
    expect(screen.getByLabelText('AI recommendation prompt')).toBeTruthy();
    expect(screen.getByText('Get Recommendations')).toBeTruthy();
    expect(screen.getByLabelText('Use prompt: A cozy mystery for a rainy night')).toBeTruthy();
  });

  it('shows validation feedback for short prompts', () => {
    renderScreen();

    fireEvent.changeText(screen.getByLabelText('AI recommendation prompt'), 'hi');
    fireEvent.press(screen.getByText('Get Recommendations'));

    expect(screen.getByText('Describe what you want in at least 3 characters.')).toBeTruthy();
    expect(postAiRecommendations).not.toHaveBeenCalled();
  });

  it('renders successful AI recommendations', async () => {
    (postAiRecommendations as jest.Mock).mockResolvedValue(successResponse);

    renderScreen();

    fireEvent.changeText(
      screen.getByLabelText('AI recommendation prompt'),
      'mind-bending sci-fi with emotional stakes',
    );
    fireEvent.press(screen.getByText('Get Recommendations'));

    await waitFor(() => {
      expect(screen.getByTestId('ai-recommendations-results')).toBeTruthy();
    });

    expect(screen.getByTestId('ai-recommendations-results')).toBeTruthy();
    expect(screen.getByText('Arrival')).toBeTruthy();
    expect(screen.getByTestId('ai-recommendations-quota-remaining')).toHaveTextContent(
      '2 of 3 requests left today',
    );
    expect(screen.getByText('1 of up to 5 picks · 2 requests left today')).toBeTruthy();
    expect(screen.getByText('Each request returns up to 5 catalog matches.')).toBeTruthy();
    expect(screen.getByText('Why it fits')).toBeTruthy();
    expect(screen.getByTestId('ai-recommendations-collapsed-prompt')).toBeTruthy();
    expect(screen.queryByLabelText('AI recommendation prompt')).toBeNull();
    expect(screen.getByText('Get More Picks')).toBeTruthy();
    expect(screen.getByText('Start Fresh')).toBeTruthy();
    expect(screen.queryByText('Refine This Session')).toBeNull();
    expect(postAiRecommendations).toHaveBeenCalledWith({
      message: 'mind-bending sci-fi with emotional stakes',
      sessionId: null,
    });
  });

  it('requests more picks in the same session from results actions', async () => {
    (postAiRecommendations as jest.Mock).mockResolvedValue(successResponse);

    renderScreen();

    fireEvent.changeText(
      screen.getByLabelText('AI recommendation prompt'),
      'mind-bending sci-fi with emotional stakes',
    );
    fireEvent.press(screen.getByText('Get Recommendations'));

    await waitFor(() => {
      expect(screen.getByTestId('ai-recommendations-results')).toBeTruthy();
    });

    (postAiRecommendations as jest.Mock).mockResolvedValue({
      ...successResponse,
      returnedCount: 2,
      recommendations: [
        ...successResponse.recommendations,
        {
          ...successResponse.recommendations[0],
          id: 'movie-2',
          title: 'Interstellar',
        },
      ],
    });

    fireEvent.press(screen.getByText('Get More Picks'));

    await waitFor(() => {
      expect(postAiRecommendations).toHaveBeenLastCalledWith({
        message: 'mind-bending sci-fi with emotional stakes',
        sessionId: 'session-1',
      });
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

    fireEvent.changeText(
      screen.getByLabelText('AI recommendation prompt'),
      'feel-good comedy under two hours',
    );
    fireEvent.press(screen.getByText('Get Recommendations'));

    await waitFor(() => {
      expect(screen.getByTestId('ai-recommendations-quota-exceeded')).toBeTruthy();
    });

    expect(screen.getByText('Daily limit reached')).toBeTruthy();
    expect(
      screen.getByText(
        "You've used all 3 AI recommendation requests for today. Try again tomorrow.",
      ),
    ).toBeTruthy();
    expect(screen.getByTestId('ai-recommendations-quota-remaining')).toHaveTextContent(
      '0 of 3 requests left today',
    );
  });

  it('shows empty state when the API returns zero validated results', async () => {
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

    fireEvent.changeText(
      screen.getByLabelText('AI recommendation prompt'),
      'impossible match request',
    );
    fireEvent.press(screen.getByText('Get Recommendations'));

    await waitFor(() => {
      expect(screen.getByTestId('ai-recommendations-empty')).toBeTruthy();
    });

    expect(screen.getByText('No matches this time')).toBeTruthy();
    expect(screen.getByTestId('ai-recommendations-collapsed-prompt')).toBeTruthy();
    expect(screen.queryByLabelText('AI recommendation prompt')).toBeNull();
  });

  it('shows low-yield guidance when fewer picks match than requested', async () => {
    (postAiRecommendations as jest.Mock).mockResolvedValue({
      ...successResponse,
      partialResults: false,
      validationSummary: {
        geminiSuggestionCount: 3,
        validatedCount: 1,
        rejectedCount: 2,
      },
    });

    renderScreen();

    fireEvent.changeText(
      screen.getByLabelText('AI recommendation prompt'),
      'mind-bending sci-fi with emotional stakes',
    );
    fireEvent.press(screen.getByText('Get Recommendations'));

    await waitFor(() => {
      expect(
        screen.getByText(
          'Only 1 of up to 5 picks matched the catalog. 2 suggestions were filtered out.',
        ),
      ).toBeTruthy();
    });
  });
});
