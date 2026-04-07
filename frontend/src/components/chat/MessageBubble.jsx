import { useState, useRef, useEffect } from 'react';
import { useAuthStore } from 'store/useAuthStore';
import { useSocket } from 'contexts/SocketContext';
import { formatTime, formatFileSize, formatDuration } from 'utils/formatTime';
import { EMOJI_LIST } from 'utils/constants';

export default function MessageBubble({ message, prevMessage, onReply, onEdit, onOpenMedia, onJumpToReply, isHighlighted, searchQuery }) {
  const { user } = useAuthStore();
  const socket = useSocket();
  const [showMenu, setShowMenu] = useState(false);
  const [showReactions, setShowReactions] = useState(false);
  const [voicePlaying, setVoicePlaying] = useState(false);
  const [voiceSpeed, setVoiceSpeed] = useState(1);
  const [voiceProgress, setVoiceProgress] = useState(0);
  const audioRef = useRef(null);
  const longPressTimer = useRef(null);
  const isOwn = message.sender?._id === user?._id;
  const isSystem = message.type === 'system';

  if (message.isDeleted) return null;

  // System messages
  if (isSystem) {
    return (
      <div className="flex justify-center my-2" id={`msg-${message._id}`}>
        <span className="bg-wa-panel/90 text-wa-text-sec text-xs px-3 py-1.5 rounded-lg shadow-sm backdrop-blur-sm">
          {message.isDeletedForEveryone ? '🚫 This message was deleted' : message.content}
        </span>
      </div>
    );
  }

  const showTail = !prevMessage || prevMessage.sender?._id !== message.sender?._id ||
    prevMessage.type === 'system' ||
    (new Date(message.createdAt) - new Date(prevMessage.createdAt)) > 60000;

  // Reactions
  const handleReact = (emoji) => {
    socket?.emit('message:react', { messageId: message._id, chatId: message.chat?._id || message.chat, emoji });
    setShowReactions(false);
  };

  // Delete
  const handleDelete = (forEveryone) => {
    socket?.emit('message:delete', { messageId: message._id, chatId: message.chat?._id || message.chat, deleteForEveryone: forEveryone });
    setShowMenu(false);
  };

  // Star
  const handleStar = () => {
    socket?.emit('message:star', { messageId: message._id, star: !message.isStarred?.includes(user._id) });
    setShowMenu(false);
  };

  // Forward (simplified - copies to clipboard)
  const handleCopy = () => {
    if (message.content) navigator.clipboard?.writeText(message.content);
    setShowMenu(false);
  };

  // Long press
  const handlePointerDown = () => {
    longPressTimer.current = setTimeout(() => setShowMenu(true), 500);
  };
  const handlePointerUp = () => {
    clearTimeout(longPressTimer.current);
  };

  // Poll vote
  const handlePollVote = (optionIndex) => {
    socket?.emit('message:poll-vote', { messageId: message._id, chatId: message.chat?._id || message.chat, optionIndex });
  };

  // ─── Tick rendering ───
  const renderTicks = () => {
    if (!isOwn) return null;

    // Optimistic message (not yet confirmed by server)
    if (message._status === 'sending' || (message._id && message._id.startsWith('temp_'))) {
      return (
        <span className="ml-1 text-[10px] text-wa-text-sec">
          <svg className="w-3 h-3 inline animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        </span>
      );
    }

    const statusMap = message.status || {};
    const recipients = Object.keys(statusMap).filter(k => k !== user._id);
    const allRead = recipients.length > 0 && recipients.every(k => statusMap[k]?.read);
    const allDelivered = recipients.length > 0 && recipients.every(k => statusMap[k]?.delivered);

    if (allRead) {
      return <span className="ml-1 text-[10px] text-wa-read">✓✓</span>;
    }
    if (allDelivered) {
      return <span className="ml-1 text-[10px] text-wa-text-sec">✓✓</span>;
    }
    return <span className="ml-1 text-[10px] text-wa-text-sec">✓</span>;
  };

  // ─── Highlight search query ───
  const highlightText = (text) => {
    if (!searchQuery || !text) return text;
    const regex = new RegExp(`(${searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    return parts.map((part, i) =>
      regex.test(part) ? <mark key={i} className="bg-yellow-400/40 text-inherit rounded px-0.5">{part}</mark> : part
    );
  };

  // ─── Voice note playback ───
  const toggleVoicePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (voicePlaying) {
      audio.pause();
    } else {
      audio.playbackRate = voiceSpeed;
      audio.play();
    }
    setVoicePlaying(!voicePlaying);
  };

  const cycleSpeed = () => {
    const speeds = [1, 1.5, 2];
    const next = speeds[(speeds.indexOf(voiceSpeed) + 1) % speeds.length];
    setVoiceSpeed(next);
    if (audioRef.current) audioRef.current.playbackRate = next;
  };

  // ─── Content renderers ───
  const renderContent = () => {
    switch (message.type) {
      case 'image':
        return (
          <div className="mb-1 -mx-1 -mt-0.5">
            <img
              src={message.media?.url}
              alt=""
              loading="lazy"
              className="rounded-lg max-w-[280px] max-h-[300px] object-cover cursor-pointer hover:opacity-95 transition bg-wa-input"
              onClick={() => onOpenMedia?.(message.media)}
            />
            {message.content && <p className="mt-1.5 mx-1 text-sm whitespace-pre-wrap">{highlightText(message.content)}</p>}
          </div>
        );

      case 'video':
        return (
          <div className="mb-1 -mx-1 -mt-0.5 relative">
            <video
              src={message.media?.url}
              className="rounded-lg max-w-[280px] max-h-[300px] cursor-pointer"
              onClick={() => onOpenMedia?.(message.media)}
            />
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-12 h-12 bg-black/50 rounded-full flex items-center justify-center backdrop-blur-sm">
                <svg className="w-6 h-6 text-white ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
              </div>
            </div>
            {message.media?.duration && (
              <span className="absolute bottom-2 right-2 text-xs text-white bg-black/50 px-2 py-0.5 rounded">
                {formatDuration(message.media.duration)}
              </span>
            )}
            {message.content && <p className="mt-1.5 mx-1 text-sm">{highlightText(message.content)}</p>}
          </div>
        );

      case 'voice':
      case 'audio':
        return (
          <div className="flex items-center gap-3 min-w-[240px] py-1">
            {/* Play/Pause button */}
            <button onClick={toggleVoicePlay} className="w-9 h-9 rounded-full bg-wa-teal flex items-center justify-center flex-shrink-0 text-white">
              {voicePlaying ? (
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
              ) : (
                <svg className="w-4 h-4 ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
              )}
            </button>

            {/* Waveform */}
            <div className="flex-1">
              <div className="voice-waveform">
                {Array.from({ length: 25 }, (_, i) => {
                  const h = 6 + Math.sin(i * 0.6) * 10 + Math.random() * 6;
                  const filled = voiceProgress > (i / 25) * 100;
                  return (
                    <div
                      key={i}
                      className="voice-waveform-bar"
                      style={{
                        height: `${Math.max(4, h)}px`,
                        opacity: filled ? 1 : 0.4
                      }}
                    />
                  );
                })}
              </div>
              <div className="flex items-center justify-between mt-0.5">
                <span className="text-[10px] text-wa-text-sec">
                  {message.media?.duration ? formatDuration(message.media.duration) : '0:00'}
                </span>
                <button onClick={cycleSpeed} className="text-[10px] text-wa-teal font-bold">
                  {voiceSpeed}x
                </button>
              </div>
            </div>

            {/* Hidden audio element */}
            <audio
              ref={audioRef}
              src={message.media?.url}
              onTimeUpdate={(e) => {
                const pct = (e.target.currentTime / e.target.duration) * 100;
                setVoiceProgress(pct || 0);
              }}
              onEnded={() => { setVoicePlaying(false); setVoiceProgress(0); }}
            />
          </div>
        );

      case 'document': {
        let dlUrl = message.media?.url || '';
        if (dlUrl.includes('cloudinary.com') && dlUrl.includes('/upload/')) {
          dlUrl = dlUrl.replace('/upload/', '/upload/fl_attachment/');
        }
        return (
          <a href={dlUrl} download target="_blank" rel="noreferrer"
            className="flex items-center gap-3 bg-black/10 rounded-lg p-3 min-w-[220px] hover:bg-black/15 transition">
            <div className="w-10 h-10 bg-wa-teal/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-xl">📄</span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium truncate">{message.media?.filename || 'Document'}</p>
              <p className="text-xs text-wa-text-sec">{formatFileSize(message.media?.filesize)}</p>
            </div>
            <span className="text-wa-icon text-lg flex-shrink-0">⬇️</span>
          </a>
        );
      }

      case 'contact':
        return (
          <div className="bg-black/10 rounded-lg p-3 min-w-[200px]">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-wa-teal/20 rounded-full flex items-center justify-center">
                <span className="text-lg">👤</span>
              </div>
              <div>
                <p className="text-sm font-medium">{message.contact?.name || 'Contact'}</p>
                <p className="text-xs text-wa-text-sec">{message.contact?.phone}</p>
              </div>
            </div>
            <button className="w-full text-center text-sm text-wa-teal py-1.5 border-t border-wa-border/30 hover:bg-black/5 transition">
              Add to contacts
            </button>
          </div>
        );

      case 'location':
        return (
          <div className="min-w-[220px]">
            <div className="bg-wa-input rounded-lg p-4 text-center">
              <span className="text-3xl mb-2 block">📍</span>
              <p className="text-sm">{message.location?.address || 'Location shared'}</p>
              {message.location?.isLive && (
                <span className="text-xs text-wa-teal font-medium mt-1 block">● Live location</span>
              )}
            </div>
          </div>
        );

      case 'poll':
        return renderPoll();

      case 'gif':
        return (
          <div className="mb-1 -mx-1 -mt-0.5">
            <img
              src={message.media?.url}
              alt="GIF"
              className="rounded-lg max-w-[250px] max-h-[250px] object-cover"
              onClick={() => onOpenMedia?.(message.media)}
            />
          </div>
        );

      case 'sticker':
        return (
          <div className="p-1">
            <img
              src={message.media?.url}
              alt="Sticker"
              className="w-36 h-36 object-contain"
            />
          </div>
        );

      default:
        return (
          <div>
            {/* Link preview */}
            {message.linkPreview?.title && (
              <a href={message.linkPreview.url} target="_blank" rel="noreferrer"
                className="block bg-black/10 rounded-lg overflow-hidden mb-2 hover:bg-black/15 transition">
                {message.linkPreview.image && (
                  <img src={message.linkPreview.image} alt="" className="w-full h-32 object-cover" />
                )}
                <div className="p-2">
                  <p className="text-sm font-medium truncate">{message.linkPreview.title}</p>
                  <p className="text-xs text-wa-text-sec line-clamp-2">{message.linkPreview.description}</p>
                  <p className="text-xs text-wa-teal mt-1 truncate">{message.linkPreview.url}</p>
                </div>
              </a>
            )}
            <p className="text-sm whitespace-pre-wrap break-words leading-relaxed">{highlightText(message.content)}</p>
          </div>
        );
    }
  };

  // ─── Poll renderer ───
  const renderPoll = () => {
    if (!message.poll) return null;
    const totalVotes = message.poll.options.reduce((sum, opt) => sum + (opt.votes?.length || 0), 0);
    const userVotedIndex = message.poll.options.findIndex(opt => opt.votes?.some(v => v === user._id || v?._id === user._id));

    return (
      <div className="min-w-[250px]">
        <p className="text-sm font-semibold mb-3">📊 {message.poll.question}</p>
        <div className="space-y-2">
          {message.poll.options.map((opt, i) => {
            const voteCount = opt.votes?.length || 0;
            const pct = totalVotes > 0 ? Math.round((voteCount / totalVotes) * 100) : 0;
            const isVoted = i === userVotedIndex;

            return (
              <button
                key={i}
                onClick={() => handlePollVote(i)}
                className={`poll-option w-full text-left ${isVoted ? 'voted' : ''}`}
              >
                <div className="poll-option-fill" style={{ width: `${pct}%` }} />
                <div className="relative flex items-center justify-between">
                  <span className="text-sm">{opt.text}</span>
                  <span className="text-xs text-wa-text-sec ml-2">{pct}%</span>
                </div>
                {isVoted && <span className="absolute right-2 top-1/2 -translate-y-1/2 text-wa-teal text-xs">✓</span>}
              </button>
            );
          })}
        </div>
        <p className="text-xs text-wa-text-sec mt-2">{totalVotes} vote{totalVotes !== 1 ? 's' : ''}</p>
      </div>
    );
  };

  return (
    <div
      id={`msg-${message._id}`}
      className={`flex ${isOwn ? 'justify-end' : 'justify-start'} group relative mb-0.5 ${isHighlighted ? 'message-highlight rounded-lg' : ''}`}
      onContextMenu={e => { e.preventDefault(); setShowMenu(true); }}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
    >
      <div className={`relative max-w-[75%] md:max-w-[65%] rounded-lg px-2.5 py-1.5 shadow-sm
        ${isOwn ? 'bg-wa-bubble text-wa-text' : 'bg-wa-bubble2 text-wa-text'}
        ${showTail ? (isOwn ? 'bubble-tail-right mr-2' : 'bubble-tail-left ml-2') : ''}
        ${message.type === 'sticker' ? '!bg-transparent !shadow-none' : ''}
      `}>
        {/* Sender name (group or first message) */}
        {(!isOwn && message.sender && showTail) && (
          <p className="text-xs text-wa-teal font-semibold mb-0.5">{message.sender.name}</p>
        )}

        {/* Reply preview */}
        {message.replyTo && (
          <button
            onClick={() => onJumpToReply?.(message.replyTo?._id)}
            className="w-full bg-black/10 rounded-md px-3 py-1.5 mb-1 border-l-4 border-wa-teal text-left hover:bg-black/15 transition"
          >
            <p className="text-xs text-wa-teal font-medium">{message.replyTo?.sender?.name}</p>
            <p className="text-xs text-wa-text-sec truncate">
              {message.replyTo?.content || (message.replyTo?.type === 'image' ? '📷 Photo' : message.replyTo?.type === 'video' ? '🎥 Video' : message.replyTo?.type === 'document' ? '📄 Document' : message.replyTo?.type === 'audio' || message.replyTo?.type === 'voice' ? '🎤 Audio' : 'Message')}
            </p>
          </button>
        )}

        {/* Forwarded label */}
        {message.isForwarded && (
          <p className="text-xs text-wa-text-sec italic mb-0.5 flex items-center gap-1">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
            Forwarded
          </p>
        )}

        {/* Message content */}
        {renderContent()}

        {/* Timestamp + ticks */}
        {message.type !== 'sticker' && (
          <div className="flex items-center justify-end gap-1 -mb-0.5 mt-0.5">
            {message.isStarred?.includes(user?._id) && <span className="text-[10px]">⭐</span>}
            {message.isEdited && <span className="text-[10px] text-wa-text-sec italic">edited</span>}
            <span className="text-[10px] text-wa-text-sec">{formatTime(message.createdAt)}</span>
            {renderTicks()}
          </div>
        )}

        {/* Reactions */}
        {message.reactions?.length > 0 && (
          <div className="absolute -bottom-3 left-2 flex bg-wa-panel rounded-full px-1.5 py-0.5 shadow-md border border-wa-border cursor-pointer z-10"
            onClick={() => setShowReactions(!showReactions)}>
            {[...new Set(message.reactions.map(r => r.emoji))].map(e => (
              <span key={e} className="text-xs">{e}</span>
            ))}
            <span className="text-[10px] text-wa-text-sec ml-1">{message.reactions.length}</span>
          </div>
        )}

        {/* Hover action bar */}
        <div className="absolute top-1 right-1 hidden group-hover:flex bg-wa-panel/90 rounded-md shadow-md border border-wa-border backdrop-blur-sm z-10">
          <button onClick={() => setShowReactions(!showReactions)} className="p-1.5 hover:bg-wa-input rounded text-xs transition" title="React">😊</button>
          <button onClick={() => setShowMenu(!showMenu)} className="p-1.5 hover:bg-wa-input rounded text-xs transition">▾</button>
        </div>
      </div>

      {/* Reaction picker */}
      {showReactions && (
        <div className={`absolute ${isOwn ? 'right-0' : 'left-0'} top-0 -translate-y-full bg-wa-panel rounded-full px-2 py-1.5 shadow-xl border border-wa-border flex gap-1.5 z-30 animate-bounce-in`}>
          {EMOJI_LIST.map(e => (
            <button key={e} onClick={() => handleReact(e)} className="hover:scale-125 transition text-lg hover:bg-wa-input rounded-full p-0.5">{e}</button>
          ))}
        </div>
      )}

      {/* Context menu */}
      {showMenu && (
        <div
          className={`absolute ${isOwn ? 'right-0' : 'left-0'} top-full mt-1 bg-wa-panel rounded-lg shadow-xl border border-wa-border py-1 w-44 z-30 animate-slide-up`}
          onMouseLeave={() => setShowMenu(false)}
        >
          <button onClick={() => { onReply(); setShowMenu(false); }} className="w-full text-left px-3 py-2 text-sm hover:bg-wa-input text-wa-text transition flex items-center gap-2">
            <span className="text-base">↩</span> Reply
          </button>
          <button onClick={() => { setShowReactions(true); setShowMenu(false); }} className="w-full text-left px-3 py-2 text-sm hover:bg-wa-input text-wa-text transition flex items-center gap-2">
            <span className="text-base">😊</span> React
          </button>
          <button onClick={handleStar} className="w-full text-left px-3 py-2 text-sm hover:bg-wa-input text-wa-text transition flex items-center gap-2">
            <span className="text-base">⭐</span> {message.isStarred?.includes(user._id) ? 'Unstar' : 'Star'}
          </button>
          {message.type === 'text' && (
            <button onClick={handleCopy} className="w-full text-left px-3 py-2 text-sm hover:bg-wa-input text-wa-text transition flex items-center gap-2">
              <span className="text-base">📋</span> Copy
            </button>
          )}
          {isOwn && (
            <>
              <button onClick={() => { onEdit(); setShowMenu(false); }} className="w-full text-left px-3 py-2 text-sm hover:bg-wa-input text-wa-text transition flex items-center gap-2">
                <span className="text-base">✏️</span> Edit
              </button>
              <button onClick={() => handleDelete(true)} className="w-full text-left px-3 py-2 text-sm hover:bg-wa-input text-wa-danger transition flex items-center gap-2">
                <span className="text-base">🗑️</span> Delete for everyone
              </button>
            </>
          )}
          <button onClick={() => handleDelete(false)} className="w-full text-left px-3 py-2 text-sm hover:bg-wa-input text-wa-text-sec transition flex items-center gap-2">
            <span className="text-base">🗑️</span> Delete for me
          </button>
        </div>
      )}
    </div>
  );
}
