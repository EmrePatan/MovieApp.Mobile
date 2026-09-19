import { Platform } from 'react-native';
import { createIosRefreshControl } from '@/components/refresh/createIosRefreshControl';
import { MovieAppRefreshControl } from '@/components/refresh/MovieAppRefreshControl';

describe('createIosRefreshControl', () => {
  const originalPlatform = Platform.OS;

  afterEach(() => {
    Platform.OS = originalPlatform;
  });

  it('returns MovieAppRefreshControl on iOS', () => {
    Platform.OS = 'ios';
    const onRefresh = jest.fn();

    const refreshControl = createIosRefreshControl({
      refreshing: true,
      onRefresh,
      testID: 'ios-refresh',
    });

    expect(refreshControl).toBeTruthy();
    expect(refreshControl?.type).toBe(MovieAppRefreshControl);
    expect(refreshControl?.props.refreshing).toBe(true);
    expect(refreshControl?.props.testID).toBe('ios-refresh');
  });

  it('returns undefined on Android', () => {
    Platform.OS = 'android';

    const refreshControl = createIosRefreshControl({
      refreshing: true,
      onRefresh: jest.fn(),
    });

    expect(refreshControl).toBeUndefined();
  });
});
