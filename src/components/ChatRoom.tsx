  import React, { useState, useEffect } from 'react';
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
    const [ username, setUsername ] = useState<string>('');
    const [ usernameLock, setUsernameLock ] = useState<boolean>(false)

    useEffect(() => {
      socket.on('message', (msg: Payload) => {
        setMessages((prevMessages) => {
          return [
            ...prevMessages,
            msg,
          ]}
        );
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
      <div>
        <div>
          {messages.map((message, index) => (
            <div key={index}>
              {
                message.userId === username ? (
                  <strong>{`${message.userId}: ${message.message}`}</strong>
                ) :(
                  `${message.userId}: ${message.message}`
                )
              }
            </div>
          ))}
        </div>
        <input
          type="text"
          placeholder='username'
          disabled={usernameLock}
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="text"
          placeholder='message'
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
        />
        <button
          onClick={handleMessageSend}
          disabled={username === ''}
        >Send</button>
      </div>
    );
  };

  export default ChatRoom;
