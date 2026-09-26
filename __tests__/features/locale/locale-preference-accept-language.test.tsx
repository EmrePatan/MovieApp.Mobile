const mockGetSavedUiLanguage = jest.fn<Promise<'en' | 'tr' | null>, []>();

jest.mock('@/features/locale/locale-preference-storage', () => ({
  getSavedUiLanguage: () => mockGetSavedUiLanguage(),
  saveUiLanguage: jest.fn().mockResolvedValue(undefined),
  clearSavedUiLanguage: jest.fn().mockResolvedValue(undefined),
}));

jest.unmock('@/features/locale/hooks/useLocalePreference');

import React, { useEffect } from 'react';
import { Text } from 'react-native';
import { render, waitFor } from '@testing-library/react-native';
import { api } from '@/api/client';
import { LocalePreferenceProvider } from '@/features/locale/LocalePreferenceProvider';
import { useLocalePreference } from '@/features/locale/hooks/useLocalePreference';

function HydratedRequestProbe({ onAcceptLanguage }: { onAcceptLanguage: (tag: string) => void }) {
  const { isHydrated } = useLocalePreference();

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    void (async () => {
      global.fetch = jest.fn().mockImplementation((_url, init) => {
        const headers = init?.headers as Record<string, string>;
        onAcceptLanguage(headers['Accept-Language'] ?? '');
        return Promise.resolve({
          ok: true,
          status: 200,
          headers: { get: () => 'application/json' },
          json: async () => ({}),
        });
      }) as typeof fetch;

      await api.get('/api/movies/11111111-1111-1111-1111-111111111111', { authenticated: false });
    })();
  }, [isHydrated, onAcceptLanguage]);

  return <Text>probe</Text>;
}

describe('LocalePreferenceProvider Accept-Language', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    process.env.EXPO_PUBLIC_API_URL = 'http://localhost:5027';
    api.setTokenGetter(() => null);
    mockGetSavedUiLanguage.mockReset();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('sends tr-TR on the first localized request when saved preference is Turkish', async () => {
    mockGetSavedUiLanguage.mockResolvedValue('tr');
    const captured: string[] = [];

    render(
      <LocalePreferenceProvider>
        <HydratedRequestProbe onAcceptLanguage={(tag) => captured.push(tag)} />
      </LocalePreferenceProvider>,
    );

    await waitFor(
      () => {
        expect(captured).toContain('tr-TR');
      },
      { timeout: 3000 },
    );
  });

  it('sends en-US on the first localized request when saved preference is English', async () => {
    mockGetSavedUiLanguage.mockResolvedValue('en');
    const captured: string[] = [];

    render(
      <LocalePreferenceProvider>
        <HydratedRequestProbe onAcceptLanguage={(tag) => captured.push(tag)} />
      </LocalePreferenceProvider>,
    );

    await waitFor(
      () => {
        expect(captured).toContain('en-US');
      },
      { timeout: 3000 },
    );
  });
});
