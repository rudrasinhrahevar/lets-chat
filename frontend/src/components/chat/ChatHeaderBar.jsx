import { useState } from 'react';
import { useChatStore } from 'store/useChatStore';
import { useAuthStore } from 'store/useAuthStore';
import { useSocket } from 'contexts/SocketContext';
import { useCallStore } from 'store/useCallStore';
import { formatLastSeen } from 'utils/formatTime';
import api from 'services/api';
import toast from 'react-hot-toast';

export default function ChatHeaderBar({ onOpenContactInfo, onOpenSearch }) {
  const { activeChat, typing, onlineUsers, recording, setActiveChat } = useChatStore();
  const { user } = useAuthStore();
  const socket = useSocket();
  const [showMenu, setShowMenu] = useState(false);

  const isGroup = activeChat?.type === 'group';
  const otherUser = !isGroup ? activeChat?.participants?.find(p => p._id !== user?._id) : null;
  const chatName = isGroup ? activeChat?.groupInfo?.name : otherUser?.name || 'Unknown';
  const isOnline = otherUser ? (onlineUsers[otherUser._id]?.isOnline ?? otherUser?.isOnline) : false;
  const lastSeen = otherUser ? (onlineUsers[otherUser._id]?.lastSeen || otherUser?.lastSeen) : null;
  const typingUsers = [...(typing[activeChat?._id] || [])];
  const isTyping = typingUsers.length > 0;
  const recordingUsers = [...(recording[activeChat?._id] || [])];
  const isRecording = recordingUsers.length > 0;

  const getStatusText = () => {
    if (isTyping) return <span className="text-wa-teal font-medium">typing...</span>;
    if (isRecording) return <span className="text-wa-teal font-medium">recording audio...</span>;
    if (isGroup) return `${activeChat.participants?.length} members`;
    if (isOnline) return <span className="text-wa-teal">online</span>;
    if (lastSeen) return `last seen ${formatLastSeen(lastSeen)}`;
    return 'offline';
  };

  const handleCall = (type) => {
    if (!otherUser) return;
    socket?.emit('call:initiate', { targetUserId: otherUser._id, chatId: activeChat._id, callType: type });
    useCallStore.getState().setActiveCall({
      targetUserId: otherUser._id,
      chatId: activeChat._id,
      callType: type,
      status: 'ringing',
      isInitiator: true,
      callerInfo: { name: otherUser.name, avatar: otherUser.avatar }
    });
  };

  const handleMute = async (duration) => {
    try {
      let mutedUntil = null;
      if (duration === '8h') mutedUntil = new Date(Date.now() + 8 * 60 * 60 * 1000);
      else if (duration === '1w') mutedUntil = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      else if (duration === 'always') mutedUntil = new Date('2099-12-31');
      await api.put(`/chats/${activeChat._id}/mute`, { mutedUntil });
      toast.success(mutedUntil ? 'Notifications muted' : 'Notifications unmuted');
    } catch { toast.error('Failed to update'); }
    setShowMenu(false);
  };

  const handleDisappearing = async (duration) => {
    try {
      await api.put(`/chats/${activeChat._id}/disappearing`, { duration });
      toast.success(`Disappearing messages: ${duration}`);
    } catch { toast.error('Failed to update'); }
    setShowMenu(false);
  };

  const handleClearChat = async () => {
    try {
      await api.delete(`/chats/${activeChat._id}/clear`);
      useChatStore.getState().loadMessages(activeChat._id, []);
      toast.success('Chat cleared');
    } catch { toast.error('Failed to clear'); }
    setShowMenu(false);
  };

  const handleBlock = async () => {
    try {
      await api.post(`/users/${otherUser._id}/block`);
      toast.success('User blocked');
    } catch { toast.error('Failed to block'); }
    setShowMenu(false);
  };

  return (
    <div className="flex items-center gap-3 px-4 py-2.5 bg-wa-panel border-b border-wa-border flex-shrink-0">
      {/* Back button (mobile) */}
      <button onClick={() => setActiveChat(null)} className="md:hidden p-1 text-wa-icon hover:text-wa-text mr-1 transition">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
      </button>

      {/* Avatar */}
      <button onClick={onOpenContactInfo} className="relative flex-shrink-0">
        <div className="w-10 h-10 rounded-full bg-wa-teal/20 flex items-center justify-center overflow-hidden">
          {otherUser?.avatar || activeChat?.groupInfo?.avatar ? (
            <img src={otherUser?.avatar || activeChat?.groupInfo?.avatar} alt="" className="w-full h-full object-cover" />
          ) : (
            <span className="text-wa-teal font-bold">{isGroup ? '👥' : chatName?.[0]?.toUpperCase()}</span>
          )}
        </div>
        {isOnline && !isGroup && <div className="absolute bottom-0 right-0 w-3 h-3 bg-wa-green rounded-full border-2 border-wa-panel" />}
      </button>

      {/* Name & Status */}
      <button onClick={onOpenContactInfo} className="flex-1 min-w-0 text-left">
        <h3 className="font-semibold text-wa-text truncate text-sm">{chatName}</h3>
        <p className="text-xs text-wa-text-sec truncate">{getStatusText()}</p>
      </button>

      {/* Action Icons */}
      <div className="flex items-center gap-0.5">
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

        {/* Search */}
        <button onClick={onOpenSearch} className="p-2 rounded-full hover:bg-wa-input text-wa-icon transition" title="Search">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
        </button>

        {/* 3-dot Menu */}
        <div className="relative">
          <button onClick={() => setShowMenu(!showMenu)} className="p-2 rounded-full hover:bg-wa-input text-wa-icon transition" title="More options">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="5" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="12" cy="19" r="2"/></svg>
          </button>

          {showMenu && (
            <div className="absolute right-0 top-full mt-1 bg-wa-panel rounded-lg shadow-xl border border-wa-border py-1 w-56 z-50 animate-slide-up" onMouseLeave={() => setShowMenu(false)}>
              <button onClick={() => { onOpenContactInfo(); setShowMenu(false); }} className="w-full text-left px-4 py-2.5 text-sm hover:bg-wa-input text-wa-text transition">
                👤 View contact
              </button>
              <button onClick={() => { onOpenSearch(); setShowMenu(false); }} className="w-full text-left px-4 py-2.5 text-sm hover:bg-wa-input text-wa-text transition">
                🔍 Search
              </button>

              {/* Mute submenu */}
              <div className="group relative">
                <button className="w-full text-left px-4 py-2.5 text-sm hover:bg-wa-input text-wa-text transition">
                  🔇 Mute notifications ▸
                </button>
                <div className="hidden group-hover:block absolute left-full top-0 bg-wa-panel rounded-lg shadow-xl border border-wa-border py-1 w-40">
                  <button onClick={() => handleMute('8h')} className="w-full text-left px-4 py-2 text-sm hover:bg-wa-input text-wa-text">8 hours</button>
                  <button onClick={() => handleMute('1w')} className="w-full text-left px-4 py-2 text-sm hover:bg-wa-input text-wa-text">1 week</button>
                  <button onClick={() => handleMute('always')} className="w-full text-left px-4 py-2 text-sm hover:bg-wa-input text-wa-text">Always</button>
                  <button onClick={() => handleMute(null)} className="w-full text-left px-4 py-2 text-sm hover:bg-wa-input text-wa-teal">Unmute</button>
                </div>
              </div>

              {/* Disappearing messages submenu */}
              <div className="group relative">
                <button className="w-full text-left px-4 py-2.5 text-sm hover:bg-wa-input text-wa-text transition">
                  ⏱️ Disappearing messages ▸
                </button>
                <div className="hidden group-hover:block absolute left-full top-0 bg-wa-panel rounded-lg shadow-xl border border-wa-border py-1 w-40">
                  <button onClick={() => handleDisappearing('24h')} className="w-full text-left px-4 py-2 text-sm hover:bg-wa-input text-wa-text">24 hours</button>
                  <button onClick={() => handleDisappearing('7d')} className="w-full text-left px-4 py-2 text-sm hover:bg-wa-input text-wa-text">7 days</button>
                  <button onClick={() => handleDisappearing('90d')} className="w-full text-left px-4 py-2 text-sm hover:bg-wa-input text-wa-text">90 days</button>
                  <button onClick={() => handleDisappearing('off')} className="w-full text-left px-4 py-2 text-sm hover:bg-wa-input text-wa-teal">Off</button>
                </div>
              </div>

              <hr className="border-wa-border my-1" />
              <button onClick={handleClearChat} className="w-full text-left px-4 py-2.5 text-sm hover:bg-wa-input text-wa-text transition">
                🗑️ Clear chat
              </button>
              {!isGroup && (
                <button onClick={handleBlock} className="w-full text-left px-4 py-2.5 text-sm hover:bg-wa-input text-wa-danger transition">
                  🚫 Block
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
