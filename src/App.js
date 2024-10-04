import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import './App.css';


const socket = io(process.env.REACT_APP_API_URL);


const App = () => {

  const [currentuser, setCurrentuser] = useState('User1');
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');

  useEffect(() => {
    const storedMessages = JSON.parse(localStorage.getItem('chatMessages')) || [];
    setMessages(storedMessages);
  }, []);

  useEffect(() => {
    socket.emit('registerUser', currentuser);

    return () => {
      socket.off('registerUser');
    };
  }, [currentuser]);

  useEffect(() => {
    socket.on('receiveMessage', (messageData) => {

      setMessages((prev) => {
        const messageExists = prev.some((item) => item.sender === messageData.sender && item.message === messageData.message
        );

        if (!messageExists) {
          const updatedMessages = [...prev, messageData];
          localStorage.setItem('chatMessages', JSON.stringify(updatedMessages));
          return updatedMessages;
        }
        return prev;
      });
    });


    return () => {
      socket.off('receiveMessage');
    };
  }, []);


  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      sendMessage();
    }
  };
  const sendMessage = () => {
    const receiver = currentuser === 'User1' ? 'User2' : 'User1';
    if (inputMessage) {
      const messageData = { sender: currentuser, receiver, message: inputMessage };
      socket.emit('sendMessage', messageData);
      setMessages((prev) => {
        const updatedMessages = [...prev, messageData];
        localStorage.setItem('chatMessages', JSON.stringify(updatedMessages));
        return updatedMessages;
      });
      setInputMessage('');
    }
  };



  const switchUser = () => {
    const newUser = currentuser === 'User1' ? 'User2' : 'User1';
    setCurrentuser(newUser);
  };

  return (
    <div className="main">
      <h3>You are logged in as {currentuser}</h3>
      <div className="messages">
        {messages.filter((item) => item.sender === currentuser || item.receiver === currentuser).map((item, index) => (
          <div
            key={index}
            className={`message-chat ${item.sender === currentuser ? 'sent' : 'received'}`}
          >
            <strong>{item.sender === currentuser ? 'You' : item.sender}:</strong> {item.message}
          </div>
        ))}
      </div>

      <div className="input-box">
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={`Message ${currentuser === 'User1' ? 'User2' : 'User1'}`}
        />
        <button onClick={sendMessage}>Send</button>
      </div>

      <div className="user-switch">
        <button onClick={switchUser}>
          Switch to {currentuser === 'User1' ? 'User2' : 'User1'}
        </button>
      </div>
    </div>
  );
};

export default App;
