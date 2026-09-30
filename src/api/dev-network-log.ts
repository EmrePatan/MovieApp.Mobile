import { ApiError, isApiError } from './errors';

function isDevBuild(): boolean {
  return typeof __DEV__ !== 'undefined' && __DEV__;
}

function readErrorName(error: unknown): string {
  if (
    typeof error === 'object' &&
    error !== null &&
    'name' in error &&
    typeof (error as { name?: unknown }).name === 'string'
  ) {
    return (error as { name: string }).name;
  }

  return 'unknown';
}

function readErrorMessage(error: unknown): string {
  if (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as { message?: unknown }).message === 'string'
  ) {
    return (error as { message: string }).message;
  }

  return String(error);
}

function readErrorStack(error: unknown): string | undefined {
  if (
    typeof error === 'object' &&
    error !== null &&
    'stack' in error &&
    typeof (error as { stack?: unknown }).stack === 'string'
  ) {
    return (error as { stack: string }).stack;
  }

  return undefined;
}

export function describeUploadPartForDiagnostics(part: unknown): {
  partKind: string;
  partFileName: string | undefined;
  partMimeType: string | undefined;
  hasBytesMethod: boolean;
  isBlob: boolean;
} {
  const partKind =
    typeof part === 'object' && part !== null && 'constructor' in part
      ? ((part as { constructor?: { name?: string } }).constructor?.name ?? 'unknown')
      : typeof part;

  const record = typeof part === 'object' && part !== null ? (part as Record<string, unknown>) : null;

  return {
    partKind,
    partFileName: typeof record?.name === 'string' ? record.name : undefined,
    partMimeType: typeof record?.type === 'string' ? record.type : undefined,
    hasBytesMethod: typeof record?.bytes === 'function',
    isBlob: typeof Blob !== 'undefined' && part instanceof Blob,
  };
}

export function logFetchNetworkFailure(details: {
  method: string;
  url: string;
  bodyIsFormData: boolean;
  error: unknown;
}): void {
  if (!isDevBuild()) {
    return;
  }

  console.warn('[ApiClient] Native fetch failed before HTTP response', {
    method: details.method,
    url: details.url,
    bodyIsFormData: details.bodyIsFormData,
    errorName: readErrorName(details.error),
    errorMessage: readErrorMessage(details.error),
  });
}

export function logAvatarUploadFormDataPart(details: {
  sourceUriScheme: string;
  fileName: string;
  mimeType: string;
  partKind: string;
  partFileName: string;
  partMimeType: string;
  fileExists: boolean;
}): void {
  if (!isDevBuild()) {
    return;
  }

  console.info('[AvatarUpload] Starting multipart upload', {
    uriScheme: details.sourceUriScheme,
    fileName: details.fileName,
    mimeType: details.mimeType,
    partKind: details.partKind,
    partFileName: details.partFileName,
    partMimeType: details.partMimeType,
    fileExists: details.fileExists,
  });
}

export function logAvatarUploadBeforeFormDataConstruction(details: {
  partKind: string;
  partFileName: string;
  partMimeType: string;
  fileExists: boolean;
}): void {
  if (!isDevBuild()) {
    return;
  }

  console.info('[AvatarUpload] Before FormData construction', details);
}

export function logAvatarUploadFormDataCreated(): void {
  if (!isDevBuild()) {
    return;
  }

  console.info('[AvatarUpload] FormData created');
}

export function logAvatarUploadAppendingFilePart(details: {
  fieldName: string;
  multipartFileName: string;
  partKind: string;
  partFileName: string | undefined;
  partMimeType: string | undefined;
  hasBytesMethod: boolean;
  isBlob: boolean;
}): void {
  if (!isDevBuild()) {
    return;
  }

  console.info('[AvatarUpload] Appending File part', details);
}

export function logAvatarUploadFilePartAppended(): void {
  if (!isDevBuild()) {
    return;
  }

  console.info('[AvatarUpload] File part appended');
}

export function logAvatarUploadFormDataAppendFailed(error: unknown, part: unknown): void {
  if (!isDevBuild()) {
    return;
  }

  const partDiagnostics = describeUploadPartForDiagnostics(part);

  console.warn('[AvatarUpload] FormData append failed', {
    errorName: readErrorName(error),
    errorMessage: readErrorMessage(error),
    ...partDiagnostics,
  });
}

export function logAvatarUploadCallingApiClient(path: string): void {
  if (!isDevBuild()) {
    return;
  }

  console.info('[AvatarUpload] Calling ApiClient', { path });
}

export function logApiClientAvatarRequestEntered(details: {
  method: string;
  path: string;
  bodyIsFormData: boolean;
}): void {
  if (!isDevBuild()) {
    return;
  }

  console.info('[ApiClient] Request entered', details);
}

export function logApiClientAvatarCallingFetch(details: {
  method: string;
  path: string;
}): void {
  if (!isDevBuild()) {
    return;
  }

  console.info('[ApiClient] Calling fetch', details);
}

export function logApiClientAvatarResponseReceived(details: {
  method: string;
  path: string;
  status: number;
  ok: boolean;
}): void {
  if (!isDevBuild()) {
    return;
  }

  console.info('[ApiClient] Response received', details);
}

export function logAvatarUploadMutationError(error: unknown): void {
  if (!isDevBuild()) {
    return;
  }

  const payload: Record<string, unknown> = {
    errorType: typeof error,
    errorConstructor:
      typeof error === 'object' && error !== null && 'constructor' in error
        ? (error as { constructor?: { name?: string } }).constructor?.name ?? 'unknown'
        : typeof error,
    errorName: readErrorName(error),
    errorMessage: readErrorMessage(error),
    isApiError: isApiError(error),
  };

  const stack = readErrorStack(error);
  if (stack) {
    payload.errorStack = stack;
  }

  if (error instanceof ApiError) {
    payload.apiErrorKind = error.kind;
    payload.apiErrorStatus = error.status;
  }

  console.warn('[AvatarUpload] Mutation failed with raw error', payload);
}
