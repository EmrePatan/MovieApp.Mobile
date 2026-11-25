import { createContext, useContext, type ReactNode } from 'react';
import { Animated, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { premiumSheetChrome } from '@/theme/premium-sheet';
import { useSheetSwipeDismiss } from './useSheetSwipeDismiss';

type DragHandlers = ReturnType<typeof useSheetSwipeDismiss>['dragHandlers'];

const DragContext = createContext<DragHandlers | null>(null);

interface SwipeSheetProps {
  onClose: () => void;
  style?: StyleProp<ViewStyle>;
  /** Pad the bottom by the home-indicator inset (what `SafeAreaView edges={['bottom']}` does). */
  bottomInset?: boolean;
  testID?: string;
  children: ReactNode;
}

/**
 * Container for a hand-built bottom sheet that can be dragged down to dismiss. It replaces the
 * sheet's own `View` / `SafeAreaView` (the sheet's styles go in `style`, so percentage heights
 * keep resolving against the overlay). Put a `SheetHandle` inside as the grab area; the rest of
 * the sheet keeps its own gestures, so inner lists still scroll.
 */
export function SwipeSheet({ onClose, style, bottomInset = false, testID, children }: SwipeSheetProps) {
  const swipe = useSheetSwipeDismiss(onClose);
  const insets = useSafeAreaInsets();
  const flat = StyleSheet.flatten(style) ?? {};
  const basePadding = flat.paddingBottom ?? flat.paddingVertical ?? flat.padding ?? 0;
  const insetStyle =
    bottomInset && typeof basePadding === 'number'
      ? { paddingBottom: basePadding + insets.bottom }
      : null;

  return (
    <DragContext.Provider value={swipe.dragHandlers}>
      <Animated.View style={[style, insetStyle, swipe.sheetStyle]} testID={testID}>
        {children}
      </Animated.View>
    </DragContext.Provider>
  );
}

/** The sheet's grab handle. Drags the surrounding `SwipeSheet` down; a plain handle without one. */
export function SheetHandle() {
  const handlers = useContext(DragContext);
  return (
    <View {...(handlers ?? {})} style={styles.zone} testID="sheet-drag-handle">
      <View style={premiumSheetChrome.handle} />
    </View>
  );
}

const styles = StyleSheet.create({
  // Taller touch target than the 5px pill, stretched across the sheet's width.
  zone: {
    alignSelf: 'stretch',
    alignItems: 'center',
    paddingTop: 12,
    marginTop: -12,
  },
});
