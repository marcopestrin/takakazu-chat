import * as dotenv from 'dotenv';
import express from 'express';
import http from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import cors  from 'cors';;
dotenv.config({ path: '../.env' }); 

const roomName = 'main-room'
const bePort = process.env.BE_PORT
const fontendUrl = `http://localhost:${process.env.BE_FRONTEND_PORT}`
const app = express();

app.use(cors({
  origin: fontendUrl
}));

app.get('/socket.io', (req, res) => {
  res.send('CORS headers are set!');
});

const server = http.createServer(app);

const io = new SocketIOServer(server,{
  cors: {
    origin: fontendUrl,
    methods: ["GET", "POST"],
  },
});

io.on('connection', (socket: Socket) => {
  socket.join(roomName);
  console.log(`User '${socket.id}' added to '${roomName}'`);

  socket.on('message', (payload: string) => {
    const { message, userId } = JSON.parse(payload);
    console.log(`message received: '${message}' from '${userId}'`);
    io.to(roomName).emit('message', JSON.parse(payload));
  });

  socket.on('disconnect', () => {
    console.log('Disconnected user:', socket.id);
  });

});

server.listen(bePort, () => {
  console.log(`Server Socket.IO avviato su http://localhost:${bePort}`);
});
