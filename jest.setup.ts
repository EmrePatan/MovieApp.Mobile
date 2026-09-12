jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));

jest.mock('expo-router', () => ({
  useRouter: jest.fn(() => ({ replace: jest.fn() })),
  useSegments: jest.fn(() => []),
  Redirect: 'Redirect',
  Stack: 'Stack',
  Tabs: 'Tabs',
  Link: 'Link',
}));

jest.mock('react', () => {
  const actual = jest.requireActual<typeof import('react')>('react');
  return {
    ...actual,
    useEffect: jest.fn((callback: () => void | (() => void)) => {
      callback();
      return undefined;
    }),
  };
});

export {};
