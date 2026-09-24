import {
  pickStreamingHubProviders,
  sortStreamingHubProviders,
} from '@/features/discovery/streaming-platform-hub-types';
import { getIsoWeekId } from '@/features/discovery/utils/iso-week-id';
import type { DiscoveryWatchProvider } from '@/features/discovery/watch-provider-types';

function provider(
  id: number,
  displayPriority: number,
  name = `Provider ${id}`,
): DiscoveryWatchProvider {
  return {
    providerId: id,
    name,
    logoPath: '/logo.png',
    displayPriority,
  };
}

describe('sortStreamingHubProviders', () => {
  it('ranks Netflix, Prime, and Disney+ ahead of regional display priority', () => {
    const input = [
      provider(337, 1, 'Disney+'),
      provider(8, 50, 'Netflix'),
      provider(119, 40, 'Prime Video'),
      provider(999, 2, 'Other'),
    ];

    expect(sortStreamingHubProviders(input).map((p) => p.providerId)).toEqual([
      8,
      119,
      337,
      999,
    ]);
  });

  it('falls back to display priority for providers outside the global head', () => {
    const input = [provider(103, 30), provider(101, 10), provider(102, 20)];

    expect(sortStreamingHubProviders(input).map((p) => p.providerId)).toEqual([101, 102, 103]);
  });
});

describe('pickStreamingHubProviders', () => {
  it('returns up to eight providers after popularity sort', () => {
    const input = [
      provider(103, 30),
      provider(101, 10),
      provider(102, 20),
      provider(104, 40),
      provider(105, 50),
      provider(106, 60),
      provider(107, 70),
      provider(8, 80, 'Netflix'),
      provider(108, 90),
    ];

    const picked = pickStreamingHubProviders(input);

    expect(picked.map((p) => p.providerId)).toEqual([8, 101, 102, 103, 104, 105, 106, 107]);
  });
});

describe('getIsoWeekId', () => {
  it('returns a stable week label', () => {
    expect(getIsoWeekId(new Date('2026-09-24T12:00:00Z'))).toMatch(/^\d{4}-W\d+$/);
  });
});
