import { fireEvent, render, screen } from '@testing-library/react-native';
import EditProfileScreen from '../../../app/profile/edit';
import { useCurrentProfile } from '@/features/profile/hooks/useCurrentProfile';
import { useUpdateProfileMutation } from '@/features/profile/hooks/useProfileMutations';

const mockBack = jest.fn();
const mockMutate = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({ back: mockBack, canGoBack: () => true, replace: jest.fn(), push: jest.fn(), navigate: jest.fn() }),
  useSegments: jest.fn(() => []),
}));

jest.mock('@/features/profile/hooks/useCurrentProfile', () => ({
  useCurrentProfile: jest.fn(),
}));

jest.mock('@/features/profile/components/ProfileCoverEditor', () => ({
  ProfileCoverEditor: () => null,
}));
jest.mock('@/features/profile/components/ProfileAvatarEditor', () => ({
  ProfileAvatarEditor: () => null,
}));

jest.mock('@/features/profile/hooks/useProfileMutations', () => ({
  useUpdateProfileMutation: jest.fn(),
}));

describe('EditProfileScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useCurrentProfile as jest.Mock).mockReturnValue({
      data: {
        displayName: 'Emre',
        bio: null,
        socialLinks: null,
      },
    });
    (useUpdateProfileMutation as jest.Mock).mockReturnValue({
      mutate: mockMutate,
      isPending: false,
    });
  });

  it('validates empty display name', () => {
    render(<EditProfileScreen />);
    fireEvent.changeText(screen.getByLabelText('Display name'), '   ');
    fireEvent.press(screen.getByText('Save changes'));
    expect(screen.getByText('Display name is required.')).toBeTruthy();
    expect(mockMutate).not.toHaveBeenCalled();
  });

  it('submits profile update with bio and social links', () => {
    mockMutate.mockImplementation((_payload, options) => {
      options?.onSuccess?.();
    });

    render(<EditProfileScreen />);
    fireEvent.changeText(screen.getByLabelText('Display name'), 'New Name');
    fireEvent.changeText(screen.getByLabelText('About'), 'Hello bio');
    fireEvent.changeText(screen.getByLabelText('Instagram'), '@emre');
    fireEvent.press(screen.getByText('Save changes'));

    expect(mockMutate).toHaveBeenCalledWith(
      {
        displayName: 'New Name',
        bio: 'Hello bio',
        socialLinks: expect.objectContaining({
          instagram: 'emre',
          x: null,
        }),
      },
      expect.any(Object),
    );
  });
});
