import * as dotenv from 'dotenv';
import express from 'express';
import http from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import cors  from 'cors';;
dotenv.config({ path: '../.env' }); 


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
  console.log('Un client si è connesso:', socket.id);

  socket.on('send_message', (payload: string) => {
    const { message, userId } = JSON.parse(payload);
    console.log('Messaggio ricevuto:', userId, message);
    io.emit('chat message', message);
  });


});

server.listen(bePort, () => {
  console.log(`Server Socket.IO avviato su http://localhost:${bePort}`);
});
