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
  const [ usernameLock, setUsernameLock ] = useState<boolean>(false);

  useEffect(() => {

    if (sessionStorage.getItem('username')) setUsernameLock(true);

    // message received after processing it
    socket.on('message', (msg: Message) => {
      msg.timestamp = getCurrentTime();
      setMessagesList(prevMessages => {
        const today = getToday();
        const existingIndex = prevMessages.findIndex(entry => entry.messageDate === today);
      
        if (existingIndex !== -1) {
          // add message to already exist day
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
      
        // first message of the day
        return [
          ...prevMessages,
          {
            messageDate: today,
            messages: [msg],
          },
        ];
      });
    });

    // get previous conversation
    socket.on('allMessages', (msgs: MessagesList) => {
      if (msgs.length) {
        setMessagesList(msgs);
      }
    });

    // set the list of rooms
    socket.on('rooms', (rooms: string[]) => setRooms(rooms));

    // confirmation room is changed
    socket.on('roomChanged', (newRoom: string) => {
      setOpenSnackbar(true);
      setContentSnackbar(`Now you are in ${newRoom}`);
      sessionStorage.setItem('room', newRoom);
    });

    return () => {
      socket.off('message');
      socket.off('allMessages');
    };
  }, []);

  useEffect(() => {
    handleSetRoom(room);
  }, [room])

  const handleMessageSend = () => {
    if (inputMessage.trim() !== '') {
      socket.emit('message', JSON.stringify({
        userId: username,
        message: inputMessage
      }));
      setInputMessage('');
      setUsernameLock(true);
      sessionStorage.setItem('username', username);
    }
  };

  const handleSetRoom = (roomSelected: string) => {
    if (!rooms.includes(room)){
      // is a new room
      setMessagesList(defaultValue);
    }
    socket.emit('changeRoom', roomSelected); // set BE
    setRoom(roomSelected); // set FE
  };


  return (
      <Box sx={{ maxWidth: '100%', padding: 2 }}>
        <RoomSelector 
          handleSetRoom={handleSetRoom}
          rooms={rooms || []}
          defaultValue={room}
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
          onClose={() => setOpenSnackbar(false)}
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
