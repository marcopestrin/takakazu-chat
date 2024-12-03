export interface Message {
  userId: string;
  message: string;
  timestamp: string;
  room: String
};

export interface MessagesByDate {
  messageDate: string;
  messages: Message[];
};

export type MessagesList = MessagesByDate[];