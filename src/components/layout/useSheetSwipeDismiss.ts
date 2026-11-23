import { useEffect, useRef, useState } from 'react';
import { Animated, PanResponder, Platform } from 'react-native';

const DISMISS_DISTANCE = 90;
const DISMISS_VELOCITY = 0.9;
const OFFSCREEN = 800;

/**
 * Drag-down-to-dismiss for bottom sheets. Spread `dragHandlers` on the sheet's grab area (the
 * handle and title) and apply `sheetStyle` to an Animated.View wrapping the sheet. Only the grab
 * area claims the gesture, so scrolling lists inside the sheet are never hijacked.
 */
export function useSheetSwipeDismiss(onClose: () => void) {
  const [translateY] = useState(() => new Animated.Value(0));
  const closeRef = useRef(onClose);
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [responder] = useState(() => {
    const useNativeDriver = Platform.OS !== 'web';
    const springBack = () =>
      Animated.spring(translateY, { toValue: 0, useNativeDriver, bounciness: 4 }).start();

    return PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, g) =>
        Math.abs(g.dy) > 4 && Math.abs(g.dy) > Math.abs(g.dx),
      onPanResponderMove: (_, g) => translateY.setValue(Math.max(0, g.dy)),
      onPanResponderRelease: (_, g) => {
        if (g.dy > DISMISS_DISTANCE || g.vy > DISMISS_VELOCITY) {
          Animated.timing(translateY, { toValue: OFFSCREEN, duration: 160, useNativeDriver }).start(
            () => {
              closeRef.current();
              // The Modal keeps its own slide-out; put the sheet back once it is gone.
              resetTimer.current = setTimeout(() => translateY.setValue(0), 450);
            },
          );
        } else {
          springBack();
        }
      },
      onPanResponderTerminate: springBack,
    });
  });

  // Keep the latest onClose without recreating the responder.
  useEffect(() => {
    closeRef.current = onClose;
  }, [onClose]);

  useEffect(
    () => () => {
      if (resetTimer.current) clearTimeout(resetTimer.current);
    },
    [],
  );

  return {
    sheetStyle: { transform: [{ translateY }] },
    dragHandlers: responder.panHandlers,
  };
}
