import mockReact from 'react';

jest.mock('react-native-safe-area-context', () => ({
  SafeAreaView: ({
    children,
    ...props
  }: {
    children: mockReact.ReactNode;
  }) => mockReact.createElement('SafeAreaView', props, children),
}));

jest.mock('@expo/vector-icons', () => ({
  Ionicons: ({ name, ...props }: { name: string }) =>
    mockReact.createElement('Icon', { ...props, accessibilityLabel: name }),
}));
