import React, { useEffect } from 'react';
import { act, render } from '@testing-library/react-native';
import { Animated, Button, View } from 'react-native';
import { useImageViewerDismissGesture } from '@/features/gallery/hooks/useImageViewerDismissGesture';

function DismissGestureHarness({
  height,
  onClose,
  onReady,
}: {
  height: number;
  onClose: () => void;
  onReady: (controls: {
    closeViewer: () => void;
    resetDismissState: () => void;
    translateY: Animated.Value;
    backdropOpacity: Animated.Value;
  }) => void;
}) {
  const { closeViewer, resetDismissState, animatedStyle } = useImageViewerDismissGesture({
    height,
    onClose,
  });

  useEffect(() => {
    onReady({
      closeViewer,
      resetDismissState,
      translateY: animatedStyle.transform[0].translateY as Animated.Value,
      backdropOpacity: animatedStyle.opacity,
    });
  }, [animatedStyle.opacity, animatedStyle.transform, closeViewer, onReady, resetDismissState]);

  return (
    <View>
      <Button title="close" onPress={closeViewer} />
    </View>
  );
}

describe('useImageViewerDismissGesture dismiss lifecycle', () => {
  const originalTiming = Animated.timing;
  const originalParallel = Animated.parallel;

  beforeEach(() => {
    jest.spyOn(Animated, 'timing').mockImplementation((value, config) =>
      originalTiming(value, {
        ...config,
        duration: 0,
        useNativeDriver: false,
      }),
    );

    jest.spyOn(Animated, 'parallel').mockImplementation((animations) =>
      originalParallel(animations),
    );
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('invokes onClose exactly once and keeps the dismissed frame until unmount', async () => {
    const onClose = jest.fn();
    let controls: {
      closeViewer: () => void;
      resetDismissState: () => void;
      translateY: Animated.Value;
      backdropOpacity: Animated.Value;
    } | null = null;

    render(
      <DismissGestureHarness
        height={800}
        onClose={onClose}
        onReady={(nextControls) => {
          controls = nextControls;
        }}
      />,
    );

    await act(async () => {
      controls?.closeViewer();
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(onClose).toHaveBeenCalledTimes(1);
    expect(controls?.translateY.__getValue()).toBe(800);
    expect(controls?.backdropOpacity.__getValue()).toBe(0);

    await act(async () => {
      controls?.closeViewer();
    });

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('resets animated state only when reopening via resetDismissState', async () => {
    const onClose = jest.fn();
    let controls: {
      closeViewer: () => void;
      resetDismissState: () => void;
      translateY: Animated.Value;
      backdropOpacity: Animated.Value;
    } | null = null;

    render(
      <DismissGestureHarness
        height={800}
        onClose={onClose}
        onReady={(nextControls) => {
          controls = nextControls;
        }}
      />,
    );

    await act(async () => {
      controls?.closeViewer();
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    act(() => {
      controls?.resetDismissState();
    });

    expect(controls?.translateY.__getValue()).toBe(0);
    expect(controls?.backdropOpacity.__getValue()).toBe(1);
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
