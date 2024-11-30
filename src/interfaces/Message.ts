export interface Message {
  userId: string;
  message: string;
  timestamp: string;
};

export interface MessagesByDate {
  messageDate: string;
  messages: Message[];
};

export type MessagesList = MessagesByDate[];