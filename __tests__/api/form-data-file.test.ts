const mockPlatform = { os: 'ios' as 'ios' | 'android' | 'web' };

jest.mock('react-native', () => ({
  Platform: {
    get OS() {
      return mockPlatform.os;
    },
  },
}));

import {
  appendReactNativeFormDataFile,
  buildAvatarUploadFormData,
  normalizeUploadFileUri,
} from '@/api/form-data-file';

describe('form-data-file', () => {
  beforeEach(() => {
    mockPlatform.os = 'ios';
  });

  it('normalizes iOS file URIs to filesystem paths for native multipart', () => {
    expect(normalizeUploadFileUri('file:///var/mobile/Containers/Data/avatar.jpg')).toBe(
      '/var/mobile/Containers/Data/avatar.jpg',
    );
  });

  it('keeps Android content URIs unchanged', () => {
    mockPlatform.os = 'android';
    const contentUri = 'content://media/external/images/media/42';
    expect(normalizeUploadFileUri(contentUri)).toBe(contentUri);
  });

  it('builds avatar upload FormData with React Native file descriptor', () => {
    const appendSpy = jest.spyOn(FormData.prototype, 'append');
    const file = {
      uri: 'file:///cache/avatar.jpg',
      name: 'avatar.jpg',
      type: 'image/jpeg',
    };

    const formData = buildAvatarUploadFormData(file);

    expect(formData).toBeInstanceOf(FormData);
    expect(appendSpy).toHaveBeenCalledTimes(1);
    expect(appendSpy).toHaveBeenCalledWith('file', {
      uri: '/cache/avatar.jpg',
      name: 'avatar.jpg',
      type: 'image/jpeg',
    });

    appendSpy.mockRestore();
  });

  it('does not JSON-serialize the file descriptor when appending', () => {
    const appendSpy = jest.spyOn(FormData.prototype, 'append');
    const formData = new FormData();

    appendReactNativeFormDataFile(formData, 'file', {
      uri: 'file:///tmp/avatar.jpg',
      name: 'avatar.jpg',
      type: 'image/jpeg',
    });

    const [, value] = appendSpy.mock.calls[0];
    expect(typeof value).toBe('object');
    expect(value).toEqual({
      uri: '/tmp/avatar.jpg',
      name: 'avatar.jpg',
      type: 'image/jpeg',
    });
    expect(value).not.toBeInstanceOf(Blob);

    appendSpy.mockRestore();
  });
});
