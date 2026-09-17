import { render } from '@testing-library/react-native';
import { Platform, RefreshControl } from 'react-native';
import { MovieAppRefreshControl } from '@/components/refresh/MovieAppRefreshControl';
import {
  REFRESH_IOS_PULL_TITLE,
  REFRESH_IOS_REFRESHING_TITLE,
} from '@/components/refresh/refresh-control-constants';
import { colors } from '@/theme/colors';

describe('MovieAppRefreshControl', () => {
  const originalPlatform = Platform.OS;

  afterEach(() => {
    Platform.OS = originalPlatform;
  });

  function getNativeRefreshControl(element: ReturnType<typeof render>) {
    return element.UNSAFE_getByType(RefreshControl);
  }

  it('forwards refresh props to native RefreshControl', () => {
    const onRefresh = jest.fn();
    const tree = render(
      <MovieAppRefreshControl refreshing={false} onRefresh={onRefresh} testID="custom-refresh" />,
    );
    const native = getNativeRefreshControl(tree);

    expect(native.props.refreshing).toBe(false);
    expect(native.props.onRefresh).toBe(onRefresh);
    expect(native.props.testID).toBe('custom-refresh');
    expect(native.props.tintColor).toBe(colors.accent);
  });

  it('maps refreshing=true to active accessibility state', () => {
    const tree = render(<MovieAppRefreshControl refreshing={true} onRefresh={jest.fn()} />);
    const native = getNativeRefreshControl(tree);

    expect(native.props.accessibilityLabel).toBe('Refreshing content');
    expect(native.props.accessibilityHint).toBeUndefined();
  });

  it('maps refreshing=false to pull accessibility state', () => {
    const tree = render(<MovieAppRefreshControl refreshing={false} onRefresh={jest.fn()} />);
    const native = getNativeRefreshControl(tree);

    expect(native.props.accessibilityLabel).toBe('Pull to refresh');
    expect(native.props.accessibilityHint).toBe('Pull down and release to refresh this list');
  });

  it('does not invoke onRefresh unless the native control triggers it', () => {
    const onRefresh = jest.fn();
    const tree = render(<MovieAppRefreshControl refreshing={false} onRefresh={onRefresh} />);
    const native = getNativeRefreshControl(tree);

    native.props.onRefresh();
    expect(onRefresh).toHaveBeenCalledTimes(1);
  });

  it('uses iOS pull and refreshing titles', () => {
    Platform.OS = 'ios';

    const idle = render(<MovieAppRefreshControl refreshing={false} onRefresh={jest.fn()} />);
    expect(getNativeRefreshControl(idle).props.title).toBe(REFRESH_IOS_PULL_TITLE);
    expect(getNativeRefreshControl(idle).props.titleColor).toBe(colors.textSecondary);

    const active = render(<MovieAppRefreshControl refreshing={true} onRefresh={jest.fn()} />);
    expect(getNativeRefreshControl(active).props.title).toBe(REFRESH_IOS_REFRESHING_TITLE);
  });

  it('uses Android branded spinner colors', () => {
    Platform.OS = 'android';

    const tree = render(<MovieAppRefreshControl refreshing={true} onRefresh={jest.fn()} />);
    const native = getNativeRefreshControl(tree);

    expect(native.props.colors).toEqual([colors.accent]);
    expect(native.props.progressBackgroundColor).toBe(colors.surfaceElevated);
    expect(native.props.title).toBeUndefined();
  });
});
