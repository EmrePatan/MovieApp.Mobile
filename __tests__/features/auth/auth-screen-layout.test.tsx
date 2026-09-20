import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { Keyboard, KeyboardAvoidingView, Platform, Text } from 'react-native';
import { AuthScreenLayout } from '@/features/auth/components/AuthScreenLayout';

jest.mock('@/features/auth/components/AuthAtmosphere', () => ({
  AuthAtmosphere: () => null,
}));

jest.mock('@/features/auth/components/AuthBrandMark', () => ({
  AuthBrandMark: () => null,
}));

describe('AuthScreenLayout keyboard layout', () => {
  const originalPlatform = Platform.OS;
  let keyboardShowCallback: ((event: { endCoordinates: { height: number } }) => void) | null =
    null;
  let keyboardHideCallback: (() => void) | null = null;

  beforeEach(() => {
    jest.clearAllMocks();
    Platform.OS = originalPlatform;
    keyboardShowCallback = null;
    keyboardHideCallback = null;

    jest.spyOn(Keyboard, 'addListener').mockImplementation((event, callback) => {
      if (event === 'keyboardWillShow' || event === 'keyboardDidShow') {
        keyboardShowCallback = callback as (event: { endCoordinates: { height: number } }) => void;
      }

      if (event === 'keyboardWillHide' || event === 'keyboardDidHide') {
        keyboardHideCallback = callback as () => void;
      }

      return { remove: jest.fn() };
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  afterAll(() => {
    Platform.OS = originalPlatform;
  });

  function showKeyboard(height = 280) {
    act(() => {
      keyboardShowCallback?.({ endCoordinates: { height } });
    });
  }

  function hideKeyboard() {
    act(() => {
      keyboardHideCallback?.();
    });
  }

  it('keeps a stable content tree when the keyboard opens', () => {
    render(
      <AuthScreenLayout taglineLines={['Tag']} headlineLines={['Headline']}>
        <Text>Form field</Text>
      </AuthScreenLayout>,
    );

    expect(screen.getByTestId('auth-screen-layout-content')).toBeTruthy();
    expect(screen.getByTestId('auth-screen-hero')).toBeTruthy();
    expect(screen.getByTestId('auth-screen-form-stage')).toBeTruthy();
    expect(screen.getByText('Form field')).toBeTruthy();

    showKeyboard();

    expect(screen.getByTestId('auth-screen-layout-content')).toBeTruthy();
    expect(screen.getByTestId('auth-screen-hero')).toBeTruthy();
    expect(screen.getByTestId('auth-screen-form-stage')).toBeTruthy();
    expect(screen.getByText('Form field')).toBeTruthy();
  });

  it('centers auth content when the keyboard is closed', () => {
    render(
      <AuthScreenLayout taglineLines={['Tag']} headlineLines={['Headline']}>
        <Text>Form field</Text>
      </AuthScreenLayout>,
    );

    const content = screen.getByTestId('auth-screen-layout-content');
    const contentStyles = Array.isArray(content.props.style)
      ? content.props.style
      : [content.props.style];

    expect(
      contentStyles.some(
        (style: { justifyContent?: string } | null) => style?.justifyContent === 'center',
      ),
    ).toBe(true);
  });

  it('centers the form stage when the keyboard is open', () => {
    render(
      <AuthScreenLayout taglineLines={['Tag']} headlineLines={['Headline']}>
        <Text>Form field</Text>
      </AuthScreenLayout>,
    );

    fireEvent(screen.getByTestId('auth-screen-viewport'), 'layout', {
      nativeEvent: { layout: { height: 500, width: 360, x: 0, y: 0 } },
    });

    showKeyboard(280);

    const content = screen.getByTestId('auth-screen-layout-content');
    const contentStyles = Array.isArray(content.props.style)
      ? content.props.style
      : [content.props.style];

    expect(
      contentStyles.some(
        (style: { justifyContent?: string } | null) => style?.justifyContent === 'flex-start',
      ),
    ).toBe(true);

    const formStage = screen.getByTestId('auth-screen-form-stage');
    const formStageStyles = Array.isArray(formStage.props.style)
      ? formStage.props.style
      : [formStage.props.style];

    expect(
      formStageStyles.some(
        (style: { justifyContent?: string } | null) => style?.justifyContent === 'center',
      ),
    ).toBe(true);
    expect(
      formStageStyles.some(
        (style: { minHeight?: number } | null) => typeof style?.minHeight === 'number' && style.minHeight > 0,
      ),
    ).toBe(true);
  });

  it('does not mount competing keyboard avoidance wrappers', () => {
    const view = render(
      <AuthScreenLayout taglineLines={['Tag']} headlineLines={['Headline']}>
        <Text>Form field</Text>
      </AuthScreenLayout>,
    );

    expect(view.UNSAFE_queryAllByType(KeyboardAvoidingView)).toHaveLength(0);
  });

  it('uses native keyboard inset adjustment and keeps the keyboard open while scrolling', () => {
    render(
      <AuthScreenLayout taglineLines={['Tag']} headlineLines={['Headline']}>
        <Text>Form field</Text>
      </AuthScreenLayout>,
    );

    const scrollView = screen.getByTestId('auth-screen-scroll');
    expect(scrollView.props.automaticallyAdjustKeyboardInsets).toBe(true);
    expect(scrollView.props.keyboardDismissMode).toBe('none');
  });

  it('restores the closed layout after the keyboard hides', () => {
    render(
      <AuthScreenLayout taglineLines={['Tag']} headlineLines={['Headline']}>
        <Text>Form field</Text>
      </AuthScreenLayout>,
    );

    showKeyboard();
    hideKeyboard();

    const content = screen.getByTestId('auth-screen-layout-content');
    const contentStyles = Array.isArray(content.props.style)
      ? content.props.style
      : [content.props.style];

    expect(
      contentStyles.some(
        (style: { justifyContent?: string } | null) => style?.justifyContent === 'center',
      ),
    ).toBe(true);
  });
});
