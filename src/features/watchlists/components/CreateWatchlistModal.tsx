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
import { useCreateWatchlistForLibrary } from '../hooks/useWatchlistMutations';
import { premiumSheet, premiumSheetChrome } from '@/theme/premium-sheet';
import { spacing } from '@/theme/spacing';

interface CreateWatchlistModalProps {
  visible: boolean;
  onClose: () => void;
  onCreated: (watchlistId: string) => void;
}

export function CreateWatchlistModal({
  visible,
  onClose,
  onCreated,
}: CreateWatchlistModalProps) {
  const { t } = useTranslation();
  const createWatchlist = useCreateWatchlistForLibrary();
  const nameInputRef = useRef<TextInput>(null);
  const [name, setName] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);

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
  }, [visible]);

  const dismissKeyboard = () => {
    nameInputRef.current?.blur();
    Keyboard.dismiss();
  };

  const handleClose = () => {
    dismissKeyboard();
    setName('');
    setFeedback(null);
    onClose();
  };

  const handleCreate = () => {
    const trimmed = name.trim();
    if (trimmed.length === 0) {
      setFeedback(t('watchlists.createModal.enterName'));
      return;
    }

    dismissKeyboard();

    createWatchlist.mutate(trimmed, {
      onSuccess: (created) => {
        setName('');
        setFeedback(null);
        onCreated(created.id);
        onClose();
      },
      onError: (error) => {
        setFeedback(
          isApiError(error) && error.kind === 'conflict'
            ? t('watchlists.createModal.nameConflict')
            : t('watchlists.createModal.createError'),
        );
      },
    });
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={handleClose}>
      <View style={premiumSheetChrome.overlay}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.keyboardAvoid}
        >
          <SafeAreaView style={styles.sheet} edges={['bottom']}>
            <View style={premiumSheetChrome.handle} />
            <View style={styles.header}>
              <AppText variant="subtitle" style={styles.headerTitle}>{t('watchlists.createModal.title')}</AppText>
              <Pressable accessibilityRole="button" accessibilityLabel={t('common.close')} onPress={handleClose}>
                <Ionicons name="close" size={24} color={premiumSheet.textPrimary} />
              </Pressable>
            </View>

            <FeedbackMessage
              message={feedback}
              tone={
                feedback === t('watchlists.createModal.enterName') ? 'info' : feedback ? 'error' : 'info'
              }
              onDismiss={() => setFeedback(null)}
            />

            <AppInput
              ref={nameInputRef}
              label={t('common.watchlistName')}
              value={name}
              onChangeText={setName}
              placeholder={t('common.myWatchlist')}
              maxLength={100}
              autoCorrect={false}
              returnKeyType="done"
              onSubmitEditing={handleCreate}
            />

            <AppButton
              title={t('common.createWatchlist')}
              loading={createWatchlist.isPending}
              disabled={createWatchlist.isPending}
              onPress={handleCreate}
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
