import { useMemo, useRef, useState } from 'react';
import {
  AccessibilityActionEvent,
  LayoutChangeEvent,
  StyleSheet,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  MIN_STAR_RATING,
  RATING_STAR_GAP,
  RATING_STAR_VISUAL_SIZE,
  STAR_COUNT,
  formatStarRatingAccessibilityValue,
  getRatingStarClusterWidth,
  getRatingTouchTrackWidth,
  getStarFillState,
  stepStarRating,
  type StarFillState,
} from '../utils/star-rating';
import { createRatingPanResponder } from '../utils/create-rating-pan-responder';
import { colors } from '@/theme/colors';
import { interaction } from '@/theme/interaction';

export const STAR_VISUAL_SIZE = RATING_STAR_VISUAL_SIZE;
const STAR_GAP = RATING_STAR_GAP;
const STAR_CLUSTER_WIDTH = getRatingStarClusterWidth();
const TOUCH_TRACK_WIDTH = getRatingTouchTrackWidth();
const TRACK_MIN_HEIGHT = 44;
const EMPTY_STAR_COLOR = 'rgba(107, 107, 128, 0.45)';

interface StarRatingSelectorProps {
  value: number | null;
  disabled?: boolean;
  onGestureStart?: () => boolean;
  onInteractionActiveChange?: (active: boolean) => void;
  onCommit: (starRating: number) => void;
  onClear: () => void;
}

function StarGlyph({ fill, size }: { fill: StarFillState; size: number }) {
  const outlineColor = fill === 'empty' ? EMPTY_STAR_COLOR : colors.accent;

  return (
    <View style={[styles.starGlyph, { width: size, height: size }]}>
      <Ionicons name="star-outline" size={size} color={outlineColor} />
      {fill !== 'empty' ? (
        <View
          style={[
            styles.starFillClip,
            {
              width: fill === 'half' ? size / 2 : size,
              height: size,
            },
          ]}
        >
          <Ionicons name="star" size={size} color={colors.accent} />
        </View>
      ) : null}
    </View>
  );
}

export function StarRatingSelector({
  value,
  disabled = false,
  onGestureStart,
  onInteractionActiveChange,
  onCommit,
  onClear,
}: StarRatingSelectorProps) {
  const trackWidthRef = useRef(0);
  const disabledRef = useRef(disabled);
  const valueRef = useRef(value);
  const onCommitRef = useRef(onCommit);
  const onClearRef = useRef(onClear);
  const onGestureStartRef = useRef(onGestureStart);
  const onInteractionActiveChangeRef = useRef(onInteractionActiveChange);
  const [previewRating, setPreviewRating] = useState<number | 'clear' | null>(null);

  disabledRef.current = disabled;
  valueRef.current = value;
  onCommitRef.current = onCommit;
  onClearRef.current = onClear;
  onGestureStartRef.current = onGestureStart;
  onInteractionActiveChangeRef.current = onInteractionActiveChange;

  const displayRating = previewRating === 'clear' ? null : previewRating ?? value;

  const { panHandlers, touchHandlers } = useMemo(
    () =>
      createRatingPanResponder({
        getDisabled: () => disabledRef.current,
        getHasRating: () => valueRef.current != null,
        getTrackWidth: () => trackWidthRef.current,
        getStarClusterWidth: () => STAR_CLUSTER_WIDTH,
        onGestureStart: () => onGestureStartRef.current?.() ?? true,
        onPreviewChange: setPreviewRating,
        onCommit: (rating) => onCommitRef.current(rating),
        onClear: () => onClearRef.current(),
        onInteractionActiveChange: (active) =>
          onInteractionActiveChangeRef.current?.(active),
      }),
    [],
  );

  const handleLayout = (event: LayoutChangeEvent) => {
    trackWidthRef.current = event.nativeEvent.layout.width;
  };

  const handleAccessibilityAction = (event: AccessibilityActionEvent) => {
    if (disabled) {
      return;
    }

    if (onGestureStart && !onGestureStart()) {
      return;
    }

    const action = event.nativeEvent.actionName;

    if (action === 'increment') {
      const next = value == null ? 0.5 : stepStarRating(value, 0.5);
      onCommit(next);
      return;
    }

    if (action === 'decrement' && value != null) {
      if (value <= MIN_STAR_RATING) {
        onClear();
        return;
      }

      onCommit(stepStarRating(value, -0.5));
    }
  };

  return (
    <View
      accessible
      accessibilityRole="adjustable"
      accessibilityLabel="Your rating"
      accessibilityValue={{ text: formatStarRatingAccessibilityValue(displayRating) }}
      accessibilityActions={[
        { name: 'increment', label: 'Increase rating' },
        { name: 'decrement', label: 'Decrease rating' },
      ]}
      onAccessibilityAction={handleAccessibilityAction}
      style={styles.touchSurface}
      testID="star-rating-selector"
    >
      <View
        {...panHandlers}
        {...touchHandlers}
        onLayout={handleLayout}
        style={[styles.track, { width: TOUCH_TRACK_WIDTH }]}
        testID="star-rating-track"
      >
        <View pointerEvents="none" style={styles.starRow}>
          {Array.from({ length: STAR_COUNT }, (_, index) => {
            const starIndex = index + 1;
            const fill = getStarFillState(starIndex, displayRating ?? 0);

            return (
              <View key={starIndex} testID={`star-${starIndex}-${fill}`}>
                <StarGlyph fill={fill} size={STAR_VISUAL_SIZE} />
              </View>
            );
          })}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  touchSurface: {
    alignSelf: 'center',
    minHeight: TRACK_MIN_HEIGHT,
    justifyContent: 'center',
  },
  track: {
    minHeight: TRACK_MIN_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: (TRACK_MIN_HEIGHT - STAR_VISUAL_SIZE) / 2,
  },
  starRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: STAR_GAP,
  },
  starGlyph: {
    position: 'relative',
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  starFillClip: {
    position: 'absolute',
    left: 0,
    top: 0,
    overflow: 'hidden',
  },
});
