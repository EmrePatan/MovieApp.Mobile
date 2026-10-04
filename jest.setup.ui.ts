import mockReact from 'react';

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

jest.mock('expo-image-manipulator', () => ({
  manipulateAsync: jest.fn(async (uri: string) => ({ uri, width: 1, height: 1 })),
  SaveFormat: { JPEG: 'jpeg', PNG: 'png', WEBP: 'webp' },
  FlipType: { Horizontal: 'horizontal', Vertical: 'vertical' },
}));

jest.mock('expo-image-picker', () => ({
  launchImageLibraryAsync: jest.fn(),
  launchCameraAsync: jest.fn(),
  requestMediaLibraryPermissionsAsync: jest.fn(async () => ({ granted: true })),
  requestCameraPermissionsAsync: jest.fn(async () => ({ granted: true })),
  MediaTypeOptions: { Images: 'Images' },
}));

jest.mock('expo-file-system', () => ({
  File: class MockFile {},
  Paths: { cache: 'cache', document: 'document' },
}));

jest.mock('expo-image', () => {
  const React = require('react');
  const { Image } = require('react-native');

  const ExpoImage = React.forwardRef((props: Record<string, unknown>, ref: unknown) =>
    React.createElement(Image, {
      ...props,
      ref,
      resizeMode: props.resizeMode ?? props.contentFit,
    }),
  );
  ExpoImage.displayName = 'ExpoImage';
  ExpoImage.prefetch = jest.fn(async () => true);
  ExpoImage.clearMemoryCache = jest.fn(async () => true);
  ExpoImage.clearDiskCache = jest.fn(async () => true);
  ExpoImage.getCachePathAsync = jest.fn(async () => null);

  return { Image: ExpoImage };
});

jest.mock('react-native-gesture-handler', () => {
  const mockReact = require('react');
  const { View, Pressable } = require('react-native');

  const createMockGesture = () => {
    const gesture = {
      activeOffsetY: jest.fn(() => gesture),
      failOffsetX: jest.fn(() => gesture),
      manualActivation: jest.fn(() => gesture),
      onTouchesMove: jest.fn(() => gesture),
      onStart: jest.fn(() => gesture),
      onUpdate: jest.fn(() => gesture),
      onEnd: jest.fn(() => gesture),
      onFinalize: jest.fn(() => gesture),
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
      Pan: jest.fn(() => createMockGesture()),
      Pinch: jest.fn(() => createMockGesture()),
      Native: jest.fn(() => createMockGesture()),
      Simultaneous: jest.fn((...gestures: unknown[]) => gestures[0] ?? createMockGesture()),
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
    useAnimatedScrollHandler: (handler: {
      onScroll?: (event: { contentOffset: { y: number } }) => void;
    }) => (event?: { nativeEvent?: { contentOffset?: { y: number } } }) => {
      handler.onScroll?.({
        contentOffset: { y: event?.nativeEvent?.contentOffset?.y ?? 0 },
      });
    },
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

jest.mock('react-native-webview', () => {
  const mockReact = require('react');
  const { View } = require('react-native');

  return {
    WebView: () => mockReact.createElement(View, { testID: 'inline-trailer-webview' }),
  };
});

