import { queryClient } from '@/api/query-client';
import { ApiError } from '@/api/errors';

function shouldRetryQuery(failureCount: number, error: unknown): boolean {
  const retry = queryClient.getDefaultOptions().queries?.retry;
  if (typeof retry === 'function') {
    return retry(failureCount, error);
  }

  if (typeof retry === 'boolean') {
    return retry;
  }

  if (typeof retry === 'number') {
    return failureCount < retry;
  }

  return failureCount < 3;
}

describe('queryClient default query retry', () => {
  it('does not retry rate_limited ApiError', () => {
    const error = new ApiError({ kind: 'rate_limited', status: 429 });

    expect(shouldRetryQuery(0, error)).toBe(false);
    expect(shouldRetryQuery(1, error)).toBe(false);
  });

  it('still retries retryable server errors up to the existing limit', () => {
    const error = new ApiError({ kind: 'server', status: 500 });

    expect(shouldRetryQuery(0, error)).toBe(true);
    expect(shouldRetryQuery(1, error)).toBe(true);
    expect(shouldRetryQuery(2, error)).toBe(false);
  });
});
