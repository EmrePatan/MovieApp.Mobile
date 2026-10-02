import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { AUTOCOMPLETE_DEBOUNCE_MS } from '@/features/search/types';
import { isValidSearchQuery, normalizeSearchQuery } from '@/features/search/utils/search-query';

interface LibraryHubSearchContextValue {
  searchInput: string;
  setSearchInput: (value: string) => void;
  clearSearch: () => void;
  debouncedSearch: string;
  isSearchActive: boolean;
}

const LibraryHubSearchContext = createContext<LibraryHubSearchContextValue | null>(null);

export function LibraryHubSearchProvider({ children }: { children: ReactNode }) {
  const [searchInput, setSearchInput] = useState('');
  const debouncedSearch = useDebouncedValue(searchInput, AUTOCOMPLETE_DEBOUNCE_MS);
  const normalizedDebouncedSearch = normalizeSearchQuery(debouncedSearch);
  const isSearchActive = isValidSearchQuery(normalizedDebouncedSearch);

  const clearSearch = useCallback(() => {
    setSearchInput('');
  }, []);

  const value = useMemo(
    () => ({
      searchInput,
      setSearchInput,
      clearSearch,
      debouncedSearch: normalizedDebouncedSearch,
      isSearchActive,
    }),
    [clearSearch, isSearchActive, normalizedDebouncedSearch, searchInput],
  );

  return (
    <LibraryHubSearchContext.Provider value={value}>
      {children}
    </LibraryHubSearchContext.Provider>
  );
}

export function useLibraryHubSearch(): LibraryHubSearchContextValue {
  const context = useContext(LibraryHubSearchContext);
  if (!context) {
    throw new Error('useLibraryHubSearch must be used within LibraryHubSearchProvider');
  }

  return context;
}

export function useOptionalLibraryHubSearch(): LibraryHubSearchContextValue | null {
  return useContext(LibraryHubSearchContext);
}
