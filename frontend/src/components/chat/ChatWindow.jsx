import { useState, useEffect, useRef, useCallback } from 'react';
import { useChatStore } from 'store/useChatStore';
import { useAuthStore } from 'store/useAuthStore';
import { useSocket } from 'contexts/SocketContext';
import { useCallStore } from 'store/useCallStore';
import api from 'services/api';
import MessageBubble from 'components/chat/MessageBubble';
import ChatInput from 'components/chat/ChatInput';
import { formatLastSeen } from 'utils/formatTime';

export default function ChatWindow() {
  const { activeChat, messages, historyLoaded, typing, onlineUsers, loadMessages, setActiveChat } = useChatStore();
  const { user } = useAuthStore();
  const socket = useSocket();
  const messagesEndRef = useRef(null);
  const [replyTo, setReplyTo] = useState(null);
  const [editMsg, setEditMsg] = useState(null);
  const [loading, setLoading] = useState(false);
  const chatMessages = messages[activeChat?._id] || [];
  const isHistoryLoaded = historyLoaded[activeChat?._id];
  const typingUsers = [...(typing[activeChat?._id] || [])];
  const isTyping = typingUsers.length > 0;
  const isGroup = activeChat?.type === 'group';
  const otherUser = !isGroup ? activeChat?.participants?.find(p => p._id !== user?._id) : null;
  const chatName = isGroup ? activeChat?.groupInfo?.name : otherUser?.name || 'Unknown';
  const isOnline = otherUser ? (onlineUsers[otherUser._id]?.isOnline ?? otherUser?.isOnline) : false;
  const lastSeen = otherUser ? (onlineUsers[otherUser._id]?.lastSeen || otherUser?.lastSeen) : null;

  const fetchMessages = useCallback(async () => {
    if (!activeChat?._id || isHistoryLoaded) return;
    setLoading(true);
    try { const { data } = await api.get(`/messages/${activeChat._id}`); loadMessages(activeChat._id, data.data); } catch (err) { console.error('Load messages failed:', err); }
    setLoading(false);
  }, [activeChat?._id, isHistoryLoaded, loadMessages]);

  useEffect(() => { fetchMessages(); }, [fetchMessages]);
  useEffect(() => { if (activeChat) socket?.emit('message:read', { chatId: activeChat._id }); }, [activeChat, chatMessages.length, socket]);
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [chatMessages.length]);

  const handleCall = (type) => {
    if (!otherUser) return;
    socket?.emit('call:initiate', { targetUserId: otherUser._id, chatId: activeChat._id, callType: type });
    useCallStore.getState().setActiveCall({ targetUserId: otherUser._id, chatId: activeChat._id, callType: type, status: 'ringing' });
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 px-4 py-2.5 bg-wa-panel border-b border-wa-border">
        <button onClick={() => setActiveChat(null)} className="md:hidden p-1 text-wa-icon hover:text-wa-text mr-1">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        </button>
        <div className="relative">
          <div className="w-10 h-10 rounded-full bg-wa-teal/20 flex items-center justify-center overflow-hidden">
            {otherUser?.avatar || activeChat?.groupInfo?.avatar ? <img src={otherUser?.avatar || activeChat?.groupInfo?.avatar} alt="" className="w-full h-full object-cover" /> :
              <span className="text-wa-teal font-bold">{isGroup ? '👥' : chatName?.[0]?.toUpperCase()}</span>}
          </div>
          {isOnline && !isGroup && <div className="absolute bottom-0 right-0 w-3 h-3 bg-wa-green rounded-full border-2 border-wa-panel" />}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-wa-text truncate text-sm">{chatName}</h3>
          <p className="text-xs text-wa-text-sec truncate">
            {isTyping ? <span className="text-wa-teal">typing...</span> : isGroup ? `${activeChat.participants?.length} members` : isOnline ? 'online' : lastSeen ? `last seen ${formatLastSeen(lastSeen)}` : 'offline'}
          </p>
        </div>
        <div className="flex items-center gap-1">
          {!isGroup && (
            <>
              <button onClick={() => handleCall('video')} className="p-2 rounded-full hover:bg-wa-input text-wa-icon transition" title="Video call">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
              </button>
              <button onClick={() => handleCall('audio')} className="p-2 rounded-full hover:bg-wa-input text-wa-icon transition" title="Voice call">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
              </button>
            </>
          )}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto px-4 py-2 space-y-1 bg-wa-bg" style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(0,168,132,0.03) 0%, transparent 50%)' }}>
        {loading && <div className="text-center py-4"><div className="inline-block w-6 h-6 border-2 border-wa-teal border-t-transparent rounded-full animate-spin" /></div>}
        {chatMessages.map((msg, i) => (
          <MessageBubble key={msg._id || i} message={msg} prevMessage={chatMessages[i - 1]} onReply={() => setReplyTo(msg)} onEdit={() => setEditMsg(msg)} />
        ))}
        {isTyping && (
          <div className="flex items-center gap-1 px-4 py-2 bg-wa-bubble2 rounded-lg w-fit">
            <div className="w-2 h-2 bg-wa-text-sec rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-2 h-2 bg-wa-text-sec rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-2 h-2 bg-wa-text-sec rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <ChatInput chatId={activeChat._id} replyTo={replyTo} editMsg={editMsg} onClearReply={() => setReplyTo(null)} onClearEdit={() => setEditMsg(null)} />
    </div>
  );
}
