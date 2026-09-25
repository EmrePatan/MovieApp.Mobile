import { shouldRequestNextInfinitePage } from '@/utils/should-request-next-infinite-page';

describe('shouldRequestNextInfinitePage', () => {
  it('requests the next page when more pages exist and none is in flight', () => {
    expect(
      shouldRequestNextInfinitePage({
        hasNextPage: true,
        isFetchingNextPage: false,
      }),
    ).toBe(true);
  });

  it('does not start another page while the next page is already loading', () => {
    expect(
      shouldRequestNextInfinitePage({
        hasNextPage: true,
        isFetchingNextPage: true,
      }),
    ).toBe(false);
  });

  it('does not request a page after the list is exhausted', () => {
    expect(
      shouldRequestNextInfinitePage({
        hasNextPage: false,
        isFetchingNextPage: false,
      }),
    ).toBe(false);
  });
});
