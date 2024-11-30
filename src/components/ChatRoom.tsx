import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid2';
import List from '@mui/material/List';
import ListItemText from '@mui/material/ListItemText';
import ListItem from '@mui/material/ListItem';
import { Message, MessagesList, MessagesByDate } from '../interfaces/Message';
import { getToday } from '../utils/date';

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
  const [ init, setInit ] = useState<boolean>(false)

  useEffect(() => {

    if (sessionStorage.getItem('username')) setUsernameLock(true);

    socket.on('message', (msg: Message) => {
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
      if (!init) {
        setMessagesList(msgs);
        setInit(true);
      }
    });
    
    return () => {
      socket.off('message');
      socket.off('allMessages');
    };
  }, []);

  const handleMessageSend = () => {
    if (inputMessage.trim() !== '') {
      const payload = {
        userId: username,
        message: inputMessage
      };
      socket.emit('message', JSON.stringify(payload));
      setInputMessage('');
      setUsernameLock(true)
    }
    sessionStorage.setItem('username', username);
  };

  return (
      <Box>
        <List>
          {messagesList.map(({ messageDate, messages }: MessagesByDate, index) => (
            <React.Fragment key={messageDate}>
              <>{messageDate}</>
              {messages.map(({ userId, message, timestamp }: Message, _i) => (
                <ListItem
                  disablePadding
                  key={`${index}-${_i}`}
                >
                  <ListItemText>
                    {
                      userId === username ? (
                        <strong>{`${userId}: ${message}`}</strong>
                      ) :(
                        `${userId}: ${message}`
                      )
                    }
                  </ListItemText>
                </ListItem>
              ))
            }
            </React.Fragment>
          ))
        }
        </List>
        <Grid container spacing={2} alignItems="center">
          <Grid size={2}>
            <TextField
              id="username"
              label="username"
              variant="outlined"
              disabled={usernameLock}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </Grid>
          <Grid size={8}>
            <TextField
              id="message"
              label="message"
              fullWidth
              variant="outlined"
              value={inputMessage}
              multiline
              onChange={(e) => setInputMessage(e.target.value)}
            />
          </Grid>
          <Grid size={2}>
            <Button
              variant="outlined"
              fullWidth
              disabled={username === ''}
              onClick={handleMessageSend}
            >Send</Button>
          </Grid>
        </Grid>
      </Box>
  );
};

export default ChatRoom;
