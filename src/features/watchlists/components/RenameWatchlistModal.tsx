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
import { premiumSheet, premiumSheetChrome } from '@/theme/premium-sheet';
import { spacing } from '@/theme/spacing';
import { GlassSheetLayer } from '@/components/common/GlassSheetLayer';

interface RenameWatchlistModalProps {
  visible: boolean;
  watchlistId: string | null;
  initialName: string;
  initialDescription?: string | null;
  onClose: () => void;
  onRenamed?: () => void;
}

export function RenameWatchlistModal({
  visible,
  watchlistId,
  initialName,
  initialDescription,
  onClose,
  onRenamed,
}: RenameWatchlistModalProps) {
  const { t } = useTranslation();
  const renameWatchlist = useRenameWatchlistMutation();
  const nameInputRef = useRef<TextInput>(null);
  const [name, setName] = useState(initialName);
  const [description, setDescription] = useState(initialDescription ?? '');
  const [feedback, setFeedback] = useState<string | null>(null);

  // Reset the form whenever the sheet opens or its initial values change (adjust state during render).
  const resetKey = visible ? `${initialName}\u0000${initialDescription ?? ''}` : null;
  const [appliedResetKey, setAppliedResetKey] = useState<string | null>(null);
  if (resetKey !== appliedResetKey) {
    setAppliedResetKey(resetKey);
    if (resetKey !== null) {
      setName(initialName);
      setDescription(initialDescription ?? '');
      setFeedback(null);
    }
  }

  useEffect(() => {
    if (!visible) {
      return;
    }

    const focusTimer = setTimeout(() => {
      nameInputRef.current?.focus();
    }, 280);

    return () => {
      clearTimeout(focusTimer);
    };
  }, [initialDescription, initialName, visible]);

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

    const trimmedDescription = description.trim();
    if (trimmed === initialName.trim() && trimmedDescription === (initialDescription ?? '').trim()) {
      handleClose();
      return;
    }

    dismissKeyboard();

    renameWatchlist.mutate(
      { watchlistId, name: trimmed, description: trimmedDescription },
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
      <View style={premiumSheetChrome.overlay}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.keyboardAvoid}
        >
          <SafeAreaView style={styles.sheet} edges={['bottom']}>
            <GlassSheetLayer />
            <View style={premiumSheetChrome.handle} />
            <View style={styles.header}>
              <AppText variant="subtitle" style={styles.headerTitle}>{t('watchlists.renameModal.title')}</AppText>
              <Pressable accessibilityRole="button" accessibilityLabel={t('common.close')} onPress={handleClose}>
                <Ionicons name="close" size={24} color={premiumSheet.textPrimary} />
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

            <AppInput
              label={t('watchlists.descriptionLabel')}
              value={description}
              onChangeText={setDescription}
              placeholder={t('watchlists.descriptionPlaceholder')}
              maxLength={280}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
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
  keyboardAvoid: {
    justifyContent: 'flex-end',
  },
  sheet: {
    ...premiumSheetChrome.sheet,
    gap: spacing.md,
    paddingBottom: spacing.xl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    color: premiumSheet.textPrimary,
    fontWeight: '700',
  },
});
