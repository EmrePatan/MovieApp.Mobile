import mockReact from 'react';

jest.mock('react-native-safe-area-context', () => ({
  SafeAreaView: ({
    children,
    ...props
  }: {
    children: mockReact.ReactNode;
  }) => mockReact.createElement('SafeAreaView', props, children),
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

jest.mock('@expo/vector-icons', () => ({
  Ionicons: ({ name, ...props }: { name: string }) =>
    mockReact.createElement('Icon', { ...props, accessibilityLabel: name }),
}));

jest.mock('expo-linear-gradient', () => ({
  LinearGradient: ({
    children,
    ...props
  }: {
    children?: mockReact.ReactNode;
  }) => mockReact.createElement('LinearGradient', props, children),
}));
