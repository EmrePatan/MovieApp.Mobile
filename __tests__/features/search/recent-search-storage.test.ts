import * as SecureStore from 'expo-secure-store';
import {
  addRecentQuery,
  clearRecentSearches,
  loadRecentSearches,
  removeRecentSearchItem,
} from '@/features/search/recent-searches/recent-search-storage';
import { buildRecentSearchStorageKey } from '@/features/search/recent-searches/recent-search-logic';

jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));

describe('recent-search-storage', () => {
  const store = new Map<string, string>();

  beforeEach(() => {
    store.clear();
    jest.clearAllMocks();

    (SecureStore.getItemAsync as jest.Mock).mockImplementation(async (key: string) => {
      return store.get(key) ?? null;
    });

    (SecureStore.setItemAsync as jest.Mock).mockImplementation(async (key: string, value: string) => {
      store.set(key, value);
    });
  });

  it('keeps guest and user namespaces separate', async () => {
    await addRecentQuery(null, 'guest-query');
    await addRecentQuery('user-a', 'user-query');

    const guestItems = await loadRecentSearches(null);
    const userItems = await loadRecentSearches('user-a');

    expect(guestItems).toHaveLength(1);
    expect(guestItems[0].query).toBe('guest-query');

    expect(userItems).toHaveLength(1);
    expect(userItems[0].query).toBe('user-query');
  });

  it('removes and clears within the active namespace', async () => {
    const afterAdd = await addRecentQuery(null, 'one');
    const id = afterAdd[0].id;

    const afterRemove = await removeRecentSearchItem(null, id);
    expect(afterRemove).toHaveLength(0);

    await addRecentQuery(null, 'two');

    const cleared = await clearRecentSearches(null);
    expect(cleared).toHaveLength(0);
    expect(store.get(buildRecentSearchStorageKey('guest'))).toBe('[]');
  });

  it('treats corrupt storage as empty on load', async () => {
    store.set(buildRecentSearchStorageKey('guest'), '{broken');
    const items = await loadRecentSearches(null);
    expect(items).toEqual([]);
  });
});
