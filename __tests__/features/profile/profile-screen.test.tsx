import { fireEvent, render, screen } from '@testing-library/react-native';
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
  beforeEach(() => {
    jest.clearAllMocks();
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
});
