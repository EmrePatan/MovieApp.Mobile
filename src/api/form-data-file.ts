import { File } from 'expo-file-system';
import { Platform } from 'react-native';

import {
  describeUploadPartForDiagnostics,
  logAvatarUploadAppendingFilePart,
  logAvatarUploadBeforeFormDataConstruction,
  logAvatarUploadFilePartAppended,
  logAvatarUploadFormDataAppendFailed,
  logAvatarUploadFormDataCreated,
  logAvatarUploadFormDataPart,
} from './dev-network-log';

export type FormDataFileDescriptor = {
  uri: string;
  name: string;
  type: string;
};

function normalizeFileUriForExpoFile(uri: string): string {
  const trimmed = uri.trim();
  if (!trimmed) {
    return trimmed;
  }

  if (
    Platform.OS === 'android' &&
    !trimmed.startsWith('file://') &&
    !trimmed.startsWith('content://')
  ) {
    return `file://${trimmed}`;
  }

  return trimmed;
}

function ensureUploadFilename(file: File, desiredName: string): File {
  if (file.name === desiredName) {
    return file;
  }

  file.rename(desiredName);
  return file;
}

/** @internal Exported for regression tests against legacy RN multipart descriptors. */
export function isLegacyReactNativeFormDataFilePart(value: unknown): boolean {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.uri === 'string' &&
    typeof candidate.name === 'string' &&
    typeof candidate.type === 'string'
  );
}

/**
 * Mirrors Expo winter fetch multipart conversion: legacy `{ uri, name, type }` parts throw
 * "Unsupported FormDataPart implementation" on native before any HTTP request is sent.
 */
export function assertExpoSupportedFormDataPart(entry: unknown): void {
  if (typeof entry === 'string') {
    return;
  }

  if (entry instanceof Blob) {
    return;
  }

  if (typeof entry === 'object' && entry !== null && 'bytes' in entry) {
    return;
  }

  if (isLegacyReactNativeFormDataFilePart(entry)) {
    throw new Error('Unsupported FormDataPart implementation');
  }

  throw new Error('Unsupported FormDataPart implementation');
}

export function createAvatarUploadFilePart(descriptor: FormDataFileDescriptor): File {
  const uploadFile = new File(normalizeFileUriForExpoFile(descriptor.uri));

  if (!uploadFile.exists) {
    throw new Error('Avatar image file is not available.');
  }

  return ensureUploadFilename(uploadFile, descriptor.name);
}

export function buildAvatarUploadFormData(file: FormDataFileDescriptor): FormData {
  const uploadPart = createAvatarUploadFilePart(file);

  logAvatarUploadFormDataPart({
    sourceUriScheme: describeUriScheme(file.uri),
    fileName: file.name,
    mimeType: file.type,
    partKind: uploadPart.constructor.name,
    partFileName: uploadPart.name,
    partMimeType: uploadPart.type,
    fileExists: uploadPart.exists,
  });

  logAvatarUploadBeforeFormDataConstruction({
    partKind: uploadPart.constructor.name,
    partFileName: uploadPart.name,
    partMimeType: uploadPart.type,
    fileExists: uploadPart.exists,
  });

  const formData = new FormData();
  logAvatarUploadFormDataCreated();

  const partDiagnostics = describeUploadPartForDiagnostics(uploadPart);
  logAvatarUploadAppendingFilePart({
    fieldName: 'file',
    multipartFileName: file.name,
    ...partDiagnostics,
    partFileName: partDiagnostics.partFileName ?? uploadPart.name,
    partMimeType: partDiagnostics.partMimeType ?? uploadPart.type,
  });

  try {
    formData.append('file', uploadPart, file.name);
  } catch (error) {
    logAvatarUploadFormDataAppendFailed(error, uploadPart);
    throw error;
  }

  logAvatarUploadFilePartAppended();
  return formData;
}

export function describeUriScheme(uri: string): string {
  const match = /^([a-z][a-z0-9+.-]*):/i.exec(uri.trim());
  return match?.[1] ?? 'unknown';
}
