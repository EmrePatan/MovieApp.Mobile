import { act, render, screen } from '@testing-library/react-native';
import { Keyboard, Platform, Text } from 'react-native';
import { AuthScreenLayout } from '@/features/auth/components/AuthScreenLayout';

jest.mock('@/features/auth/components/AuthAtmosphere', () => ({
  AuthAtmosphere: () => null,
}));

jest.mock('@/features/auth/components/AuthBrandMark', () => ({
  AuthBrandMark: () => null,
}));

type KeyboardEvent = 'keyboardDidShow' | 'keyboardDidHide';

const keyboardListeners = new Map<string, Set<() => void>>();

function getListenerSet(event: string) {
  let listeners = keyboardListeners.get(event);
  if (!listeners) {
    listeners = new Set();
    keyboardListeners.set(event, listeners);
  }
  return listeners;
}

function emitKeyboard(event: KeyboardEvent) {
  getListenerSet(event).forEach((listener) => listener());
}

describe('AuthScreenLayout keyboard layout', () => {
  const originalPlatform = Platform.OS;

  beforeEach(() => {
    jest.clearAllMocks();
    keyboardListeners.clear();
    Platform.OS = originalPlatform;
    jest.spyOn(Keyboard, 'addListener').mockImplementation((event, listener) => {
      getListenerSet(event).add(listener);
      return {
        remove: () => {
          getListenerSet(event).delete(listener);
        },
      };
    });
  });

  afterAll(() => {
    Platform.OS = originalPlatform;
  });

  it('keeps the centered closed-layout mode on iOS when the keyboard opens', () => {
    Platform.OS = 'ios';

    render(
      <AuthScreenLayout
        taglineLines={['Tag']}
        headlineLines={['Headline']}
        supportingCopy="Supporting"
      >
        <Text>Form field</Text>
      </AuthScreenLayout>,
    );

    act(() => {
      emitKeyboard('keyboardDidShow');
    });

    expect(screen.getByTestId('auth-screen-layout-keyboard-closed')).toBeTruthy();
    expect(screen.queryByTestId('auth-screen-layout-keyboard-open')).toBeNull();
  });

  it('switches to keyboard-open layout on Android when the keyboard is visible', () => {
    Platform.OS = 'android';

    render(
      <AuthScreenLayout
        taglineLines={['Tag']}
        headlineLines={['Headline']}
        supportingCopy="Supporting"
      >
        <Text>Form field</Text>
      </AuthScreenLayout>,
    );

    expect(screen.getByTestId('auth-screen-layout-keyboard-closed')).toBeTruthy();

    act(() => {
      emitKeyboard('keyboardDidShow');
    });

    expect(screen.getByTestId('auth-screen-layout-keyboard-open')).toBeTruthy();
    expect(screen.queryByTestId('auth-screen-layout-keyboard-closed')).toBeNull();
  });

  it('restores the closed layout on Android after the keyboard hides', () => {
    Platform.OS = 'android';

    render(
      <AuthScreenLayout taglineLines={['Tag']} headlineLines={['Headline']}>
        <Text>Form field</Text>
      </AuthScreenLayout>,
    );

    act(() => {
      emitKeyboard('keyboardDidShow');
    });
    act(() => {
      emitKeyboard('keyboardDidHide');
    });

    expect(screen.getByTestId('auth-screen-layout-keyboard-closed')).toBeTruthy();
  });

  it('applies keyboard-open scroll styles only on Android', () => {
    Platform.OS = 'android';

    render(
      <AuthScreenLayout taglineLines={['Tag']} headlineLines={['Headline']}>
        <Text>Form field</Text>
      </AuthScreenLayout>,
    );

    const scrollView = screen.getByTestId('auth-screen-scroll');
    const closedStyles = scrollView.props.contentContainerStyle;
    const closedJustify = Array.isArray(closedStyles)
      ? closedStyles.find((style) => style?.justifyContent === 'center')
      : closedStyles;

    expect(closedJustify).toBeTruthy();

    act(() => {
      emitKeyboard('keyboardDidShow');
    });

    const openStyles = screen.getByTestId('auth-screen-scroll').props.contentContainerStyle;
    expect(
      openStyles.some(
        (style: { justifyContent?: string } | null) => style?.justifyContent === 'flex-start',
      ),
    ).toBe(true);
  });
});
