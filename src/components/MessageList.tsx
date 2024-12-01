import React from 'react';
import { List, ListItem, ListItemText, Typography } from '@mui/material';
import { MessagesByDate } from '../interfaces/Message';
import Box from '@mui/material/Box';
import Avatar from '@mui/material/Avatar';

interface MessageListProps {
  messagesList: MessagesByDate[];
  username: string;
}

const MessageList: React.FC<MessageListProps> = ({ messagesList, username }) => {

  const formatMessage = (message: string) => {
    return message.split('\n').map((line, index) => (
      <span key={index}>
        {line}
        <br />
      </span>
    ));
  };

  return (
    <List>
      {messagesList.map(({ messageDate, messages }) => (
        <React.Fragment key={messageDate}>

          <Typography variant="h6" gutterBottom>
            {messageDate}

          </Typography>

          {messages.map(({ userId, message, timestamp }, index) => (
            <ListItem disablePadding key={index}>

                <Box sx={{
                  display: 'flex',
                  alignItems: 'center',
                  backgroundColor: userId === username ? '#d1e7ff' : '#f1f1f1',  // Colore diverso per il proprio messaggio
                  borderRadius: 2,
                  padding: 1,
                  marginTop: 1,
                  width: '100%',
                  boxSizing: 'border-box'
                }}>
                  <Avatar sx={{ marginRight: 2 }}>
                    {userId.charAt(0).toUpperCase()}
                  </Avatar>
                  
                <ListItemText>
                  {
                    userId === username ? (
                      <strong>{`${userId}: `}</strong>
                    ) : (
                      <>{userId}: </>  
                    )
                  }
                  <span style={{ whiteSpace: 'pre-wrap' }}>
                    {formatMessage(message)}
                  </span>

                  <Box sx={{ fontSize: '0.75rem', color: '#888', marginTop: 0.5 }}>
                    {timestamp}
                  </Box>
                </ListItemText>
              </Box>
            </ListItem>

          ))}
        </React.Fragment>
      ))}
    </List>
  );
};

export default MessageList;
