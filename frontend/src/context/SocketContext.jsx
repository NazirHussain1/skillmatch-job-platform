import { createContext, useContext, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { io } from 'socket.io-client';

const SocketContext = createContext();

const getSocketServerUrl = () => {
  const apiUrl = import.meta.env.VITE_API_URL;
  if (!apiUrl) {
    return 'http://localhost:5000';
  }

  return apiUrl.replace(/\/api\/?$/, '');
};

export const useSocket = () => {
  return useContext(SocketContext);
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (!user) {
      setSocket((currentSocket) => {
        currentSocket?.close();
        return null;
      });
      return;
    }

    const newSocket = io(getSocketServerUrl(), {
      withCredentials: true
    });

    newSocket.on('connect', () => {
      newSocket.emit('join', user._id);
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [user]);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};
