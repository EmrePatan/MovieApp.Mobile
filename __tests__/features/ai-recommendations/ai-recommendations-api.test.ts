import { ApiError } from '@/api/errors';
import { api } from '@/api/client';
import { postAiRecommendations } from '@/features/ai-recommendations/api/ai-recommendations-api';
import { AI_RECOMMENDATIONS_PATH } from '@/features/ai-recommendations/api/routes';

jest.mock('@/api/client', () => ({
  api: {
    post: jest.fn(),
  },
}));

describe('ai recommendations api', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('posts recommendation requests to the AI endpoint', async () => {
    const response = {
      sessionId: 'session-1',
      isAiGenerated: true,
      partialResults: false,
      requestedCount: 5,
      returnedCount: 2,
      quotaRemaining: 1,
      recommendations: [],
      validationSummary: {
        geminiSuggestionCount: 2,
        validatedCount: 2,
        rejectedCount: 0,
      },
    };

    (api.post as jest.Mock).mockResolvedValue(response);

    await expect(
      postAiRecommendations({ message: 'cozy mystery tonight', sessionId: null }),
    ).resolves.toEqual(response);

    expect(api.post).toHaveBeenCalledWith(
      AI_RECOMMENDATIONS_PATH,
      { message: 'cozy mystery tonight', sessionId: null },
      { signal: undefined },
    );
  });

  it('returns empty 422 AI responses instead of throwing', async () => {
    const emptyResponse = {
      sessionId: 'session-2',
      isAiGenerated: true,
      partialResults: false,
      requestedCount: 5,
      returnedCount: 0,
      quotaRemaining: 2,
      recommendations: [],
      validationSummary: {
        geminiSuggestionCount: 1,
        validatedCount: 0,
        rejectedCount: 1,
      },
    };

    (api.post as jest.Mock).mockRejectedValue(
      new ApiError({
        kind: 'validation',
        status: 422,
        title: 'No valid recommendations.',
        detail: 'No valid recommendations.',
        responseBody: emptyResponse,
      }),
    );

    await expect(
      postAiRecommendations({ message: 'impossible match request', sessionId: null }),
    ).resolves.toEqual(emptyResponse);
  });
});
