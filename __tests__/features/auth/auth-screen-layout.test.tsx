import { fireEvent, render, screen } from '@testing-library/react-native';
import { Platform, Text } from 'react-native';
import { AuthScreenLayout } from '@/features/auth/components/AuthScreenLayout';

jest.mock('@/features/auth/components/AuthAtmosphere', () => ({
  AuthAtmosphere: () => null,
}));

jest.mock('@/features/auth/components/AuthBrandMark', () => ({
  AuthBrandMark: () => null,
}));

describe('AuthScreenLayout keyboard layout', () => {
  const originalPlatform = Platform.OS;

  beforeEach(() => {
    jest.clearAllMocks();
    Platform.OS = originalPlatform;
  });

  afterAll(() => {
    Platform.OS = originalPlatform;
  });

  it('keeps a stable content tree when the viewport shrinks', () => {
    render(
      <AuthScreenLayout taglineLines={['Tag']} headlineLines={['Headline']}>
        <Text>Form field</Text>
      </AuthScreenLayout>,
    );

    expect(screen.getByTestId('auth-screen-layout-content')).toBeTruthy();
    expect(screen.queryByTestId('auth-screen-layout-keyboard-open')).toBeNull();
    expect(screen.queryByTestId('auth-screen-layout-keyboard-closed')).toBeNull();

    fireEvent(screen.getByTestId('auth-screen-viewport'), 'layout', {
      nativeEvent: { layout: { height: 420, width: 360, x: 0, y: 0 } },
    });

    expect(screen.getByTestId('auth-screen-layout-content')).toBeTruthy();
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
      contentStyles.some((style: { justifyContent?: string } | null) => style?.justifyContent === 'center'),
    ).toBe(true);
  });

  it('uses viewport layout height to keep the form scrollable above the keyboard', () => {
    render(
      <AuthScreenLayout taglineLines={['Tag']} headlineLines={['Headline']}>
        <Text>Form field</Text>
      </AuthScreenLayout>,
    );

    fireEvent(screen.getByTestId('auth-screen-viewport'), 'layout', {
      nativeEvent: { layout: { height: 500, width: 360, x: 0, y: 0 } },
    });

    const content = screen.getByTestId('auth-screen-layout-content');
    const contentStyles = Array.isArray(content.props.style)
      ? content.props.style
      : [content.props.style];

    expect(
      contentStyles.some(
        (style: { minHeight?: number } | null) => typeof style?.minHeight === 'number' && style.minHeight > 0,
      ),
    ).toBe(true);
  });

  it('does not toggle scroll justification when the viewport shrinks', () => {
    Platform.OS = 'android';

    render(
      <AuthScreenLayout taglineLines={['Tag']} headlineLines={['Headline']}>
        <Text>Form field</Text>
      </AuthScreenLayout>,
    );

    const scrollView = screen.getByTestId('auth-screen-scroll');
    const initialStyles = Array.isArray(scrollView.props.contentContainerStyle)
      ? scrollView.props.contentContainerStyle
      : [scrollView.props.contentContainerStyle];

    expect(
      initialStyles.some(
        (style: { justifyContent?: string } | null) => style?.justifyContent === 'flex-start',
      ),
    ).toBe(false);

    fireEvent(screen.getByTestId('auth-screen-viewport'), 'layout', {
      nativeEvent: { layout: { height: 320, width: 360, x: 0, y: 0 } },
    });

    const updatedStyles = Array.isArray(scrollView.props.contentContainerStyle)
      ? scrollView.props.contentContainerStyle
      : [scrollView.props.contentContainerStyle];

    expect(
      updatedStyles.some(
        (style: { justifyContent?: string } | null) => style?.justifyContent === 'flex-start',
      ),
    ).toBe(false);
  });

  it('enables native keyboard inset adjustment for focused fields', () => {
    render(
      <AuthScreenLayout taglineLines={['Tag']} headlineLines={['Headline']}>
        <Text>Form field</Text>
      </AuthScreenLayout>,
    );

    expect(screen.getByTestId('auth-screen-scroll').props.automaticallyAdjustKeyboardInsets).toBe(true);
  });
});
