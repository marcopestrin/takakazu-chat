import { Server, Socket } from 'socket.io';

interface Message {
  userId: string;
  message: string;
}

export class ChatServer {
  private connectedUsers: Record<string, string> = {};

  constructor(private io: Server) {
    this.handleSocketConnection();
  }

  private handleSocketConnection(): void {
    this.io.on('connection', (socket: Socket) => {
      console.log(`User connected: ${socket.id}`);

      socket.on('user_connected', (userId: string) => {
        this.connectedUsers[socket.id] = userId;
        this.io.emit('user_connected', userId);
      });

      socket.on('message', (message: string) => {
        const userId = this.connectedUsers[socket.id];
        console.log(`Message received from ${userId}: ${message}`);
        const formattedMessage: Message = { userId, message };
        this.io.emit('message', formattedMessage);
      });

      socket.on('disconnect', () => {
        const userId = this.connectedUsers[socket.id];
        delete this.connectedUsers[socket.id];
        this.io.emit('user_disconnected', userId);
      });
    });
  }
}
