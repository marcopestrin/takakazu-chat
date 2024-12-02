import * as dotenv from 'dotenv';
import express, { Request, Response } from 'express';
import http from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import cors  from 'cors';
import { saveMessage, getMessages, initializeDatabase } from './database'

const roomName = 'main-room'
const bePort = process.env.BE_PORT
const fontendUrl = `http://localhost:${process.env.FE_PORT}`
const app = express();

app.use(cors({
  origin: fontendUrl
}));

app.get('/socket.io', (req: Request, res: Response) => {
  res.send('CORS headers are set!');
});

const server = http.createServer(app);

const io = new SocketIOServer(server,{
  cors: {
    origin: fontendUrl,
    methods: ["GET", "POST"],
  },
});


io.on('connection', async (socket: Socket) => {
  socket.join(roomName);
  console.log(`User '${socket.id}' added to '${roomName}'`);

  // get the conversation
  const messages = await getMessages();
  // send conversation to FE
  socket.emit('allMessages', messages);
  
  socket.on('message', (payload: string) => {
    const { message, userId } = JSON.parse(payload);
    console.log(`message received: '${message}' from '${userId}'`);
    io.to(roomName).emit('message', JSON.parse(payload));
    saveMessage({
      message,
      room: roomName,
      username: userId
    })
  });

  socket.on('disconnect', () => {
    console.log('Disconnected user:', socket.id);
  });

});


initializeDatabase().then(() => {
  server.listen(bePort, () => {
    console.log(`Server Socket.IO avviato su http://localhost:${bePort}`);
  });
})

