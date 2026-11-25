export const directConversationsPath = (page = 1, pageSize = 20) =>
  `/api/messages/conversations?${new URLSearchParams({
    page: String(page),
    pageSize: String(pageSize),
  }).toString()}`;

export const directConversationPath = (conversationId: string) =>
  `/api/messages/conversations/${conversationId}`;

export const directMessagesPath = (conversationId: string, page = 1, pageSize = 30) =>
  `/api/messages/conversations/${conversationId}/messages?${new URLSearchParams({
    page: String(page),
    pageSize: String(pageSize),
  }).toString()}`;

export const directMessageUnreadCountPath = () => '/api/messages/unread-count';
