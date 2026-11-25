import { Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { type InfiniteData, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  createDirectConversation,
  deleteDirectConversation,
  sendDirectMessage,
} from '../api/messages-api';
import type { DirectConversationPage } from '../types';
import { messageQueryKeys } from './useMessageQueries';

export function useDeleteDirectConversation() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  return useMutation({
    mutationFn: (conversationId: string) => deleteDirectConversation(conversationId),
    onMutate: async (conversationId) => {
      await queryClient.cancelQueries({ queryKey: messageQueryKeys.conversations });
      const previous = queryClient.getQueryData<InfiniteData<DirectConversationPage>>(
        messageQueryKeys.conversations,
      );
      queryClient.setQueryData<InfiniteData<DirectConversationPage>>(
        messageQueryKeys.conversations,
        (data) =>
          data && {
            ...data,
            pages: data.pages.map((page) => ({
              ...page,
              items: page.items.filter((item) => item.id !== conversationId),
            })),
          },
      );
      return { previous };
    },
    onError: (_error, _conversationId, context) => {
      if (context?.previous) {
        queryClient.setQueryData(messageQueryKeys.conversations, context.previous);
      }
      Alert.alert(t('messages.deleteFailedTitle'), t('messages.deleteFailed'));
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: messageQueryKeys.conversations });
      void queryClient.invalidateQueries({ queryKey: messageQueryKeys.unread });
    },
  });
}

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
