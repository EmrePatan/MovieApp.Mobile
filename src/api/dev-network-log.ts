const isDevBuild = typeof __DEV__ !== 'undefined' && __DEV__;

export function logFetchNetworkFailure(details: {
  method: string;
  url: string;
  bodyIsFormData: boolean;
  error: unknown;
}): void {
  if (!isDevBuild) {
    return;
  }

  const errorName =
    typeof details.error === 'object' &&
    details.error !== null &&
    'name' in details.error &&
    typeof (details.error as { name?: unknown }).name === 'string'
      ? (details.error as { name: string }).name
      : 'unknown';

  const errorMessage =
    typeof details.error === 'object' &&
    details.error !== null &&
    'message' in details.error &&
    typeof (details.error as { message?: unknown }).message === 'string'
      ? (details.error as { message: string }).message
      : String(details.error);

  console.warn('[ApiClient] Native fetch failed before HTTP response', {
    method: details.method,
    url: details.url,
    bodyIsFormData: details.bodyIsFormData,
    errorName,
    errorMessage,
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
  if (!isDevBuild) {
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
