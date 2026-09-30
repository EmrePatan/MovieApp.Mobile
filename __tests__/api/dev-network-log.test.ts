import { ApiError } from '@/api/errors';
import {
  describeUploadPartForDiagnostics,
  logAvatarUploadMutationError,
} from '@/api/dev-network-log';

describe('dev-network-log avatar diagnostics', () => {
  const originalDev = (global as { __DEV__?: boolean }).__DEV__;
  let consoleWarn: jest.SpyInstance;

  beforeEach(() => {
    (global as { __DEV__?: boolean }).__DEV__ = true;
    consoleWarn = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
  });

  afterEach(() => {
    (global as { __DEV__?: boolean }).__DEV__ = originalDev;
    consoleWarn.mockRestore();
  });

  it('describes upload part diagnostics without filesystem paths', () => {
    const part = new Blob(['x'], { type: 'image/jpeg' });

    const diagnostics = describeUploadPartForDiagnostics(part);

    expect(diagnostics.isBlob).toBe(true);
    expect(diagnostics.partKind).toBe('Blob');
    expect(diagnostics.hasBytesMethod).toBe(typeof Blob.prototype.bytes === 'function');
  });

  it('logs raw mutation errors with ApiError metadata when applicable', () => {
    const apiError = new ApiError({ kind: 'network' });

    logAvatarUploadMutationError(apiError);

    expect(consoleWarn).toHaveBeenCalledWith(
      '[AvatarUpload] Mutation failed with raw error',
      expect.objectContaining({
        isApiError: true,
        apiErrorKind: 'network',
        errorName: 'ApiError',
      }),
    );
  });

  it('logs non-ApiError mutation failures', () => {
    const error = new TypeError('FormData append failed');

    logAvatarUploadMutationError(error);

    expect(consoleWarn).toHaveBeenCalledWith(
      '[AvatarUpload] Mutation failed with raw error',
      expect.objectContaining({
        isApiError: false,
        errorName: 'TypeError',
        errorMessage: 'FormData append failed',
      }),
    );
  });
});
