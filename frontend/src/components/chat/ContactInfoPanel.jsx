import { useState, useEffect } from 'react';
import { useAuthStore } from 'store/useAuthStore';
import { useChatStore } from 'store/useChatStore';
import api from 'services/api';
import { formatLastSeen } from 'utils/formatTime';
import toast from 'react-hot-toast';

export default function ContactInfoPanel({ onClose }) {
  const { activeChat, onlineUsers } = useChatStore();
  const { user } = useAuthStore();
  const [mediaItems, setMediaItems] = useState([]);
  const [starredCount, setStarredCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const isGroup = activeChat?.type === 'group';
  const otherUser = !isGroup ? activeChat?.participants?.find(p => p._id !== user?._id) : null;
  const name = isGroup ? activeChat?.groupInfo?.name : otherUser?.name || 'Unknown';
  const avatar = isGroup ? activeChat?.groupInfo?.avatar : otherUser?.avatar;
  const about = otherUser?.about || 'Hey there! I am using WhatsApp.';
  const isOnline = otherUser ? (onlineUsers[otherUser._id]?.isOnline ?? otherUser?.isOnline) : false;
  const lastSeen = otherUser ? (onlineUsers[otherUser._id]?.lastSeen || otherUser?.lastSeen) : null;

  useEffect(() => {
    const load = async () => {
      try {
        const [mediaRes, starredRes] = await Promise.all([
          api.get(`/messages/${activeChat._id}/media`),
          api.get('/messages/starred')
        ]);
        setMediaItems(mediaRes.data.data || []);
        setStarredCount((starredRes.data.data || []).filter(m => (m.chat?._id || m.chat) === activeChat._id).length);
      } catch {}
      setLoading(false);
    };
    load();
  }, [activeChat._id]);

  const handleBlock = async () => {
    if (!otherUser) return;
    try {
      await api.post(`/users/block/${otherUser._id}`);
      toast.success('User blocked');
    } catch { toast.error('Failed to block'); }
  };

  const images = mediaItems.filter(m => m.type === 'image');

  return (
    <div className="contact-info-panel">
      {/* Header */}
      <div className="flex items-center gap-4 px-4 py-3 bg-wa-panel border-b border-wa-border sticky top-0 z-10">
        <button onClick={onClose} className="p-1 text-wa-icon hover:text-wa-text transition">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
        <h2 className="text-base font-semibold text-wa-text">Contact info</h2>
      </div>

      {/* Profile Section */}
      <div className="flex flex-col items-center py-8 bg-wa-panel">
        <div className="w-24 h-24 rounded-full bg-wa-teal/20 flex items-center justify-center overflow-hidden mb-4">
          {avatar ? (
            <img src={avatar} alt={name} className="w-full h-full object-cover" />
          ) : (
            <span className="text-wa-teal font-bold text-3xl">{isGroup ? '👥' : name?.[0]?.toUpperCase()}</span>
          )}
        </div>
        <h3 className="text-xl font-semibold text-wa-text">{name}</h3>
        <p className="text-sm text-wa-text-sec mt-1">
          {isGroup ? `Group · ${activeChat.participants?.length} members` : isOnline ? 'online' : lastSeen ? `last seen ${formatLastSeen(lastSeen)}` : 'offline'}
        </p>
      </div>

      <div className="h-2 bg-wa-bg" />

      {/* About */}
      {!isGroup && (
        <>
          <div className="px-6 py-4 bg-wa-panel">
            <p className="text-xs text-wa-text-sec mb-1">About</p>
            <p className="text-sm text-wa-text">{about}</p>
          </div>
          <div className="h-2 bg-wa-bg" />
        </>
      )}

      {/* Media, Links, Docs */}
      <div className="bg-wa-panel">
        <div className="flex items-center justify-between px-6 py-3">
          <p className="text-sm text-wa-text-sec">Media, links and docs</p>
          <span className="text-xs text-wa-text-sec">{mediaItems.length}</span>
        </div>
        {!loading && images.length > 0 && (
          <div className="px-6 pb-3 flex gap-2 overflow-x-auto">
            {images.slice(0, 6).map((item, i) => (
              <div key={i} className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-wa-input">
                <img src={item.media?.url || item.media?.thumbnail} alt="" className="w-full h-full object-cover" />
              </div>
            ))}
            {images.length > 6 && (
              <div className="w-20 h-20 rounded-lg bg-wa-input flex items-center justify-center flex-shrink-0">
                <span className="text-wa-text-sec text-sm">+{images.length - 6}</span>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="h-2 bg-wa-bg" />

      {/* Starred Messages */}
      <div className="bg-wa-panel">
        <button className="w-full flex items-center justify-between px-6 py-4 hover:bg-wa-input transition">
          <div className="flex items-center gap-4">
            <span className="text-wa-icon">⭐</span>
            <span className="text-sm text-wa-text">Starred messages</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-wa-text-sec">{starredCount}</span>
            <svg className="w-4 h-4 text-wa-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          </div>
        </button>
      </div>

      <div className="h-2 bg-wa-bg" />

      {/* Disappearing messages */}
      <div className="bg-wa-panel">
        <button className="w-full flex items-center justify-between px-6 py-4 hover:bg-wa-input transition">
          <div className="flex items-center gap-4">
            <span className="text-wa-icon">⏱️</span>
            <div>
              <span className="text-sm text-wa-text block">Disappearing messages</span>
              <span className="text-xs text-wa-text-sec">{activeChat?.disappearingMessages === 'off' ? 'Off' : activeChat?.disappearingMessages}</span>
            </div>
          </div>
          <svg className="w-4 h-4 text-wa-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
        </button>
      </div>

      <div className="h-2 bg-wa-bg" />

      {/* Actions */}
      {!isGroup && (
        <div className="bg-wa-panel">
          <button onClick={handleBlock} className="w-full flex items-center gap-4 px-6 py-4 hover:bg-wa-input transition">
            <span className="text-wa-danger">🚫</span>
            <span className="text-sm text-wa-danger">Block {name}</span>
          </button>
          <button className="w-full flex items-center gap-4 px-6 py-4 hover:bg-wa-input transition">
            <span className="text-wa-danger">👎</span>
            <span className="text-sm text-wa-danger">Report {name}</span>
          </button>
        </div>
      )}

      <div className="h-8 bg-wa-bg" />
    </div>
  );
}
