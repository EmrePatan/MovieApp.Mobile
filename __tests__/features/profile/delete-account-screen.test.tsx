import { fireEvent, render, screen } from '@testing-library/react-native';
import DeleteAccountScreen from '../../../app/profile/delete-account';
import { useDeleteAccountMutation } from '@/features/profile/hooks/useProfileMutations';

const mockMutate = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({ back: jest.fn(), push: jest.fn() }),
}));

jest.mock('@/features/profile/hooks/useProfileMutations', () => ({
  useDeleteAccountMutation: jest.fn(),
}));

describe('DeleteAccountScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useDeleteAccountMutation as jest.Mock).mockReturnValue({
      mutate: mockMutate,
      isPending: false,
    });
  });

  it('requires confirmation before password step', () => {
    render(<DeleteAccountScreen />);
    expect(screen.queryByLabelText('Current password')).toBeNull();
    fireEvent.press(screen.getByText('Continue'));
    expect(screen.getByLabelText('Current password')).toBeTruthy();
  });

  it('submits delete account mutation with password', () => {
    render(<DeleteAccountScreen />);
    fireEvent.press(screen.getByText('Continue'));
    fireEvent.changeText(screen.getByLabelText('Current password'), 'password');
    fireEvent.press(screen.getByText('Delete my account'));

    expect(mockMutate).toHaveBeenCalledWith(
      { currentPassword: 'password' },
      expect.any(Object),
    );
  });
});
