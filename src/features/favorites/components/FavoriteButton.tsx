import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { isApiError } from '@/api/errors';
import { FeedbackMessage } from '@/components/feedback/FeedbackMessage';
import {
  DETAIL_ACTION_SIZE,
  DetailCircularAction,
} from '@/features/details/shared/components/DetailCircularAction';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { useFavoriteStatus } from '../hooks/useFavoriteStatus';
import { useToggleFavorite } from '../hooks/useFavoriteMutations';
import type { FavoriteContentType } from '../types';
import { colors } from '@/theme/colors';
import { borderRadius } from '@/theme/spacing';
import { interaction } from '@/theme/interaction';

interface FavoriteButtonProps {
  contentType: FavoriteContentType;
  contentId: string;
  size?: number;
  variant?: 'default' | 'detail';
  favoriteIsFavorited?: boolean;
  favoriteStatusResolved?: boolean;
  favoriteStatusPending?: boolean;
}

export function FavoriteButton({
  contentType,
  contentId,
  size = 48,
  variant = 'default',
  favoriteIsFavorited,
  favoriteStatusResolved = false,
  favoriteStatusPending = false,
}: FavoriteButtonProps) {
  const { isAuthenticated, requireAuth } = useRequireAuth();
  const shouldQueryStatus = !favoriteStatusResolved && !favoriteStatusPending;
  const { data: queriedIsFavorited = false, isLoading: isStatusLoading } = useFavoriteStatus(
    contentType,
    contentId,
    { enabled: shouldQueryStatus },
  );
  const isFavorited = favoriteStatusResolved
    ? (favoriteIsFavorited ?? false)
    : queriedIsFavorited;
  const toggleFavorite = useToggleFavorite(contentType, contentId);
  const [feedback, setFeedback] = useState<string | null>(null);

  const isBusy =
    toggleFavorite.isPending || (isAuthenticated && shouldQueryStatus && isStatusLoading);
  const active = isAuthenticated && isFavorited;

  const handlePress = () => {
    if (!requireAuth()) {
      setFeedback('Please sign in to use favorites.');
      return;
    }

    toggleFavorite.mutate(isFavorited, {
      onError: (error) => {
        setFeedback(
          isApiError(error)
            ? 'Could not update your favorite. Please try again.'
            : 'Could not update your favorite. Please try again.',
        );
      },
    });
  };

  const label = active ? 'Remove from favorites' : 'Add to favorites';

  if (variant === 'detail') {
    return (
      <>
        <FeedbackMessage message={feedback} tone="error" onDismiss={() => setFeedback(null)} />
        <DetailCircularAction
          label="Favorite"
          accessibilityLabel={label}
          active={active}
          busy={isBusy}
          onPress={handlePress}
        >
          <Ionicons
            name={active ? 'heart' : 'heart-outline'}
            size={22}
            color={active ? colors.accent : colors.textPrimary}
          />
        </DetailCircularAction>
      </>
    );
  }

  return (
    <>
      <FeedbackMessage message={feedback} tone="error" onDismiss={() => setFeedback(null)} />
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityState={{ selected: active, disabled: isBusy, busy: isBusy }}
        disabled={isBusy}
        onPress={handlePress}
        style={({ pressed }) => [
          styles.button,
          { width: size, height: size },
          active && styles.buttonActive,
          pressed && !isBusy && styles.pressed,
          isBusy && styles.disabled,
        ]}
      >
        {isBusy ? (
          <ActivityIndicator color={colors.accent} size="small" />
        ) : (
          <Ionicons
            name={active ? 'heart' : 'heart-outline'}
            size={size >= DETAIL_ACTION_SIZE ? 22 : 20}
            color={active ? colors.accent : colors.textPrimary}
          />
        )}
      </Pressable>
    </>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonActive: {
    borderColor: colors.accent,
    backgroundColor: colors.accentTint12,
  },
  pressed: {
    opacity: interaction.pressedOpacity,
  },
  disabled: {
    opacity: interaction.busyOpacity,
  },
});
