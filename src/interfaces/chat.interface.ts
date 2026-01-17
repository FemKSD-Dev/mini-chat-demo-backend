export interface Conversation {
  id: number;
  participantIds: [number, number];
  createdAt: number;
  updatedAt: number;
  lastMessageId?: number;
  lastMessageAt?: number;
}

export interface Message {
  id: number;
  conversationId: number;
  senderId: number;
  body: string;
  createdAt: number;
}