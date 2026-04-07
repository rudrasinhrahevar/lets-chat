import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuthStore } from 'store/useAuthStore';
import { useChatStore } from 'store/useChatStore';
import { useCallStore } from 'store/useCallStore';

const SocketContext = createContext(null);

export function SocketProvider({ children }) {
  const socketRef = useRef(null);
  const [, setSocketReady] = useState(false);
  const { accessToken, isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated || !accessToken) return;

    // Disconnect any existing socket
    if (socketRef.current) {
      socketRef.current.disconnect();
    }

    const socket = io(process.env.REACT_APP_SOCKET_URL || 'http://localhost:3001', {
      auth: { token: accessToken },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 10
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('Socket connected:', socket.id);
      setSocketReady(true);
    });

    socket.on('disconnect', (reason) => {
      console.warn('Socket disconnected:', reason);
      setSocketReady(false);
    });

    socket.on('connect_error', (err) => {
      console.error('Socket error:', err.message);
      setSocketReady(false);
    });

    socket.on('reconnect', () => {
      console.log('Socket reconnected');
      setSocketReady(true);
    });

    // Messages
    socket.on('message:receive', (message) => {
      useChatStore.getState().receiveMessage(message);
      socket.emit('message:delivered', { messageId: message._id, chatId: message.chat?._id || message.chat });
    });
    socket.on('message:sent', ({ tempId, messageId }) => useChatStore.getState().confirmSent(tempId, messageId));
    socket.on('message:status', (data) => useChatStore.getState().updateMessageStatus(data));
    socket.on('message:read', ({ chatId, userId }) => useChatStore.getState().markRead(chatId, userId));
    socket.on('message:reacted', (data) => useChatStore.getState().updateReactions(data));
    socket.on('message:edited', (data) => useChatStore.getState().editMessage(data));
    socket.on('message:deleted', (data) => useChatStore.getState().deleteMessage(data));

    // Typing
    socket.on('typing:start', ({ chatId, userId }) => useChatStore.getState().setTyping(chatId, userId, true));
    socket.on('typing:stop', ({ chatId, userId }) => useChatStore.getState().setTyping(chatId, userId, false));

    // Presence
    socket.on('user:online', ({ userId }) => useChatStore.getState().setUserOnline(userId, true));
    socket.on('user:offline', ({ userId, lastSeen }) => useChatStore.getState().setUserOnline(userId, false, lastSeen));

    // Calls
    socket.on('call:incoming', (data) => useCallStore.getState().setIncomingCall(data));
    socket.on('call:ringing', (data) => {
      const current = useCallStore.getState().activeCall;
      useCallStore.getState().setActiveCall({ ...current, ...data, status: 'ringing', isInitiator: true });
    });
    socket.on('call:accepted', (data) => {
      const current = useCallStore.getState().activeCall;
      useCallStore.getState().setActiveCall({ ...current, status: 'ongoing', ...data });
    });
    socket.on('call:rejected', () => useCallStore.getState().clearCall());
    socket.on('call:ended', () => useCallStore.getState().clearCall());
    socket.on('call:missed', () => useCallStore.getState().clearCall());
    socket.on('call:unavailable', () => {
      useCallStore.getState().clearCall();
      // toast handled in component
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
      setSocketReady(false);
    };
  }, [isAuthenticated, accessToken]);

  return (
    <SocketContext.Provider value={socketRef.current}>
      {children}
    </SocketContext.Provider>
  );
}

export const useSocket = () => useContext(SocketContext);
