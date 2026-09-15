import mockReact from 'react';

jest.mock('react-native-gesture-handler', () => {
  const { View } = require('react-native');

  const createMockPanGesture = () => {
    const gesture = {
      activeOffsetY: jest.fn(() => gesture),
      failOffsetX: jest.fn(() => gesture),
      onUpdate: jest.fn(() => gesture),
      onEnd: jest.fn(() => gesture),
    };

    return gesture;
  };

  return {
    GestureHandlerRootView: View,
    GestureDetector: View,
    Gesture: {
      Pan: jest.fn(() => createMockPanGesture()),
    },
  };
});

jest.mock('react-native-reanimated', () => ({
  runOnJS: (fn: (...args: unknown[]) => unknown) => fn,
}));

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
