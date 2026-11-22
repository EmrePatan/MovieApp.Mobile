import { api } from '@/api/client';
import {
  directConversationPath,
  directConversationsPath,
  directMessageUnreadCountPath,
  directMessagesPath,
} from './routes';
import type {
  DirectConversationDetail,
  DirectConversationPage,
  DirectMessageItem,
  DirectMessagePage,
} from '../types';

export function getDirectConversations(page = 1, pageSize = 20, signal?: AbortSignal) {
  return api.get<DirectConversationPage>(directConversationsPath(page, pageSize), { signal });
}

export function deleteDirectConversation(conversationId: string) {
  return api.delete<void>(directConversationPath(conversationId));
}

export function getDirectConversation(conversationId: string, signal?: AbortSignal) {
  return api.get<DirectConversationDetail>(directConversationPath(conversationId), { signal });
}

export function createDirectConversation(userId: string) {
  return api.post<DirectConversationDetail>('/api/messages/conversations', { userId });
}

export function getDirectMessages(
  conversationId: string,
  page = 1,
  pageSize = 30,
  signal?: AbortSignal,
) {
  return api.get<DirectMessagePage>(directMessagesPath(conversationId, page, pageSize), { signal });
}

export function sendDirectMessage(conversationId: string, body: string) {
  return api.post<DirectMessageItem>(`/api/messages/conversations/${conversationId}/messages`, { body });
}

export function getDirectMessageUnreadCount(signal?: AbortSignal) {
  return api.get<number>(directMessageUnreadCountPath(), { signal });
}
