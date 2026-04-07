import { useAuthStore } from 'store/useAuthStore';
import { useChatStore } from 'store/useChatStore';
import { formatTime } from 'utils/formatTime';

export default function ChatListItem({ chat, isActive, onClick }) {
  const { user } = useAuthStore();
  const { onlineUsers, typing } = useChatStore();
  const isGroup = chat.type === 'group';
  const otherUser = !isGroup ? chat.participants?.find(p => p._id !== user?._id) : null;
  const name = isGroup ? chat.groupInfo?.name : otherUser?.name || 'Unknown';
  const avatar = isGroup ? chat.groupInfo?.avatar : otherUser?.avatar;
  const isOnline = otherUser ? (onlineUsers[otherUser._id]?.isOnline || otherUser.isOnline) : false;
  const unread = chat.unreadCount?.[user?._id] || 0;
  const isTypingHere = [...(typing[chat._id] || [])].length > 0;
  const lastMsg = chat.lastMessage;
  let preview = '';
  if (isTypingHere) preview = 'typing...';
  else if (lastMsg) {
    const senderName = lastMsg.sender?._id === user?._id ? 'You' : lastMsg.sender?.name?.split(' ')[0];
    if (lastMsg.type === 'system') preview = lastMsg.content;
    else if (lastMsg.type === 'image') preview = '📷 Photo';
    else if (lastMsg.type === 'video') preview = '🎥 Video';
    else if (lastMsg.type === 'audio' || lastMsg.type === 'voice') preview = '🎤 Audio';
    else if (lastMsg.type === 'document') preview = '📄 Document';
    else preview = lastMsg.content || '';
    if (isGroup && lastMsg.type !== 'system') preview = `${senderName}: ${preview}`;
  }

  return (
    <div onClick={onClick} className={`flex items-center gap-3 px-3 py-3 cursor-pointer transition hover:bg-wa-panel/80 ${isActive ? 'bg-wa-input' : ''}`}>
      <div className="relative flex-shrink-0">
        <div className="w-12 h-12 rounded-full bg-wa-teal/20 flex items-center justify-center overflow-hidden">
          {avatar ? <img src={avatar} alt={name} className="w-full h-full object-cover" /> :
            <span className="text-wa-teal font-bold text-lg">{isGroup ? '👥' : name?.[0]?.toUpperCase()}</span>}
        </div>
        {isOnline && !isGroup && <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-wa-green rounded-full border-2 border-wa-bg" />}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <span className="font-medium text-wa-text truncate">{name}</span>
          <span className={`text-xs flex-shrink-0 ${unread > 0 ? 'text-wa-unread' : 'text-wa-text-sec'}`}>{lastMsg ? formatTime(lastMsg.createdAt || chat.updatedAt) : ''}</span>
        </div>
        <div className="flex items-center justify-between mt-0.5">
          <p className={`text-sm truncate ${isTypingHere ? 'text-wa-teal' : 'text-wa-text-sec'}`}>{preview || 'Start a conversation'}</p>
          {unread > 0 && <span className="bg-wa-unread text-white text-xs rounded-full min-w-[20px] h-5 flex items-center justify-center px-1.5 font-medium ml-2">{unread > 99 ? '99+' : unread}</span>}
        </div>
      </div>
    </div>
  );
}
