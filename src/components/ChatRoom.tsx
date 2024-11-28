  import React, { useState, useEffect } from 'react';
  import io from 'socket.io-client';
  import Button from '@mui/material/Button';
  import TextField from '@mui/material/TextField';
  import Box from '@mui/material/Box';
  import Grid from '@mui/material/Grid2';
  import List from '@mui/material/List';
  import ListItemText from '@mui/material/ListItemText';
  import ListItem from '@mui/material/ListItem';

  const urlBackend = `${process.env.REACT_APP_BACKEND_URL}`;
  const socket = io(urlBackend);

  interface Payload {
    userId: string;
    message: string;
  };

  const ChatRoom: React.FC = () => {
    const [ messages, setMessages ] = useState<{ userId: string; message: string }[]>([]);
    const [ inputMessage, setInputMessage ] = useState<string>('');
    const [ username, setUsername ] = useState<string>('');
    const [ usernameLock, setUsernameLock ] = useState<boolean>(false)

    useEffect(() => {
      socket.on('message', (msg: Payload) => {
        // console.log(msg);
        setMessages((prevMessages) => {
          return [
            ...prevMessages,
            msg,
          ]}
        );
      });

      socket.on('allMessages', (msgs: Payload[]) => {
        // console.log({msgs});
        msgs.map(m => setMessages((prevMessages) => {
          return [
            ...prevMessages,
            m,
          ]}
        ));
      });
      
      return () => {
        socket.off('message');
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
    };

    return (
        <Box>
          <List>
            {messages.map((message, index) => (
              <ListItem disablePadding key={index}>
                <ListItemText>

                  {
                    message.userId === username ? (
                      <strong>{`${message.userId}: ${message.message}`}</strong>
                    ) :(
                      `${message.userId}: ${message.message}`
                    )
                  }
                </ListItemText>
              </ListItem>
            ))}
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
