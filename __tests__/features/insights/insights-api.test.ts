import { getInsightsAnalytics, getInsightsSummary } from '@/features/insights/api/insights-api';
import { buildInsightsAnalyticsPath, buildInsightsSummaryPath } from '@/features/insights/api/routes';
import { api } from '@/api/client';

jest.mock('@/api/client', () => ({
  api: {
    get: jest.fn(),
  },
}));

describe('insights api', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('requests summary and analytics independently with timezone', async () => {
    (api.get as jest.Mock).mockResolvedValue({});

    await getInsightsSummary('Europe/London');
    await getInsightsAnalytics('Europe/London');

    expect(api.get).toHaveBeenNthCalledWith(1, buildInsightsSummaryPath('Europe/London'), {
      signal: undefined,
    });
    expect(api.get).toHaveBeenNthCalledWith(2, buildInsightsAnalyticsPath('Europe/London'), {
      signal: undefined,
    });
  });
});
