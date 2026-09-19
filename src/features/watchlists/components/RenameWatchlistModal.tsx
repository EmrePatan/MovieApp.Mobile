import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { isApiError } from '@/api/errors';
import { AppButton } from '@/components/buttons/AppButton';
import { AppText } from '@/components/common/AppText';
import { AppInput } from '@/components/inputs/AppInput';
import { FeedbackMessage } from '@/components/feedback/FeedbackMessage';
import { useRenameWatchlistMutation } from '../hooks/useWatchlistMutations';
import { colors } from '@/theme/colors';
import { borderRadius, spacing } from '@/theme/spacing';

interface RenameWatchlistModalProps {
  visible: boolean;
  watchlistId: string | null;
  initialName: string;
  onClose: () => void;
  onRenamed?: () => void;
}

export function RenameWatchlistModal({
  visible,
  watchlistId,
  initialName,
  onClose,
  onRenamed,
}: RenameWatchlistModalProps) {
  const { t } = useTranslation();
  const renameWatchlist = useRenameWatchlistMutation();
  const nameInputRef = useRef<TextInput>(null);
  const [name, setName] = useState(initialName);
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    if (!visible) {
      return;
    }

    setName(initialName);
    setFeedback(null);

    const focusTimer = setTimeout(() => {
      nameInputRef.current?.focus();
    }, 280);

    return () => {
      clearTimeout(focusTimer);
    };
  }, [initialName, visible]);

  const dismissKeyboard = () => {
    nameInputRef.current?.blur();
    Keyboard.dismiss();
  };

  const handleClose = () => {
    dismissKeyboard();
    setFeedback(null);
    onClose();
  };

  const handleSave = () => {
    if (!watchlistId) {
      return;
    }

    const trimmed = name.trim();
    if (trimmed.length === 0) {
      setFeedback(t('watchlists.renameModal.enterName'));
      return;
    }

    if (trimmed === initialName.trim()) {
      handleClose();
      return;
    }

    dismissKeyboard();

    renameWatchlist.mutate(
      { watchlistId, name: trimmed },
      {
        onSuccess: () => {
          setFeedback(null);
          onRenamed?.();
          onClose();
        },
        onError: (error) => {
          setFeedback(
            isApiError(error) && error.kind === 'conflict'
              ? t('watchlists.renameModal.nameConflict')
              : t('watchlists.renameModal.renameError'),
          );
        },
      },
    );
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={handleClose}>
      <View style={styles.overlay}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.keyboardAvoid}
        >
          <SafeAreaView style={styles.sheet} edges={['bottom']}>
            <View style={styles.header}>
              <AppText variant="subtitle">{t('watchlists.renameModal.title')}</AppText>
              <Pressable accessibilityRole="button" accessibilityLabel={t('common.close')} onPress={handleClose}>
                <Ionicons name="close" size={24} color={colors.textPrimary} />
              </Pressable>
            </View>

            <FeedbackMessage
              message={feedback}
              tone={
                feedback === t('watchlists.renameModal.enterName') ? 'info' : feedback ? 'error' : 'info'
              }
              onDismiss={() => setFeedback(null)}
            />

            <AppInput
              ref={nameInputRef}
              label={t('common.listName')}
              value={name}
              onChangeText={setName}
              placeholder={t('common.myList')}
              maxLength={100}
              autoCorrect={false}
              returnKeyType="done"
              onSubmitEditing={handleSave}
            />

            <AppButton
              title={t('common.save')}
              loading={renameWatchlist.isPending}
              disabled={renameWatchlist.isPending}
              onPress={handleSave}
            />
          </SafeAreaView>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: colors.overlay,
  },
  keyboardAvoid: {
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: borderRadius.lg,
    borderTopRightRadius: borderRadius.lg,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
    gap: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});
