import * as dotenv from 'dotenv';
import express, { Request, Response } from 'express';
import http from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import cors  from 'cors';
import { saveMessage, getMessages, initializeDatabase, getRooms } from './database'

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

const socketRooms: { [socketId: string]: string } = {};

io.on('connection', async (socket: Socket) => {
  socket.join(""); // no room as default
  console.log(`User '${socket.id}' connected`);

  // get list of rooms
  const rooms = await getRooms();
  socket.emit('rooms', rooms);
  
  socket.on('message', (payload: string) => {
    const { message, userId } = JSON.parse(payload);
    console.log(`message received: '${message}' from '${userId}'`);
    io.to(socketRooms[socket.id]).emit('message', JSON.parse(payload));
    saveMessage({
      message,
      room: socketRooms[socket.id],
      username: userId
    })
  });

  socket.on('changeRoom', async (newRoom) => {
    const currentRoom = socketRooms[socket.id];

    if (newRoom && newRoom !== currentRoom) {
      socket.leave(currentRoom);
      socket.join(newRoom);
      socketRooms[socket.id] = newRoom;
      console.log(`'${socket.id}' left '${currentRoom}' and added to '${newRoom}'`);
      socket.emit('roomChanged', newRoom);
      const messages = await getMessages(socketRooms[socket.id]);
      socket.emit('allMessages', messages);
    }
  });

  socket.on('disconnect', () => {
    console.log('Disconnected user:', socket.id);
    socket.leave(socketRooms[socket.id]);
    delete socketRooms[socket.id];  
  });

});


initializeDatabase().then(() => {
  server.listen(bePort, () => {
    console.log(`Server Socket.IO loaded  http://localhost:${bePort}`);
  });
})

