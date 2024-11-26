import * as dotenv from 'dotenv';
import express, { Request, Response } from 'express';
import http from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import cors  from 'cors';
import { saveMessage, connectToDatabase, getMessages } from './database'
dotenv.config({ path: '../.env' }); 

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

  // await connectToDatabase();
  // console.log("Connected to database")

  // get the conversation
  const messages = await getMessages();
  // send conversation to FE
  messages.map(m => io.to(roomName).emit('message', m));
  
  socket.on('message', (payload: string) => {
    const { message, userId } = JSON.parse(payload);
    // console.log(`message received: '${message}' from '${userId}'`);
    io.to(roomName).emit('message', JSON.parse(payload));
    // saveMessage({
    //   timestamp: new Date().toISOString(),
    //   message,
    //   username: userId
    // })
  });

  socket.on('disconnect', () => {
    console.log('Disconnected user:', socket.id);
  });

});

server.listen(bePort, () => {
  console.log(`Server Socket.IO avviato su http://localhost:${bePort}`);
});
