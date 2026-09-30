import { Platform } from 'react-native';

export type FormDataFileDescriptor = {
  uri: string;
  name: string;
  type: string;
};

/**
 * React Native multipart uploads require a { uri, name, type } part.
 * This is not a web Blob; casting to Blob is only for TypeScript.
 */
export function normalizeUploadFileUri(uri: string): string {
  const trimmed = uri.trim();
  if (!trimmed) {
    return trimmed;
  }

  if (Platform.OS === 'ios') {
    // iOS native multipart expects a filesystem path without the file:// prefix.
    return trimmed.replace(/^file:\/\//, '');
  }

  if (Platform.OS === 'android' && !trimmed.startsWith('file://') && !trimmed.startsWith('content://')) {
    return `file://${trimmed}`;
  }

  return trimmed;
}

export function appendReactNativeFormDataFile(
  formData: FormData,
  fieldName: string,
  file: FormDataFileDescriptor,
): void {
  const part: FormDataFileDescriptor = {
    uri: normalizeUploadFileUri(file.uri),
    name: file.name,
    type: file.type,
  };

  formData.append(fieldName, part as unknown as Blob);
}

export function buildAvatarUploadFormData(file: FormDataFileDescriptor): FormData {
  const formData = new FormData();
  appendReactNativeFormDataFile(formData, 'file', file);
  return formData;
}

export function describeUriScheme(uri: string): string {
  const match = /^([a-z][a-z0-9+.-]*):/i.exec(uri.trim());
  return match?.[1] ?? 'unknown';
}
