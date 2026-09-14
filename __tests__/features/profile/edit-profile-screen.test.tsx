import { fireEvent, render, screen } from '@testing-library/react-native';
import EditProfileScreen from '../../../app/profile/edit';
import { useCurrentProfile } from '@/features/profile/hooks/useCurrentProfile';
import { useUpdateProfileMutation } from '@/features/profile/hooks/useProfileMutations';

const mockBack = jest.fn();
const mockMutate = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({ back: mockBack, push: jest.fn(), navigate: jest.fn() }),
  useSegments: jest.fn(() => []),
}));

jest.mock('@/features/profile/hooks/useCurrentProfile', () => ({
  useCurrentProfile: jest.fn(),
}));

jest.mock('@/features/profile/hooks/useProfileMutations', () => ({
  useUpdateProfileMutation: jest.fn(),
}));

describe('EditProfileScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useCurrentProfile as jest.Mock).mockReturnValue({
      data: { displayName: 'Emre' },
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

  it('submits profile update', () => {
    mockMutate.mockImplementation((_payload, options) => {
      options?.onSuccess?.();
    });

    render(<EditProfileScreen />);
    fireEvent.changeText(screen.getByLabelText('Display name'), 'New Name');
    fireEvent.press(screen.getByText('Save changes'));

    expect(mockMutate).toHaveBeenCalledWith(
      { displayName: 'New Name' },
      expect.any(Object),
    );
  });
});
