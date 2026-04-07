import { useState, useEffect, useRef, useCallback } from 'react';
import { useChatStore } from 'store/useChatStore';
import { useAuthStore } from 'store/useAuthStore';
import { useSocket, useConnectionState } from 'contexts/SocketContext';
import api from 'services/api';
import MessageBubble from 'components/chat/MessageBubble';
import ChatInput from 'components/chat/ChatInput';
import ChatHeaderBar from 'components/chat/ChatHeaderBar';
import ContactInfoPanel from 'components/chat/ContactInfoPanel';
import MediaViewer from 'components/chat/MediaViewer';
import { formatDate } from 'utils/formatTime';

export default function ChatWindow() {
  const {
    activeChat, messages, historyLoaded, pagination, typing, recording,
    loadMessages, setPagination, highlightMessageId, newMessagesCount, resetNewMessages
  } = useChatStore();
  const { user } = useAuthStore();
  const socket = useSocket();
  const connectionState = useConnectionState();

  const messagesEndRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const [replyTo, setReplyTo] = useState(null);
  const [editMsg, setEditMsg] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const [showContactInfo, setShowContactInfo] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchIndex, setSearchIndex] = useState(0);
  const [mediaViewer, setMediaViewer] = useState(null);
  const [isNearBottom, setIsNearBottom] = useState(true);

  const chatId = activeChat?._id;
  const chatMessages = messages[chatId] || [];
  const isHistoryLoaded = historyLoaded[chatId];
  const typingUsers = [...(typing[chatId] || [])];
  const isTyping = typingUsers.length > 0;
  const recordingUsers = [...(recording[chatId] || [])];
  const isRecording = recordingUsers.length > 0;
  const chatPagination = pagination[chatId];
  const unreadCount = activeChat?.unreadCount?.[user?._id] || 0;
  const newMsgCount = newMessagesCount[chatId] || 0;

  // Fetch messages
  const fetchMessages = useCallback(async () => {
    if (!chatId || isHistoryLoaded) return;
    setLoading(true);
    try {
      const { data } = await api.get(`/messages/${chatId}`);
      loadMessages(chatId, data.data);
      setPagination(chatId, data.pagination);
    } catch (err) {
      console.error('Load messages failed:', err);
    }
    setLoading(false);
  }, [chatId, isHistoryLoaded, loadMessages, setPagination]);

  useEffect(() => { fetchMessages(); }, [fetchMessages]);

  // Mark as read
  useEffect(() => {
    if (activeChat && chatMessages.length > 0) {
      socket?.emit('message:read', { chatId: activeChat._id });
      resetNewMessages(activeChat._id);
    }
  }, [activeChat, chatMessages.length, socket, resetNewMessages]);

  // Auto-scroll to bottom only if near bottom
  useEffect(() => {
    if (isNearBottom) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages.length, isNearBottom]);

  // Scroll to highlighted message
  useEffect(() => {
    if (highlightMessageId) {
      const el = document.getElementById(`msg-${highlightMessageId}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [highlightMessageId]);

  // Load older messages
  const loadOlderMessages = useCallback(async () => {
    if (!chatPagination?.hasMore || loadingMore) return;
    setLoadingMore(true);
    const container = scrollContainerRef.current;
    const prevScrollHeight = container?.scrollHeight || 0;
    try {
      const cursor = chatPagination.nextCursor;
      const { data } = await api.get(`/messages/${chatId}?cursor=${cursor}`);
      loadMessages(chatId, data.data, true);
      setPagination(chatId, data.pagination);
      // Maintain scroll position
      requestAnimationFrame(() => {
        if (container) {
          container.scrollTop = container.scrollHeight - prevScrollHeight;
        }
      });
    } catch (err) {
      console.error('Load more failed:', err);
    }
    setLoadingMore(false);
  }, [chatPagination, loadingMore, chatId, loadMessages, setPagination]);

  // Scroll handler
  const handleScroll = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) return;
    const { scrollTop, scrollHeight, clientHeight } = container;
    const nearBottom = scrollHeight - scrollTop - clientHeight < 100;
    setIsNearBottom(nearBottom);
    setShowScrollBtn(!nearBottom);

    // Load more messages at top
    if (scrollTop < 50 && chatPagination?.hasMore && !loadingMore) {
      loadOlderMessages();
    }
  }, [chatPagination, loadingMore, loadOlderMessages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    resetNewMessages(chatId);
  };

  // Search in chat
  const handleSearch = useCallback(async (query) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    try {
      const { data } = await api.get(`/messages/search?q=${encodeURIComponent(query)}&chatId=${chatId}`);
      setSearchResults(data.data || []);
      setSearchIndex(0);
    } catch {}
  }, [chatId]);

  const navigateSearch = (direction) => {
    if (searchResults.length === 0) return;
    let newIndex = searchIndex + direction;
    if (newIndex < 0) newIndex = searchResults.length - 1;
    if (newIndex >= searchResults.length) newIndex = 0;
    setSearchIndex(newIndex);
    const msgId = searchResults[newIndex]._id;
    useChatStore.getState().setHighlightMessage(msgId);
    const el = document.getElementById(`msg-${msgId}`);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  // Open media viewer
  const handleOpenMedia = (mediaData) => {
    const allMediaMessages = chatMessages.filter(m => ['image', 'video'].includes(m.type) && m.media?.url);
    const allMediaItems = allMediaMessages.map(m => m.media);
    setMediaViewer({ media: mediaData, allMedia: allMediaItems });
  };

  // Reply jump-to
  const handleJumpToReply = (messageId) => {
    useChatStore.getState().setHighlightMessage(messageId);
    const el = document.getElementById(`msg-${messageId}`);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  // Render date separators
  const renderDateSeparator = (date) => (
    <div className="date-separator">
      <span>{formatDate(date)}</span>
    </div>
  );

  // Determine unread divider position
  const getUnreadDividerIndex = () => {
    if (unreadCount <= 0) return -1;
    return chatMessages.length - unreadCount;
  };
  const unreadDividerIndex = getUnreadDividerIndex();

  return (
    <div className="flex flex-col h-full relative">
      {/* Header */}
      <ChatHeaderBar
        onOpenContactInfo={() => setShowContactInfo(true)}
        onOpenSearch={() => setShowSearch(!showSearch)}
      />

      {/* Connection status banner */}
      {connectionState !== 'connected' && (
        <div className={`flex items-center justify-center gap-2 px-4 py-1.5 text-xs font-medium ${
          connectionState === 'reconnecting'
            ? 'bg-yellow-500/20 text-yellow-300'
            : 'bg-red-500/20 text-red-300'
        }`}>
          {connectionState === 'reconnecting' ? (
            <>
              <div className="w-3 h-3 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" />
              Reconnecting...
            </>
          ) : (
            <>
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636a9 9 0 010 12.728M5.636 5.636a9 9 0 000 12.728" />
              </svg>
              No internet connection
            </>
          )}
        </div>
      )}

      {/* Search Bar */}
      {showSearch && (
        <div className="flex items-center gap-2 px-4 py-2 bg-wa-panel border-b border-wa-border animate-slide-up">
          <svg className="w-4 h-4 text-wa-icon flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search messages..."
            className="flex-1 bg-transparent text-wa-text text-sm outline-none placeholder:text-wa-text-sec"
            autoFocus
          />
          {searchResults.length > 0 && (
            <span className="text-xs text-wa-text-sec flex-shrink-0">
              {searchIndex + 1}/{searchResults.length}
            </span>
          )}
          <button onClick={() => navigateSearch(-1)} className="p-1 hover:bg-wa-input rounded text-wa-icon" title="Previous">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>
          </button>
          <button onClick={() => navigateSearch(1)} className="p-1 hover:bg-wa-input rounded text-wa-icon" title="Next">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
          </button>
          <button onClick={() => { setShowSearch(false); setSearchQuery(''); setSearchResults([]); }} className="p-1 hover:bg-wa-input rounded text-wa-icon">
            ✕
          </button>
        </div>
      )}

      {/* Messages Area */}
      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto px-4 md:px-12 lg:px-16 py-2 space-y-0.5 wa-chat-bg"
        onScroll={handleScroll}
      >
        {/* Loading more indicator */}
        {loadingMore && (
          <div className="text-center py-3">
            <div className="inline-block w-5 h-5 border-2 border-wa-teal border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* Initial loading */}
        {loading && (
          <div className="text-center py-8">
            <div className="inline-block w-8 h-8 border-2 border-wa-teal border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* E2E encryption notice */}
        {!loading && chatMessages.length === 0 && (
          <div className="date-separator">
            <span>🔒 Messages are end-to-end encrypted</span>
          </div>
        )}

        {/* Messages with date separators */}
        {chatMessages.map((msg, i) => {
          const prevMsg = chatMessages[i - 1];
          const currentDate = new Date(msg.createdAt).toDateString();
          const prevDate = prevMsg ? new Date(prevMsg.createdAt).toDateString() : null;
          const showDate = currentDate !== prevDate;
          const showUnreadDivider = i === unreadDividerIndex && unreadDividerIndex > 0;

          return (
            <div key={msg._id || i}>
              {showDate && renderDateSeparator(msg.createdAt)}
              {showUnreadDivider && (
                <div className="unread-divider">
                  <span>↓ {unreadCount} unread message{unreadCount > 1 ? 's' : ''}</span>
                </div>
              )}
              <MessageBubble
                message={msg}
                prevMessage={prevMsg}
                onReply={() => setReplyTo(msg)}
                onEdit={() => setEditMsg(msg)}
                onOpenMedia={handleOpenMedia}
                onJumpToReply={handleJumpToReply}
                isHighlighted={highlightMessageId === msg._id}
                searchQuery={searchQuery}
              />
            </div>
          );
        })}

        {/* Typing indicator */}
        {(isTyping || isRecording) && (
          <div className="flex items-center gap-2 px-3 py-2 animate-slide-up">
            <div className="flex items-center gap-1.5 bg-wa-bubble2 rounded-lg px-4 py-2.5 shadow-sm">
              <div className="w-2 h-2 bg-wa-text-sec rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-2 h-2 bg-wa-text-sec rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-2 h-2 bg-wa-text-sec rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Scroll to bottom button */}
      {showScrollBtn && (
        <button onClick={scrollToBottom} className="scroll-bottom-btn">
          {newMsgCount > 0 && <span className="badge">{newMsgCount}</span>}
          <svg className="w-5 h-5 text-wa-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </button>
      )}

      {/* Input */}
      <ChatInput
        chatId={activeChat._id}
        replyTo={replyTo}
        editMsg={editMsg}
        onClearReply={() => setReplyTo(null)}
        onClearEdit={() => setEditMsg(null)}
      />

      {/* Contact Info Panel */}
      {showContactInfo && (
        <ContactInfoPanel onClose={() => setShowContactInfo(false)} />
      )}

      {/* Media Viewer */}
      {mediaViewer && (
        <MediaViewer
          media={mediaViewer.media}
          allMedia={mediaViewer.allMedia}
          onClose={() => setMediaViewer(null)}
        />
      )}
    </div>
  );
}
