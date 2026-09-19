import { render } from '@testing-library/react-native';
import { I18nextProvider } from 'react-i18next';
import { Platform, RefreshControl } from 'react-native';
import { MovieAppRefreshControl } from '@/components/refresh/MovieAppRefreshControl';
import { changeUiLanguage, i18n } from '@/i18n';
import { colors } from '@/theme/colors';

describe('MovieAppRefreshControl', () => {
  const originalPlatform = Platform.OS;

  beforeEach(async () => {
    await changeUiLanguage('en');
  });

  afterEach(() => {
    Platform.OS = originalPlatform;
  });

  function renderRefreshControl(
    props: React.ComponentProps<typeof MovieAppRefreshControl>,
  ) {
    return render(
      <I18nextProvider i18n={i18n}>
        <MovieAppRefreshControl {...props} />
      </I18nextProvider>,
    );
  }

  function getNativeRefreshControl(element: ReturnType<typeof render>) {
    return element.UNSAFE_getByType(RefreshControl);
  }

  it('forwards refresh props to native RefreshControl', () => {
    const onRefresh = jest.fn();
    const tree = renderRefreshControl({
      refreshing: false,
      onRefresh,
      testID: 'custom-refresh',
    });
    const native = getNativeRefreshControl(tree);

    expect(native.props.refreshing).toBe(false);
    expect(native.props.onRefresh).toBe(onRefresh);
    expect(native.props.testID).toBe('custom-refresh');
    expect(native.props.tintColor).toBe(colors.accent);
  });

  it('maps refreshing=true to active accessibility state', () => {
    const tree = renderRefreshControl({ refreshing: true, onRefresh: jest.fn() });
    const native = getNativeRefreshControl(tree);

    expect(native.props.accessibilityLabel).toBe('Refreshing content');
    expect(native.props.accessibilityHint).toBeUndefined();
  });

  it('maps refreshing=false to pull accessibility state', () => {
    const tree = renderRefreshControl({ refreshing: false, onRefresh: jest.fn() });
    const native = getNativeRefreshControl(tree);

    expect(native.props.accessibilityLabel).toBe('Pull to refresh');
    expect(native.props.accessibilityHint).toBe('Pull down and release to refresh this list');
  });

  it('localizes refresh accessibility copy in Turkish', async () => {
    await changeUiLanguage('tr');

    const tree = renderRefreshControl({ refreshing: false, onRefresh: jest.fn() });
    const native = getNativeRefreshControl(tree);

    expect(native.props.accessibilityLabel).toBe('Yenilemek için çek');
    expect(native.props.accessibilityHint).toBe('Bu listeyi yenilemek için aşağı çekip bırak');
  });

  it('does not invoke onRefresh unless the native control triggers it', () => {
    const onRefresh = jest.fn();
    const tree = renderRefreshControl({ refreshing: false, onRefresh });
    const native = getNativeRefreshControl(tree);

    native.props.onRefresh();
    expect(onRefresh).toHaveBeenCalledTimes(1);
  });

  it('uses iOS pull and refreshing titles', () => {
    Platform.OS = 'ios';

    const idle = renderRefreshControl({ refreshing: false, onRefresh: jest.fn() });
    expect(getNativeRefreshControl(idle).props.title).toBe('Pull to refresh');
    expect(getNativeRefreshControl(idle).props.titleColor).toBe(colors.textSecondary);

    const active = renderRefreshControl({ refreshing: true, onRefresh: jest.fn() });
    expect(getNativeRefreshControl(active).props.title).toBe('Refreshing content');
  });

  it('uses Android branded spinner colors', () => {
    Platform.OS = 'android';

    const tree = renderRefreshControl({ refreshing: true, onRefresh: jest.fn() });
    const native = getNativeRefreshControl(tree);

    expect(native.props.colors).toEqual([colors.accent]);
    expect(native.props.progressBackgroundColor).toBe(colors.surfaceElevated);
    expect(native.props.title).toBeUndefined();
  });
});
