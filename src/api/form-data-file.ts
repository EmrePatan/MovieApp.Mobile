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

/**
 * Multipart part for Expo winter fetch: plain metadata + bytes() backed by expo-file-system File.
 * Not a legacy React Native `{ uri, name, type }` descriptor.
 */
export type AvatarMultipartUploadPart = {
  name: string;
  type: string;
  bytes: () => ReturnType<File['bytes']>;
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

export function createAvatarMultipartUploadPart(descriptor: FormDataFileDescriptor): {
  fileExists: boolean;
  uploadPart: AvatarMultipartUploadPart;
} {
  const sourceFile = new File(normalizeFileUriForExpoFile(descriptor.uri));

  if (!sourceFile.exists) {
    throw new Error('Avatar image file is not available.');
  }

  const uploadPart: AvatarMultipartUploadPart = {
    name: descriptor.name,
    type: descriptor.type,
    bytes: () => sourceFile.bytes(),
  };

  return {
    fileExists: sourceFile.exists,
    uploadPart,
  };
}

/**
 * Expo's patched FormData.append stores objects with bytes(); DOM typings only list Blob/string.
 */
function appendAvatarMultipartPart(
  formData: FormData,
  fieldName: string,
  part: AvatarMultipartUploadPart,
): void {
  formData.append(fieldName, part as unknown as Blob);
}

export function buildAvatarUploadFormData(file: FormDataFileDescriptor): FormData {
  const { fileExists, uploadPart } = createAvatarMultipartUploadPart(file);

  logAvatarUploadFormDataPart({
    sourceUriScheme: describeUriScheme(file.uri),
    fileName: file.name,
    mimeType: file.type,
    partKind: 'AvatarMultipartUploadPart',
    partFileName: file.name,
    partMimeType: file.type,
    fileExists,
  });

  logAvatarUploadBeforeFormDataConstruction({
    partKind: 'AvatarMultipartUploadPart',
    partFileName: file.name,
    partMimeType: file.type,
    fileExists,
  });

  const formData = new FormData();
  logAvatarUploadFormDataCreated();

  const partDiagnostics = describeUploadPartForDiagnostics(uploadPart);
  logAvatarUploadAppendingFilePart({
    fieldName: 'file',
    multipartFileName: file.name,
    ...partDiagnostics,
    partFileName: file.name,
    partMimeType: file.type,
  });

  try {
    appendAvatarMultipartPart(formData, 'file', uploadPart);
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
