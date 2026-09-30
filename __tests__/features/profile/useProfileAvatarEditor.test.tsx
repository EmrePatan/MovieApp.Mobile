import { Alert } from 'react-native';
import { renderHook, act } from '@testing-library/react-native';
import * as ImagePicker from 'expo-image-picker';
import { useProfileAvatarEditor } from '@/features/profile/hooks/useProfileAvatarEditor';
import type { UserProfileResponse } from '@/features/profile/types';

const mockUploadMutateAsync = jest.fn();
const mockRemoveMutateAsync = jest.fn();

jest.mock('@/features/profile/hooks/useProfileMutations', () => ({
  useUploadAvatarMutation: () => ({ mutateAsync: mockUploadMutateAsync }),
  useRemoveAvatarMutation: () => ({ mutateAsync: mockRemoveMutateAsync }),
}));

jest.mock('expo-image-picker', () => ({
  requestMediaLibraryPermissionsAsync: jest.fn(),
  launchImageLibraryAsync: jest.fn(),
  MediaTypeOptions: { Images: 'images' },
}));

jest.mock('expo-image-manipulator', () => ({
  manipulateAsync: jest.fn(),
  SaveFormat: { JPEG: 'jpeg' },
}));

const profile: UserProfileResponse = {
  id: 'user-1',
  email: 'user@example.com',
  userName: 'user',
  displayName: 'User',
  createdAt: '2026-01-01T00:00:00Z',
  hasPassword: true,
  linkedProviders: [],
  avatarKind: 'initials',
};

describe('useProfileAvatarEditor', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(Alert, 'alert').mockImplementation(jest.fn());
    (ImagePicker.requestMediaLibraryPermissionsAsync as jest.Mock).mockResolvedValue({
      granted: true,
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('does not upload or show error when picker is cancelled', async () => {
    (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValue({
      canceled: true,
      assets: [],
    });

    const { result } = renderHook(() => useProfileAvatarEditor(profile));

    await act(async () => {
      result.current.openAvatarActions();
    });

    const alertButtons = (Alert.alert as jest.Mock).mock.calls[0][2] as Array<{
      onPress?: () => void | Promise<void>;
    }>;
    await act(async () => {
      await alertButtons[0].onPress?.();
    });

    expect(mockUploadMutateAsync).not.toHaveBeenCalled();
    const showedUploadFailure = (Alert.alert as jest.Mock).mock.calls.some((args) =>
      String(args[0]).toLowerCase().includes('could not'),
    );
    expect(showedUploadFailure).toBe(false);
  });
});
