import { useEffect, useRef, useState } from 'react';
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
import { colors } from '@/theme/colors';
import { borderRadius, spacing } from '@/theme/spacing';

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
      setFeedback('Enter a watchlist name.');
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
            ? 'A watchlist with this name already exists.'
            : 'Could not create watchlist. Please try again.',
        );
      },
    });
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
              <AppText variant="subtitle">Create Watchlist</AppText>
              <Pressable accessibilityRole="button" accessibilityLabel="Close" onPress={handleClose}>
                <Ionicons name="close" size={24} color={colors.textPrimary} />
              </Pressable>
            </View>

            <FeedbackMessage
              message={feedback}
              tone={feedback?.includes('Could not') ? 'error' : 'info'}
              onDismiss={() => setFeedback(null)}
            />

            <AppInput
              ref={nameInputRef}
              label="Watchlist name"
              value={name}
              onChangeText={setName}
              placeholder="My Watchlist"
              maxLength={100}
              autoCorrect={false}
              returnKeyType="done"
              onSubmitEditing={handleCreate}
            />

            <AppButton
              title="Create Watchlist"
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
