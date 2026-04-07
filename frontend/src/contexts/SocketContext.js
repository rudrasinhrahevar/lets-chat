import { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { io } from 'socket.io-client';
import { useAuthStore } from 'store/useAuthStore';
import { useChatStore } from 'store/useChatStore';
import { useCallStore } from 'store/useCallStore';
import { flushQueue } from 'services/offlineQueue';

const SocketContext = createContext(null);
const ConnectionContext = createContext('disconnected');

export function SocketProvider({ children }) {
  const socketRef = useRef(null);
  const lastMessageTimeRef = useRef(null);
  const [, setSocketReady] = useState(false);
  const [connectionState, setConnectionState] = useState('disconnected'); // connected | reconnecting | disconnected
  const { accessToken, isAuthenticated } = useAuthStore();

  const updateLastMessageTime = useCallback(() => {
    lastMessageTimeRef.current = new Date().toISOString();
  }, []);

  useEffect(() => {
    if (!isAuthenticated || !accessToken) return;

    if (socketRef.current) {
      socketRef.current.disconnect();
    }

    const socket = io(process.env.REACT_APP_SOCKET_URL || 'http://localhost:3001', {
      auth: { token: accessToken },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 10000,
      reconnectionAttempts: Infinity, // Never stop trying
      timeout: 10000,
      // Low bandwidth: reduce heartbeat frequency
      pingInterval: 30000,
      pingTimeout: 60000,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      setSocketReady(true);
      setConnectionState('connected');

      // Flush offline message queue
      const flushed = flushQueue(socket);
      if (flushed) console.log(`Flushed ${flushed} queued messages`);

      // Request catch-up for missed messages
      if (lastMessageTimeRef.current) {
        socket.emit('sync:catchup', { lastTimestamp: lastMessageTimeRef.current });
      }
    });

    socket.on('disconnect', (reason) => {
      console.warn('Socket disconnected:', reason);
      setSocketReady(false);
      setConnectionState('disconnected');
    });

    socket.on('connect_error', (err) => {
      console.error('Socket error:', err.message);
      setSocketReady(false);
      setConnectionState('reconnecting');
    });

    socket.io.on('reconnect_attempt', () => {
      setConnectionState('reconnecting');
    });

    socket.io.on('reconnect', () => {
      setConnectionState('connected');
    });

    // ─── Catch-up response ───
    socket.on('sync:catchup-response', ({ messages }) => {
      if (!messages?.length) return;
      const chatStore = useChatStore.getState();
      messages.forEach(msg => {
        chatStore.receiveMessage(msg);
        socket.emit('message:delivered', { messageId: msg._id, chatId: msg.chat?._id || msg.chat });
      });
    });

    // ─── Messages ───
    socket.on('message:receive', (message) => {
      useChatStore.getState().receiveMessage(message);
      socket.emit('message:delivered', { messageId: message._id, chatId: message.chat?._id || message.chat });
      updateLastMessageTime();
    });
    socket.on('message:sent', ({ tempId, messageId }) => {
      useChatStore.getState().confirmSent(tempId, messageId);
      updateLastMessageTime();
    });
    socket.on('message:status', (data) => useChatStore.getState().updateMessageStatus(data));
    socket.on('message:read', ({ chatId, userId }) => useChatStore.getState().markRead(chatId, userId));
    socket.on('message:reacted', (data) => useChatStore.getState().updateReactions(data));
    socket.on('message:edited', (data) => useChatStore.getState().editMessage(data));
    socket.on('message:deleted', (data) => useChatStore.getState().deleteMessage(data));

    // Poll voting
    socket.on('message:poll-voted', (data) => useChatStore.getState().updatePollVote(data));

    // Typing
    socket.on('typing:start', ({ chatId, userId }) => useChatStore.getState().setTyping(chatId, userId, true));
    socket.on('typing:stop', ({ chatId, userId }) => useChatStore.getState().setTyping(chatId, userId, false));

    // Recording
    socket.on('recording:start', ({ chatId, userId }) => useChatStore.getState().setRecording(chatId, userId, true));
    socket.on('recording:stop', ({ chatId, userId }) => useChatStore.getState().setRecording(chatId, userId, false));

    // Presence
    socket.on('user:online', ({ userId }) => useChatStore.getState().setUserOnline(userId, true));
    socket.on('user:offline', ({ userId, lastSeen }) => useChatStore.getState().setUserOnline(userId, false, lastSeen));

    // New chat notification
    socket.on('chat:new', (chat) => {
      const state = useChatStore.getState();
      if (!state.chats.find(c => c._id === chat._id)) {
        useChatStore.getState().setChats([chat, ...state.chats]);
      }
    });

    // Calls
    socket.on('call:incoming', (data) => useCallStore.getState().setIncomingCall(data));
    socket.on('call:ringing', (data) => {
      const current = useCallStore.getState().activeCall;
      useCallStore.getState().setActiveCall({ ...current, ...data, status: 'ringing', isInitiator: true });
    });
    socket.on('call:accepted', (data) => {
      const current = useCallStore.getState().activeCall;
      useCallStore.getState().setActiveCall({ ...current, ...data, status: 'ongoing' });
    });
    socket.on('call:rejected', () => useCallStore.getState().clearCall());
    socket.on('call:ended', () => useCallStore.getState().clearCall());
    socket.on('call:missed', () => useCallStore.getState().clearCall());
    socket.on('call:unavailable', () => useCallStore.getState().clearCall());

    return () => {
      socket.disconnect();
      socketRef.current = null;
      setSocketReady(false);
      setConnectionState('disconnected');
    };
  }, [isAuthenticated, accessToken, updateLastMessageTime]);

  return (
    <SocketContext.Provider value={socketRef.current}>
      <ConnectionContext.Provider value={connectionState}>
        {children}
      </ConnectionContext.Provider>
    </SocketContext.Provider>
  );
}

export const useSocket = () => useContext(SocketContext);
export const useConnectionState = () => useContext(ConnectionContext);
