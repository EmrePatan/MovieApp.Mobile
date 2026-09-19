import { fireEvent, render, screen } from '@testing-library/react-native';
import { Platform } from 'react-native';
import ProfileScreen from '../../../app/(tabs)/profile';
import { useAuth } from '@/auth/useAuth';
import { useCurrentProfile } from '@/features/profile/hooks/useCurrentProfile';

const mockPush = jest.fn();
const mockLogout = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockPush }),
}));

jest.mock('@/auth/useAuth', () => ({
  useAuth: jest.fn(),
}));

jest.mock('@/features/profile/hooks/useCurrentProfile', () => ({
  useCurrentProfile: jest.fn(),
}));

jest.mock('@/features/regions/hooks/useRegionalPreference', () => ({
  useRegionalPreference: jest.fn(() => ({
    region: 'TR',
    source: 'fallback',
    isHydrated: true,
    setRegion: jest.fn(),
    resetToDeviceDefault: jest.fn(),
  })),
}));

describe('ProfileScreen', () => {
  const originalPlatform = Platform.OS;

  beforeEach(() => {
    jest.clearAllMocks();
    Platform.OS = 'ios';
    (useAuth as jest.Mock).mockReturnValue({
      logout: mockLogout,
    });
    (useCurrentProfile as jest.Mock).mockReturnValue({
      data: {
        id: 'user-id',
        email: 'user@example.com',
        userName: 'user',
        displayName: 'Emre',
        createdAt: '2026-09-11T14:30:00Z',
      },
      isLoading: false,
      isError: false,
      refetch: jest.fn(),
      isRefetching: false,
    });
  });

  afterEach(() => {
    Platform.OS = originalPlatform;
  });

  it('renders profile identity and account sections', () => {
    render(<ProfileScreen />);

    expect(screen.getByText('Emre')).toBeTruthy();
    expect(screen.getByText('Your movie and TV identity')).toBeTruthy();
    expect(screen.queryByText('My Library')).toBeNull();
    expect(screen.queryByText('Your Year')).toBeNull();
    expect(screen.queryByText('Your Taste')).toBeNull();
  });

  it('navigates to account settings', () => {
    render(<ProfileScreen />);

    fireEvent.press(screen.getByLabelText('Edit profile'));

    expect(mockPush).toHaveBeenCalledWith('/profile/edit');
    expect(mockPush).not.toHaveBeenCalledWith('/(tabs)/library');
  });

  it('renders account settings rows', () => {
    render(<ProfileScreen />);

    expect(screen.getByLabelText('Edit profile')).toBeTruthy();
    expect(screen.getByLabelText('Change email')).toBeTruthy();
    expect(screen.getByLabelText('Change password')).toBeTruthy();
    expect(screen.getByLabelText('Delete account')).toBeTruthy();
  });

  it('logs out from profile screen', () => {
    render(<ProfileScreen />);

    fireEvent.press(screen.getByText('Sign out'));
    expect(mockLogout).toHaveBeenCalled();
  });

  it('attaches refresh control on iOS', () => {
    const refetch = jest.fn();
    (useCurrentProfile as jest.Mock).mockReturnValue({
      data: {
        id: 'user-id',
        email: 'user@example.com',
        userName: 'user',
        displayName: 'Emre',
        createdAt: '2026-09-11T14:30:00Z',
      },
      isLoading: false,
      isError: false,
      isRefetching: true,
      refetch,
    });

    const { UNSAFE_getByType } = render(<ProfileScreen />);
    const { ScrollView } = require('react-native');
    const scrollView = UNSAFE_getByType(ScrollView);

    expect(scrollView.props.refreshControl).toBeTruthy();
    scrollView.props.refreshControl.props.onRefresh();
    expect(refetch).toHaveBeenCalled();
  });

  it('omits refresh control on Android', () => {
    Platform.OS = 'android';

    const { UNSAFE_getByType } = render(<ProfileScreen />);
    const { ScrollView } = require('react-native');
    const scrollView = UNSAFE_getByType(ScrollView);

    expect(scrollView.props.refreshControl).toBeUndefined();
  });
});
