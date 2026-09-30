const mockPlatform = { os: 'ios' as 'ios' | 'android' | 'web' };
const mockRename = jest.fn();

jest.mock('react-native', () => ({
  Platform: {
    get OS() {
      return mockPlatform.os;
    },
  },
}));

const mockLogAvatarUploadFormDataAppendFailed = jest.fn();

jest.mock('@/api/dev-network-log', () => ({
  logAvatarUploadFormDataPart: jest.fn(),
  logAvatarUploadBeforeFormDataConstruction: jest.fn(),
  logAvatarUploadFormDataCreated: jest.fn(),
  logAvatarUploadAppendingFilePart: jest.fn(),
  logAvatarUploadFilePartAppended: jest.fn(),
  logAvatarUploadFormDataAppendFailed: (...args: unknown[]) =>
    mockLogAvatarUploadFormDataAppendFailed(...args),
  describeUploadPartForDiagnostics: jest.requireActual('@/api/dev-network-log')
    .describeUploadPartForDiagnostics,
}));

jest.mock('expo-file-system', () => {
  class MockExpoFile extends Blob {
    exists = true;
    private _name: string;
    readonly fileUri: string;
    type = 'image/jpeg';

    constructor(fileUri: string) {
      super([], { type: 'image/jpeg' });
      this.fileUri = fileUri;
      const basename = fileUri.split('/').pop() ?? 'avatar.jpg';
      this._name = basename;
    }

    get name() {
      return this._name;
    }

    rename(newName: string): void {
      mockRename(newName);
      this._name = newName;
    }

    bytes(): Uint8Array {
      return new Uint8Array([0xff, 0xd8, 0xff]);
    }
  }

  return { File: MockExpoFile };
});

import {
  assertExpoSupportedFormDataPart,
  buildAvatarUploadFormData,
  createAvatarUploadFilePart,
  isLegacyReactNativeFormDataFilePart,
} from '@/api/form-data-file';
import {
  logAvatarUploadAppendingFilePart,
  logAvatarUploadFilePartAppended,
  logAvatarUploadFormDataCreated,
} from '@/api/dev-network-log';

const { File: MockExpoFile } = jest.requireMock<{ File: typeof Blob }>('expo-file-system');

describe('form-data-file', () => {
  beforeEach(() => {
    mockPlatform.os = 'ios';
    mockRename.mockClear();
    mockLogAvatarUploadFormDataAppendFailed.mockClear();
  });

  it('creates an expo-file-system File from the manipulated image URI without stripping file:// on iOS', () => {
    const fileUri = 'file:///var/mobile/Containers/Data/avatar-cache.jpg';
    const part = createAvatarUploadFilePart({
      uri: fileUri,
      name: 'avatar.jpg',
      type: 'image/jpeg',
    });

    expect(part).toBeInstanceOf(MockExpoFile);
    expect((part as InstanceType<typeof MockExpoFile>).fileUri).toBe(fileUri);
    expect(isLegacyReactNativeFormDataFilePart(part)).toBe(false);
    expect(mockRename).toHaveBeenCalledWith('avatar.jpg');
  });

  it('prefixes bare Android paths with file:// for expo File', () => {
    mockPlatform.os = 'android';
    const part = createAvatarUploadFilePart({
      uri: '/data/user/0/cache/ImageManipulator/avatar.jpg',
      name: 'avatar.jpg',
      type: 'image/jpeg',
    });

    expect((part as InstanceType<typeof MockExpoFile>).fileUri).toBe(
      'file:///data/user/0/cache/ImageManipulator/avatar.jpg',
    );
  });

  it('builds avatar upload FormData with expo File instead of legacy RN descriptor', () => {
    const appendSpy = jest.spyOn(FormData.prototype, 'append');
    const file = {
      uri: 'file:///cache/manipulated.jpg',
      name: 'avatar.jpg',
      type: 'image/jpeg',
    };

    const formData = buildAvatarUploadFormData(file);

    expect(formData).toBeInstanceOf(FormData);
    expect(appendSpy).toHaveBeenCalledTimes(1);
    expect(appendSpy).toHaveBeenCalledWith('file', expect.any(MockExpoFile), 'avatar.jpg');
    expect(logAvatarUploadFormDataCreated).toHaveBeenCalled();
    expect(logAvatarUploadAppendingFilePart).toHaveBeenCalled();
    expect(logAvatarUploadFilePartAppended).toHaveBeenCalled();

    const [, part] = appendSpy.mock.calls[0] as [string, unknown, string];
    expect(isLegacyReactNativeFormDataFilePart(part)).toBe(false);
    expect(part).toBeInstanceOf(Blob);
    assertExpoSupportedFormDataPart(part);

    appendSpy.mockRestore();
  });

  it('logs and rethrows when FormData.append fails', () => {
    const appendError = new Error('append rejected native part');
    jest.spyOn(FormData.prototype, 'append').mockImplementation(() => {
      throw appendError;
    });

    expect(() =>
      buildAvatarUploadFormData({
        uri: 'file:///cache/manipulated.jpg',
        name: 'avatar.jpg',
        type: 'image/jpeg',
      }),
    ).toThrow(appendError);

    expect(mockLogAvatarUploadFormDataAppendFailed).toHaveBeenCalledWith(
      appendError,
      expect.any(MockExpoFile),
    );
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
