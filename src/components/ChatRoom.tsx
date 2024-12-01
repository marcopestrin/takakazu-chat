import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import Box from '@mui/material/Box';
import { Message, MessagesList } from '../interfaces/Message';
import { getToday, getCurrentTime } from '../utils/date';
import MessageForm from './MessageForm';
import MessageList from './MessageList';

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

    socket.on('allMessages', (msgs: MessagesList) => {
      if (msgs.length) setMessagesList(msgs);
    });
    
    return () => {
      socket.off('message');
      socket.off('allMessages');
    };
  }, []);

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


  return (
      <Box sx={{ maxWidth: '100%', padding: 2 }}>
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
      </Box>
  );
};

export default ChatRoom;
