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
    expect(screen.getByText('1 of 5 · 2 left today')).toBeTruthy();
    expect(postAiRecommendations).toHaveBeenCalledWith({
      message: 'mind-bending sci-fi with emotional stakes',
      sessionId: null,
    });
  });

  it('shows premium required state for forbidden responses', async () => {
    (postAiRecommendations as jest.Mock).mockRejectedValue(
      new ApiError({
        kind: 'forbidden',
        status: 403,
        title: 'Premium required.',
        detail: 'Premium subscription is required for AI movie recommendations.',
      }),
    );

    renderScreen();

    fireEvent.changeText(
      screen.getByLabelText('AI recommendation prompt'),
      'cozy mystery for a rainy night',
    );
    fireEvent.press(screen.getByText('Get Recommendations'));

    await waitFor(() => {
      expect(screen.getByTestId('ai-recommendations-premium-required')).toBeTruthy();
    });

    expect(screen.getByText('Premium required')).toBeTruthy();
    expect(
      screen.getByText('Premium subscription is required for AI movie recommendations.'),
    ).toBeTruthy();
  });

  it('shows quota exceeded state for rate limited responses', async () => {
    (postAiRecommendations as jest.Mock).mockRejectedValue(
      new ApiError({
        kind: 'rate_limited',
        status: 429,
        title: 'Quota exceeded.',
        detail: 'Daily AI recommendation limit reached.',
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
    expect(screen.getByText('Daily AI recommendation limit reached.')).toBeTruthy();
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
  });
});
