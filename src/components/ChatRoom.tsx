  import React, { useState } from 'react';
  import io from 'socket.io-client';

  const urlBackend = `http://localhost:${process.env.REACT_APP_BACKEND_PORT}`;
  const socket = io(urlBackend);

  interface Payload {
    userId: string;
    message: string;
  };

  const ChatRoom: React.FC = () => {
    const [ messages, setMessages ] = useState<{ userId: string; message: string }[]>([]);
    const [ inputMessage, setInputMessage ] = useState<string>('');

    const addMessage = ({ userId, message }: Payload) => {
      setMessages((prevMessages) => [
        ...prevMessages,
        { 
          userId,
          message 
        }
      ]);
    };


    const handleMessageSend = () => {
      if (inputMessage.trim() !== '') {
        const payload = {
          userId: 'uniqueUserId, prova',
          message: inputMessage
        };
        console.log("payload", payload);
        socket.emit('send_message', JSON.stringify(payload));
        addMessage(payload);
        setInputMessage('');
      }
    };

    return (
      <div>
        <div>
          {messages.map((message, index) => (
            <div key={index}>{`${message.userId}: ${message.message}`}</div>
          ))}
        </div>
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
        />
        <button onClick={handleMessageSend}>Send</button>
      </div>
    );
  };

  export default ChatRoom;
