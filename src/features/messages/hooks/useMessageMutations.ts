import { Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createDirectConversation, sendDirectMessage } from '../api/messages-api';
import { messageQueryKeys } from './useMessageQueries';

export function useSendDirectMessage(conversationId: string) {
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  return useMutation({
    mutationFn: (body: string) => sendDirectMessage(conversationId, body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: messageQueryKeys.thread(conversationId) });
      void queryClient.invalidateQueries({ queryKey: messageQueryKeys.conversations });
      void queryClient.invalidateQueries({ queryKey: messageQueryKeys.unread });
    },
    onError: () => Alert.alert(t('messages.sendFailedTitle'), t('messages.sendFailed')),
  });
}

export function useCreateDirectConversation() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  return useMutation({
    mutationFn: (userId: string) => createDirectConversation(userId),
    onSuccess: (conversation) => {
      queryClient.setQueryData(messageQueryKeys.conversation(conversation.id), conversation);
      void queryClient.invalidateQueries({ queryKey: messageQueryKeys.conversations });
      router.push(`/(tabs)/(app-shell)/messages/${conversation.id}`);
    },
    onError: () => Alert.alert(t('messages.startFailedTitle'), t('messages.startFailed')),
  });
}
