import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppButton } from '@/components/buttons/AppButton';
import { FeedbackMessage } from '@/components/feedback/FeedbackMessage';
import { DetailCircularAction } from '@/features/details/shared/components/DetailCircularAction';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { useWatchlistMembership } from '../hooks/useWatchlists';
import { isContentInAnyWatchlist } from '../utils/watchlist-membership';
import { WatchlistPickerModal } from './WatchlistPickerModal';
import type { WatchlistContentType } from '../types';
import { colors } from '@/theme/colors';
import { borderRadius } from '@/theme/spacing';
import { interaction } from '@/theme/interaction';

interface AddToWatchlistButtonProps {
  contentType: WatchlistContentType;
  contentId: string;
  variant?: 'button' | 'icon' | 'detail';
}

export function AddToWatchlistButton({
  contentType,
  contentId,
  variant = 'button',
}: AddToWatchlistButtonProps) {
  const { t } = useTranslation();
  const { isAuthenticated, requireAuth } = useRequireAuth();
  const { data: membership = {}, isLoading: isMembershipLoading } = useWatchlistMembership(
    contentType,
    contentId,
    isAuthenticated,
  );
  const [visible, setVisible] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const isBusy = isAuthenticated && isMembershipLoading;
  const active = isAuthenticated && isContentInAnyWatchlist(membership);
  const label = active ? t('watchlists.addButton.active') : t('watchlists.addButton.inactive');
  const buttonTitle = active ? t('watchlists.addButton.activeTitle') : t('watchlists.addButton.inactiveTitle');

  const handlePress = () => {
    if (!requireAuth()) {
      setFeedback(t('watchlists.addButton.signInRequired'));
      return;
    }

    setVisible(true);
  };

  const modal = (
    <WatchlistPickerModal
      visible={visible}
      contentType={contentType}
      contentId={contentId}
      onClose={() => setVisible(false)}
    />
  );

  if (variant === 'detail') {
    return (
      <View>
        <FeedbackMessage message={feedback} tone="info" onDismiss={() => setFeedback(null)} />
        <DetailCircularAction
          label={t('common.watchlist')}
          accessibilityLabel={label}
          active={active}
          busy={isBusy}
          onPress={handlePress}
        >
          <Ionicons
            name={active ? 'bookmark' : 'bookmark-outline'}
            size={22}
            color={active ? colors.accent : colors.textPrimary}
          />
        </DetailCircularAction>
        {modal}
      </View>
    );
  }

  return (
    <View style={variant === 'icon' ? styles.iconWrapper : styles.wrapper}>
      <FeedbackMessage message={feedback} tone="info" onDismiss={() => setFeedback(null)} />
      {variant === 'icon' ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={label}
          accessibilityState={{ selected: active, disabled: isBusy, busy: isBusy }}
          disabled={isBusy}
          onPress={handlePress}
          style={({ pressed }) => [
            styles.iconButton,
            active && styles.iconButtonActive,
            pressed && !isBusy && styles.pressed,
            isBusy && styles.disabled,
          ]}
        >
          {isBusy ? (
            <ActivityIndicator color={colors.accent} size="small" />
          ) : (
            <Ionicons
              name={active ? 'bookmark' : 'bookmark-outline'}
              size={20}
              color={active ? colors.accent : colors.textPrimary}
            />
          )}
        </Pressable>
      ) : (
        <AppButton
          title={buttonTitle}
          variant="secondary"
          loading={isBusy}
          onPress={handlePress}
          accessibilityState={{ selected: active }}
          style={[styles.button, active && styles.buttonActive]}
        />
      )}
      {modal}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  iconWrapper: {
    alignSelf: 'flex-start',
  },
  button: {
    minHeight: 48,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconButtonActive: {
    borderColor: colors.accent,
    backgroundColor: colors.accentTint12,
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
