import { createContext, useContext, useMemo, type ReactNode } from 'react';

interface DetailScrollLockContextValue {
  setScrollLocked: (locked: boolean) => void;
}

const DetailScrollLockContext = createContext<DetailScrollLockContextValue | null>(null);

interface DetailScrollLockProviderProps {
  onScrollLockChange: (locked: boolean) => void;
  children: ReactNode;
}

export function DetailScrollLockProvider({
  onScrollLockChange,
  children,
}: DetailScrollLockProviderProps) {
  const value = useMemo(
    () => ({ setScrollLocked: onScrollLockChange }),
    [onScrollLockChange],
  );

  return (
    <DetailScrollLockContext.Provider value={value}>
      {children}
    </DetailScrollLockContext.Provider>
  );
}

export function useDetailScrollLock() {
  return useContext(DetailScrollLockContext);
}
