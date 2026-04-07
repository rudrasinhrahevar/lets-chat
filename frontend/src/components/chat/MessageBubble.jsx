import { useState } from 'react';
import { useAuthStore } from 'store/useAuthStore';
import { useSocket } from 'contexts/SocketContext';
import { formatTime, formatFileSize } from 'utils/formatTime';
import { EMOJI_LIST } from 'utils/constants';

export default function MessageBubble({ message, prevMessage, onReply, onEdit }) {
  const { user } = useAuthStore();
  const socket = useSocket();
  const [showMenu, setShowMenu] = useState(false);
  const [showReactions, setShowReactions] = useState(false);
  const isOwn = message.sender?._id === user?._id;
  const isSystem = message.type === 'system';

  if (message.isDeleted) return null;

  if (isSystem) {
    return (
      <div className="flex justify-center my-2">
        <span className="bg-wa-panel/80 text-wa-text-sec text-xs px-3 py-1 rounded-lg shadow-sm">
          {message.isDeletedForEveryone ? '🚫 This message was deleted' : message.content}
        </span>
      </div>
    );
  }

  const handleReact = (emoji) => {
    socket?.emit('message:react', { messageId: message._id, chatId: message.chat?._id || message.chat, emoji });
    setShowReactions(false);
  };

  const handleDelete = (forEveryone) => {
    socket?.emit('message:delete', { messageId: message._id, chatId: message.chat?._id || message.chat, deleteForEveryone: forEveryone });
    setShowMenu(false);
  };

  const handleStar = () => {
    socket?.emit('message:star', { messageId: message._id, star: !message.isStarred?.includes(user._id) });
    setShowMenu(false);
  };

  const renderTicks = () => {
    if (!isOwn) return null;
    const statusMap = message.status || {};
    const recipients = Object.keys(statusMap).filter(k => k !== user._id);
    const allRead = recipients.length > 0 && recipients.every(k => statusMap[k]?.read);
    const allDelivered = recipients.length > 0 && recipients.every(k => statusMap[k]?.delivered);
    return <span className={`ml-1 text-xs ${allRead ? 'text-wa-read' : 'text-wa-text-sec'}`}>{allRead ? '✓✓' : allDelivered ? '✓✓' : '✓'}</span>;
  };

  const renderContent = () => {
    switch (message.type) {
      case 'image':
        return (<div className="mb-1"><img src={message.media?.url} alt="" className="rounded-lg max-w-[280px] max-h-[300px] object-cover cursor-pointer" onClick={() => window.open(message.media?.url)} />{message.content && <p className="mt-1 text-sm">{message.content}</p>}</div>);
      case 'video':
        return (<div className="mb-1"><video src={message.media?.url} controls className="rounded-lg max-w-[280px] max-h-[300px]" />{message.content && <p className="mt-1 text-sm">{message.content}</p>}</div>);
      case 'audio': case 'voice':
        return (<div className="flex items-center gap-3 min-w-[200px]"><audio src={message.media?.url} controls className="w-full h-8" /></div>);
      case 'document': {
        let dlUrl = message.media?.url || '';
        if (dlUrl.includes('cloudinary.com') && dlUrl.includes('/upload/')) {
          dlUrl = dlUrl.replace('/upload/', '/upload/fl_attachment/');
        }
        return (<a href={dlUrl} download target="_blank" rel="noreferrer" className="flex items-center gap-3 bg-black/10 rounded-lg p-3 min-w-[200px] hover:bg-black/20 transition"><span className="text-2xl">📄</span><div className="min-w-0 flex-1"><p className="text-sm font-medium truncate">{message.media?.filename || 'Document'}</p><p className="text-xs text-wa-text-sec">{formatFileSize(message.media?.filesize)}</p></div><span className="text-wa-icon">⬇️</span></a>);
      }
      case 'location':
        return (<div className="min-w-[200px]"><div className="bg-wa-input rounded-lg p-3 text-center">📍 {message.location?.address || 'Location shared'}</div></div>);
      default:
        return <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>;
    }
  };

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} group relative`} onContextMenu={e => { e.preventDefault(); setShowMenu(true); }}>
      <div className={`relative max-w-[75%] md:max-w-[65%] rounded-lg px-3 py-1.5 shadow-sm ${isOwn ? 'bg-wa-bubble text-wa-text' : 'bg-wa-bubble2 text-wa-text'}`}>
        {(!isOwn && message.sender && prevMessage?.sender?._id !== message.sender?._id) && <p className="text-xs text-wa-teal font-semibold mb-0.5">{message.sender.name}</p>}
        {message.replyTo && (
          <div className="bg-black/10 rounded-md px-3 py-1.5 mb-1 border-l-4 border-wa-teal">
            <p className="text-xs text-wa-teal font-medium">{message.replyTo?.sender?.name}</p>
            <p className="text-xs text-wa-text-sec truncate">
              {message.replyTo?.content || (message.replyTo?.type === 'image' ? '📷 Photo' : message.replyTo?.type === 'video' ? '🎥 Video' : message.replyTo?.type === 'document' ? '📄 Document' : message.replyTo?.type === 'audio' ? '🎵 Audio' : 'Message')}
            </p>
          </div>
        )}
        {message.isForwarded && <p className="text-xs text-wa-text-sec italic mb-0.5">↪ Forwarded</p>}
        {renderContent()}
        <div className="flex items-center justify-end gap-1 -mb-0.5 mt-0.5">
          {message.isEdited && <span className="text-[10px] text-wa-text-sec italic">edited</span>}
          <span className="text-[10px] text-wa-text-sec">{formatTime(message.createdAt)}</span>
          {renderTicks()}
        </div>
        {message.reactions?.length > 0 && (<div className="absolute -bottom-3 left-2 flex bg-wa-panel rounded-full px-1.5 py-0.5 shadow-md border border-wa-border">{[...new Set(message.reactions.map(r => r.emoji))].map(e => <span key={e} className="text-xs">{e}</span>)}<span className="text-[10px] text-wa-text-sec ml-1">{message.reactions.length}</span></div>)}
        <div className="absolute top-1 right-1 hidden group-hover:flex bg-wa-panel rounded-md shadow-md border border-wa-border">
          <button onClick={() => setShowReactions(!showReactions)} className="p-1 hover:bg-wa-input rounded text-xs" title="React">😊</button>
          <button onClick={() => setShowMenu(!showMenu)} className="p-1 hover:bg-wa-input rounded text-xs">▾</button>
        </div>
      </div>
      {showReactions && (<div className={`absolute ${isOwn ? 'right-0' : 'left-0'} top-0 -translate-y-full bg-wa-panel rounded-full px-2 py-1 shadow-xl border border-wa-border flex gap-1 z-10`}>{EMOJI_LIST.map(e => <button key={e} onClick={() => handleReact(e)} className="hover:scale-125 transition text-lg">{e}</button>)}</div>)}
      {showMenu && (<div className={`absolute ${isOwn ? 'right-0' : 'left-0'} top-full mt-1 bg-wa-panel rounded-lg shadow-xl border border-wa-border py-1 w-40 z-20`} onMouseLeave={() => setShowMenu(false)}>
        <button onClick={() => { onReply(); setShowMenu(false); }} className="w-full text-left px-3 py-1.5 text-sm hover:bg-wa-input text-wa-text">↩ Reply</button>
        <button onClick={() => { setShowReactions(true); setShowMenu(false); }} className="w-full text-left px-3 py-1.5 text-sm hover:bg-wa-input text-wa-text">😊 React</button>
        <button onClick={handleStar} className="w-full text-left px-3 py-1.5 text-sm hover:bg-wa-input text-wa-text">⭐ Star</button>
        {isOwn && (<><button onClick={() => { onEdit(); setShowMenu(false); }} className="w-full text-left px-3 py-1.5 text-sm hover:bg-wa-input text-wa-text">✏️ Edit</button><button onClick={() => handleDelete(true)} className="w-full text-left px-3 py-1.5 text-sm hover:bg-wa-input text-wa-danger">🗑️ Delete for all</button></>)}
        <button onClick={() => handleDelete(false)} className="w-full text-left px-3 py-1.5 text-sm hover:bg-wa-input text-wa-text-sec">🗑️ Delete for me</button>
      </div>)}
    </div>
  );
}
