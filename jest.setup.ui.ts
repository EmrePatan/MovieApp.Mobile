import mockReact from 'react';

jest.mock('react-native-gesture-handler', () => {
  const mockReact = require('react');
  const { View, Pressable } = require('react-native');

  const createMockPanGesture = () => {
    const gesture = {
      activeOffsetY: jest.fn(() => gesture),
      failOffsetX: jest.fn(() => gesture),
      onUpdate: jest.fn(() => gesture),
      onEnd: jest.fn(() => gesture),
    };

    return gesture;
  };

  const Swipeable = ({
    children,
    renderRightActions,
    containerStyle,
    childrenContainerStyle,
  }: {
    children: mockReact.ReactNode;
    renderRightActions?: () => mockReact.ReactNode;
    containerStyle?: object;
    childrenContainerStyle?: object;
  }) => {
    const [isOpen, setIsOpen] = mockReact.useState(false);

    return mockReact.createElement(
      View,
      { style: containerStyle, testID: 'notification-swipeable' },
      mockReact.createElement(
        Pressable,
        {
          testID: 'swipeable-open-trigger',
          accessibilityRole: 'button',
          accessibilityLabel: 'Reveal delete action',
          onPress: () => setIsOpen(true),
        },
        null,
      ),
      mockReact.createElement(View, { style: childrenContainerStyle }, children),
      isOpen
        ? mockReact.createElement(
            View,
            { testID: 'swipeable-right-actions' },
            renderRightActions?.(),
          )
        : null,
    );
  };

  return {
    GestureHandlerRootView: View,
    GestureDetector: View,
    Gesture: {
      Pan: jest.fn(() => createMockPanGesture()),
      Native: jest.fn(() => createMockPanGesture()),
    },
    Swipeable,
  };
});

jest.mock('react-native-reanimated', () => {
  const { View } = require('react-native');

  return {
    __esModule: true,
    default: {
      View,
      createAnimatedComponent: (component: unknown) => component,
    },
    useSharedValue: (initialValue: unknown) => ({ value: initialValue }),
    useAnimatedStyle: (updater: () => object) => updater(),
    withSpring: (value: unknown) => value,
    withTiming: (value: unknown) => value,
    runOnJS: (fn: (...args: unknown[]) => unknown) => fn,
    Easing: {
      out: () => ({}),
      cubic: {},
    },
  };
});

jest.mock('@/features/gallery/api/gallery-api', () => ({
  getMovieGallery: jest.fn().mockResolvedValue({ backdrops: [], posters: [] }),
  getTvShowGallery: jest.fn().mockResolvedValue({ backdrops: [], posters: [] }),
  getPersonGallery: jest.fn().mockResolvedValue({ profiles: [] }),
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

jest.mock('@/features/metrics/use-track-product-metric-on-focus', () => ({
  useTrackProductMetricOnFocus: jest.fn(),
}));

