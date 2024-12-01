import React from 'react';
import { Grid, TextField, Button } from '@mui/material';

interface MessageFormProps {
  username: string;
  inputMessage: string;
  usernameLock: boolean;
  setUsername: React.Dispatch<React.SetStateAction<string>>;
  setInputMessage: React.Dispatch<React.SetStateAction<string>>;
  handleMessageSend: () => void;
}

const MessageForm: React.FC<MessageFormProps> = ({
  username,
  inputMessage,
  setUsername,
  setInputMessage,
  handleMessageSend,
  usernameLock
}) => {

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey &&  inputMessage.trim()) {
      event.preventDefault();
      handleMessageSend();
    }
  };

  return (
    <Grid container spacing={2} alignItems="center">
      <Grid item xs={2}>
        <TextField
          id="username"
          label="Username"
          variant="outlined"
          disabled={usernameLock}
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
      </Grid>
      <Grid item xs={8}>
        <TextField
          id="message"
          label="Message"
          fullWidth
          variant="outlined"
          value={inputMessage}
          multiline
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyDown={handleKeyDown}
        />
      </Grid>
      <Grid item xs={2}>
        <Button
          variant="outlined"
          fullWidth
          disabled={username === ''}
          onClick={handleMessageSend}
        >
          Send
        </Button>
      </Grid>
    </Grid>
  );
};

export default MessageForm;
