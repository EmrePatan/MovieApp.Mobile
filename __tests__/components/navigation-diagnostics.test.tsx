import { renderHook } from '@testing-library/react-native';
import { Platform } from 'react-native';
import {
  NAV_DIAGNOSTIC_BUILD_ID,
  useScreenRenderTrace,
} from '@/debug/navigation-diagnostics';

const mockLog = jest.spyOn(console, 'log').mockImplementation(() => {});

describe('navigation diagnostics', () => {
  beforeEach(() => {
    mockLog.mockClear();
  });

  afterAll(() => {
    mockLog.mockRestore();
  });

  it('uses the v15 4d isolation diagnostic build marker', () => {
    expect(NAV_DIAGNOSTIC_BUILD_ID).toBe('MA-45-2026-09-21-v15-4d-isolation');
  });

  it('logs platform and render counters from useScreenRenderTrace', () => {
    const originalPlatform = Platform.OS;
    Platform.OS = 'android';

    renderHook(() =>
      useScreenRenderTrace('search', {
        pathname: '/search',
        displayMode: 'results',
        resultCount: 20,
        bodyKind: 'flat-list',
        listMounted: true,
      }),
    );

    expect(mockLog).toHaveBeenCalledWith(
      expect.stringContaining('[NAV_DIAG:MA-45-2026-09-21-v15-4d-isolation] trace:search'),
      expect.objectContaining({
        platform: 'android',
        pathname: '/search',
        displayMode: 'results',
        resultCount: 20,
        bodyKind: 'flat-list',
        listMounted: true,
        renderCount: 1,
        instanceId: expect.stringMatching(/^search-\d+$/),
      }),
    );

    Platform.OS = originalPlatform;
  });
});
