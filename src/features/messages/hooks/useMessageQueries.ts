import { useEffect, useMemo, useRef, useState } from 'react';
import { useInfiniteQuery, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/auth/useAuth';
import { socialQueryKeys } from '@/features/social/hooks/social-query-keys';
import {
  getDirectConversation,
  getDirectConversations,
  getDirectMessageUnreadCount,
  getDirectMessages,
} from '../api/messages-api';
import type { DirectMessageItem } from '../types';

export const DIRECT_MESSAGE_PAGE_SIZE = 30;

export const messageQueryKeys = {
  all: ['messages'] as const,
  conversations: ['messages', 'conversations'] as const,
  conversation: (conversationId: string) => ['messages', 'conversation', conversationId] as const,
  thread: (conversationId: string) => ['messages', 'thread', conversationId] as const,
  unread: ['messages', 'unread-count'] as const,
};

function sortMessages(items: DirectMessageItem[]): DirectMessageItem[] {
  return [...items].sort((left, right) => {
    const byTime = left.createdAt.localeCompare(right.createdAt);
    return byTime === 0 ? left.id.localeCompare(right.id) : byTime;
  });
}

function mergeMessages(...groups: DirectMessageItem[][]): DirectMessageItem[] {
  const byId = new Map<string, DirectMessageItem>();
  for (const group of groups) {
    for (const item of group) {
      byId.set(item.id, item);
    }
  }
  return sortMessages([...byId.values()]);
}

export function useDirectMessageUnreadCount() {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: messageQueryKeys.unread,
    queryFn: ({ signal }) => getDirectMessageUnreadCount(signal),
    enabled: isAuthenticated,
    refetchInterval: 30_000,
    staleTime: 10_000,
  });
}

export function useDirectConversations() {
  const { isAuthenticated } = useAuth();
  return useInfiniteQuery({
    queryKey: messageQueryKeys.conversations,
    queryFn: ({ pageParam, signal }) => getDirectConversations(pageParam, 20, signal),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => (lastPage.hasMore ? lastPage.page + 1 : undefined),
    enabled: isAuthenticated,
    refetchInterval: 20_000,
    staleTime: 5_000,
  });
}

export function useDirectConversation(conversationId: string) {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: messageQueryKeys.conversation(conversationId),
    queryFn: ({ signal }) => getDirectConversation(conversationId, signal),
    enabled: isAuthenticated && conversationId.length > 0,
    staleTime: 30_000,
  });
}

export function useDirectMessageThread(conversationId: string) {
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const [older, setOlder] = useState<DirectMessageItem[]>([]);
  const [isLoadingOlder, setIsLoadingOlder] = useState(false);
  const [olderExhausted, setOlderExhausted] = useState(false);
  const olderPageRef = useRef(1);
  const previousRecent = useRef<DirectMessageItem[]>([]);

  const latest = useQuery({
    queryKey: messageQueryKeys.thread(conversationId),
    queryFn: async ({ signal }) => {
      const page = await getDirectMessages(conversationId, 1, DIRECT_MESSAGE_PAGE_SIZE, signal);
      void queryClient.invalidateQueries({ queryKey: messageQueryKeys.unread });
      void queryClient.invalidateQueries({ queryKey: [...socialQueryKeys.all, 'notifications'] });
      return page;
    },
    enabled: isAuthenticated && conversationId.length > 0,
    refetchInterval: 5_000,
    staleTime: 2_000,
  });

  useEffect(() => {
    setOlder([]);
    setOlderExhausted(false);
    olderPageRef.current = 1;
    previousRecent.current = [];
  }, [conversationId]);

  useEffect(() => {
    const next = latest.data?.items ?? [];
    const nextIds = new Set(next.map((item) => item.id));
    const dropped = previousRecent.current.filter((item) => !nextIds.has(item.id));
    if (dropped.length > 0) {
      setOlder((current) => mergeMessages(current, dropped));
    }
    previousRecent.current = next;
  }, [latest.data]);

  const messages = useMemo(
    () => mergeMessages(older, latest.data?.items ?? []),
    [latest.data?.items, older],
  );

  const hasOlder = !olderExhausted && latest.data?.hasMore === true;

  const loadOlder = async () => {
    if (!hasOlder || isLoadingOlder) {
      return;
    }

    setIsLoadingOlder(true);
    try {
      const nextPage = olderPageRef.current + 1;
      const result = await getDirectMessages(conversationId, nextPage, DIRECT_MESSAGE_PAGE_SIZE);
      olderPageRef.current = nextPage;
      setOlder((current) => mergeMessages(current, result.items));
      if (!result.hasMore) {
        setOlderExhausted(true);
      }
    } catch {
      // Keep the earlier-messages control so the reader can retry.
    } finally {
      setIsLoadingOlder(false);
    }
  };

  return {
    messages,
    hasOlder,
    isLoadingOlder,
    loadOlder,
    isLoading: latest.isLoading,
    isError: latest.isError,
    refetch: latest.refetch,
    isRefetching: latest.isRefetching,
  };
}
