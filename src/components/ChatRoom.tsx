import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import { Snackbar, Box } from '@mui/material';
import { getToday, getCurrentTime } from '../utils/date';
import MessageForm from './MessageForm';
import MessageList from './MessageList';
import RoomSelector from './RoomSelector';
import { Message, MessagesList } from '../interfaces/Message';


const urlBackend = `${process.env.REACT_APP_BACKEND_URL}`;
const socket = io(urlBackend);

const defaultValue = [
  {
    messageDate: "",
    messages: []
  }
];

const ChatRoom: React.FC = () => {
  const [ messagesList, setMessagesList ] = useState<MessagesList>(defaultValue);

  const [ room, setRoom ] = useState<string>(() => sessionStorage.getItem('room') || "");
  const [ rooms, setRooms ] = useState<string[]>([]);

  const [ contentSnackbar, setContentSnackbar ] = useState<string>("");
  const [ openSnackbar, setOpenSnackbar ] = useState<boolean>(false);

  const [ inputMessage, setInputMessage ] = useState<string>('');
  const [ username, setUsername ] = useState<string>(() => sessionStorage.getItem('username') || "");
  const [ usernameLock, setUsernameLock ] = useState<boolean>(false)

  useEffect(() => {

    if (sessionStorage.getItem('username')) setUsernameLock(true);

    socket.on('message', (msg: Message) => {
      msg.timestamp = getCurrentTime();
      setMessagesList(prevMessages => {
        const today = getToday();
        const existingIndex = prevMessages.findIndex(entry => entry.messageDate === today);
      
        if (existingIndex !== -1) { // add message to already exist day
          const updatedMessages = [...prevMessages];
          updatedMessages[existingIndex] = {
            ...updatedMessages[existingIndex],
            messages: [
              ...updatedMessages[existingIndex].messages,
              msg
            ]
          };
          return updatedMessages;
        }
      
        return [ // first message of the day
          ...prevMessages,
          {
            messageDate: today,
            messages: [msg],
          },
        ];
      });
    });

    socket.on('allMessages', (msgs: MessagesList) => {
      if (msgs.length) setMessagesList(msgs);
    });

    socket.on('rooms', (rooms: string[]) => setRooms(rooms));
    socket.on('roomChanged', (feedback: string) => {
      setOpenSnackbar(true);
      setContentSnackbar(feedback);
    });

    
    return () => {
      socket.off('message');
      socket.off('allMessages');
    };
  }, []);

  useEffect(() => {
    handleSetRoom(room)
  }, [room])


  const handleMessageSend = () => {
    if (inputMessage.trim() !== '') {
      socket.emit('message', JSON.stringify({
        userId: username,
        message: inputMessage
      }));
      setInputMessage('');
      setUsernameLock(true)
    }
    sessionStorage.setItem('username', username);
  };

  const handleSetRoom = (roomSelected: string) => {
    if (!rooms.includes(room)){
      setMessagesList(defaultValue);
    }
    socket.emit('changeRoom', roomSelected);
    setRoom(roomSelected);
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  return (
      <Box sx={{ maxWidth: '100%', padding: 2 }}>
        <RoomSelector 
          handleSetRoom={handleSetRoom}
          rooms={rooms || []}
        />
        <MessageList
          username={username}
          messagesList={messagesList}
        />
        <MessageForm
          username={username}
          inputMessage={inputMessage}
          usernameLock={usernameLock}
          setUsername={setUsername}
          setInputMessage={setInputMessage}
          handleMessageSend={handleMessageSend}
        />
        <Snackbar
          open={openSnackbar}
          autoHideDuration={3000}
          onClose={handleCloseSnackbar}
          message={contentSnackbar}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'center'
          }}
        />
      </Box>
  );
};

export default ChatRoom;
