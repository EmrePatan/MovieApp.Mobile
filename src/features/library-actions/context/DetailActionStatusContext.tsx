import { createContext, useContext, type ReactNode } from 'react';
import type { CatalogDetailLibraryActionsState } from '../hooks/useCatalogDetailLibraryActions';

const defaultState: CatalogDetailLibraryActionsState = {
  batchPending: false,
  batchFailed: false,
  batchHydrated: false,
  deferIndividualStatusQueries: false,
};

const DetailActionStatusContext = createContext<CatalogDetailLibraryActionsState>(defaultState);

export function DetailActionStatusProvider({
  value,
  children,
}: {
  value: CatalogDetailLibraryActionsState;
  children: ReactNode;
}) {
  return (
    <DetailActionStatusContext.Provider value={value}>{children}</DetailActionStatusContext.Provider>
  );
}

export function useDetailActionStatusBatch(): CatalogDetailLibraryActionsState {
  return useContext(DetailActionStatusContext);
}
