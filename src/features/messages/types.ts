export interface DirectMessageUserSummary {
  id: string;
  userName: string;
  displayName: string;
  avatarUrl: string | null;
}

export interface DirectMessagePreview {
  id: string;
  senderId: string;
  body: string;
  createdAt: string;
}

export interface DirectConversationListItem {
  id: string;
  otherUser: DirectMessageUserSummary;
  lastMessage: DirectMessagePreview | null;
  unreadCount: number;
  updatedAt: string;
  lastMessageAt: string | null;
}

export interface DirectConversationPage {
  items: DirectConversationListItem[];
  page: number;
  pageSize: number;
  hasMore: boolean;
}

export interface DirectConversationDetail {
  id: string;
  otherUser: DirectMessageUserSummary;
  createdAt: string;
  updatedAt: string;
  lastMessageAt: string | null;
}

export interface DirectMessageItem {
  id: string;
  conversationId: string;
  senderId: string;
  body: string;
  createdAt: string;
}

export interface DirectMessagePage {
  items: DirectMessageItem[];
  page: number;
  pageSize: number;
  hasMore: boolean;
}
