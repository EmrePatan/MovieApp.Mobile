const mockPlatform = { os: 'ios' as 'ios' | 'android' | 'web' };
const mockRename = jest.fn();
const mockBytes = jest.fn(() => Promise.resolve(new Uint8Array([0xff, 0xd8, 0xff])));

jest.mock('react-native', () => ({
  Platform: {
    get OS() {
      return mockPlatform.os;
    },
  },
}));

jest.mock('expo-file-system', () => {
  class MockExpoFile {
    exists = true;
    readonly fileUri: string;

    constructor(fileUri: string) {
      this.fileUri = fileUri;
    }

    get name(): string {
      throw new Error('expo-file-system File.name must not be read for avatar uploads');
    }

    rename(newName: string): void {
      mockRename(newName);
    }

    bytes(): Promise<Uint8Array> {
      return mockBytes();
    }
  }

  return { File: MockExpoFile };
});

import {
  assertExpoSupportedFormDataPart,
  buildAvatarUploadFormData,
  createAvatarMultipartUploadPart,
  isLegacyReactNativeFormDataFilePart,
} from '@/api/form-data-file';

describe('form-data-file', () => {
  beforeEach(() => {
    mockPlatform.os = 'ios';
    mockRename.mockClear();
    mockBytes.mockClear();
  });

  it('creates a bytes-backed multipart part without reading expo File.name or renaming', () => {
    const fileUri = 'file:///var/mobile/Containers/Data/avatar-cache.jpg';
    const { fileExists, uploadPart } = createAvatarMultipartUploadPart({
      uri: fileUri,
      name: 'avatar.jpg',
      type: 'image/jpeg',
    });

    expect(fileExists).toBe(true);
    expect(mockRename).not.toHaveBeenCalled();
    expect(uploadPart.name).toBe('avatar.jpg');
    expect(uploadPart.type).toBe('image/jpeg');
    expect(typeof uploadPart.bytes).toBe('function');
    expect(isLegacyReactNativeFormDataFilePart(uploadPart)).toBe(false);
    assertExpoSupportedFormDataPart(uploadPart);
  });

  it('delegates bytes() to expo-file-system File without legacy uri descriptor', async () => {
    const { uploadPart } = createAvatarMultipartUploadPart({
      uri: 'file:///cache/manipulated.jpg',
      name: 'avatar.jpg',
      type: 'image/jpeg',
    });

    await expect(uploadPart.bytes()).resolves.toEqual(new Uint8Array([0xff, 0xd8, 0xff]));
    expect(mockBytes).toHaveBeenCalledTimes(1);
    expect(isLegacyReactNativeFormDataFilePart(uploadPart)).toBe(false);
  });

  it('prefixes bare Android paths with file:// for expo File construction', () => {
    mockPlatform.os = 'android';
    const { uploadPart } = createAvatarMultipartUploadPart({
      uri: '/data/user/0/cache/ImageManipulator/avatar.jpg',
      name: 'avatar.jpg',
      type: 'image/jpeg',
    });

    expect(uploadPart.name).toBe('avatar.jpg');
    expect(mockRename).not.toHaveBeenCalled();
  });

  it('builds avatar upload FormData with bytes-backed part instead of expo File or legacy descriptor', () => {
    const appendSpy = jest.spyOn(FormData.prototype, 'append');
    const file = {
      uri: 'file:///cache/manipulated.jpg',
      name: 'avatar.jpg',
      type: 'image/jpeg',
    };

    const formData = buildAvatarUploadFormData(file);

    expect(formData).toBeInstanceOf(FormData);
    expect(appendSpy).toHaveBeenCalledTimes(1);
    expect(mockRename).not.toHaveBeenCalled();

    const [, part] = appendSpy.mock.calls[0] as [string, unknown];
    expect(part).toEqual(
      expect.objectContaining({
        name: 'avatar.jpg',
        type: 'image/jpeg',
      }),
    );
    expect(typeof (part as { bytes?: unknown }).bytes).toBe('function');
    expect(isLegacyReactNativeFormDataFilePart(part)).toBe(false);
    assertExpoSupportedFormDataPart(part);

    appendSpy.mockRestore();
  });

  it('rejects legacy React Native multipart descriptors like Expo winter fetch', () => {
    expect(() =>
      assertExpoSupportedFormDataPart({
        uri: 'file:///cache/avatar.jpg',
        name: 'avatar.jpg',
        type: 'image/jpeg',
      }),
    ).toThrow('Unsupported FormDataPart implementation');
  });
});
