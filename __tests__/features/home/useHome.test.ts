import { homeQueryKey } from '@/features/home/hooks/useHome';

describe('home query key', () => {
  it('includes type and sectionSize', () => {
    expect(homeQueryKey('all', 10)).toEqual(['home', 'all', 10]);
    expect(homeQueryKey('movie', 10)).toEqual(['home', 'movie', 10]);
    expect(homeQueryKey('tv', 10)).toEqual(['home', 'tv', 10]);
  });
});
