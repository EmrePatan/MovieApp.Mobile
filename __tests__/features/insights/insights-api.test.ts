import { getInsightsV3 } from '@/features/insights/api/insights-api';
import { buildInsightsV3Path } from '@/features/insights/api/routes';
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

  it('requests insights v3 with timezone and optional year', async () => {
    (api.get as jest.Mock).mockResolvedValue({});

    await getInsightsV3('Europe/London');
    await getInsightsV3('Europe/London', 2025);

    expect(api.get).toHaveBeenNthCalledWith(1, buildInsightsV3Path('Europe/London'), {
      signal: undefined,
    });
    expect(api.get).toHaveBeenNthCalledWith(2, buildInsightsV3Path('Europe/London', 2025), {
      signal: undefined,
    });
  });
});
