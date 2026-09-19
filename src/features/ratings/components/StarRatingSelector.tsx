import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  AccessibilityActionEvent,
  LayoutChangeEvent,
  StyleSheet,
  View,
} from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
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
  onPreviewChange?: (rating: number | null) => void;
  onCommit: (starRating: number) => void;
  onClear: () => void;
}

function StarGlyph({ fill, size }: { fill: StarFillState; size: number }) {
  const outlineColor = fill === 'empty' ? EMPTY_STAR_COLOR : colors.accentStrong;

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
          <Ionicons name="star" size={size} color={colors.accentStrong} />
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
  onPreviewChange,
  onCommit,
  onClear,
}: StarRatingSelectorProps) {
  const { t } = useTranslation();
  const [trackWidth, setTrackWidth] = useState(0);
  const [localPreviewRating, setLocalPreviewRating] = useState<number | 'clear' | null>(null);

  const handlePreviewChange = useCallback(
    (rating: number | 'clear' | null) => {
      setLocalPreviewRating(rating);
      if (rating === 'clear' || rating == null) {
        onPreviewChange?.(null);
        return;
      }

      onPreviewChange?.(rating);
    },
    [onPreviewChange],
  );

  const displayRating = useMemo(() => {
    if (localPreviewRating === 'clear') {
      return null;
    }

    if (localPreviewRating != null) {
      return localPreviewRating;
    }

    return value;
  }, [localPreviewRating, value]);

  const nativeGesture = useMemo(() => Gesture.Native(), []);

  const { panHandlers, touchHandlers } = useMemo(
    () =>
      createRatingPanResponder({
        getDisabled: () => disabled,
        getHasRating: () => value != null,
        getTrackWidth: () => trackWidth,
        getStarClusterWidth: () => STAR_CLUSTER_WIDTH,
        onGestureStart: () => onGestureStart?.() ?? true,
        onPreviewChange: handlePreviewChange,
        onCommit,
        onClear,
        onInteractionActiveChange,
        retainPreviewOnCommit: true,
      }),
    [
      disabled,
      value,
      trackWidth,
      handlePreviewChange,
      onCommit,
      onClear,
      onGestureStart,
      onInteractionActiveChange,
    ],
  );

  const handleLayout = (event: LayoutChangeEvent) => {
    setTrackWidth(event.nativeEvent.layout.width);
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
      accessibilityLabel={t('ratings.yourRating')}
      accessibilityValue={{ text: formatStarRatingAccessibilityValue(displayRating) }}
      accessibilityActions={[
        { name: 'increment', label: 'Increase rating' },
        { name: 'decrement', label: 'Decrease rating' },
      ]}
      onAccessibilityAction={handleAccessibilityAction}
      style={styles.touchSurface}
      testID="star-rating-selector"
    >
      <GestureDetector gesture={nativeGesture}>
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
      </GestureDetector>
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
