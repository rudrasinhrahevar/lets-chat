import { useState, useRef, useEffect, useCallback, lazy, Suspense } from 'react';
import { useSocket } from 'contexts/SocketContext';
import { useAuthStore } from 'store/useAuthStore';
import { useChatStore } from 'store/useChatStore';
import VoiceRecorder from 'components/chat/VoiceRecorder';
import { compressImage } from 'utils/imageCompressor';
import { enqueueMessage } from 'services/offlineQueue';
import api from 'services/api';
import toast from 'react-hot-toast';

const EmojiPicker = lazy(() => import('emoji-picker-react'));

export default function ChatInput({ chatId, replyTo, editMsg, onClearReply, onClearEdit }) {
  const [text, setText] = useState('');
  const [showEmoji, setShowEmoji] = useState(false);
  const [showAttach, setShowAttach] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const fileInputRef = useRef(null);
  const inputRef = useRef(null);
  const typingTimeout = useRef(null);
  const socket = useSocket();
  const { user } = useAuthStore();
  const { addOptimisticMessage, drafts, setDraft, clearDraft } = useChatStore();

  const hasText = text.trim().length > 0;

  // Load draft
  useEffect(() => {
    if (drafts[chatId]) setText(drafts[chatId]);
    else setText('');
  }, [chatId, drafts]);

  // Edit mode
  useEffect(() => {
    if (editMsg) {
      setText(editMsg.content || '');
      inputRef.current?.focus();
    }
  }, [editMsg]);

  // Typing indicator
  const handleTyping = useCallback((value) => {
    setText(value);
    setDraft(chatId, value);
    if (value && !typingTimeout.current) socket?.emit('typing:start', { chatId });
    clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => {
      socket?.emit('typing:stop', { chatId });
      typingTimeout.current = null;
    }, 2000);
  }, [chatId, socket, setDraft]);

  const stopTyping = () => {
    socket?.emit('typing:stop', { chatId });
    clearTimeout(typingTimeout.current);
    typingTimeout.current = null;
  };

  // Send text message
  const handleSend = async () => {
    const content = text.trim();
    if (!content) return;

    // Edit mode
    if (editMsg) {
      socket?.emit('message:edit', { messageId: editMsg._id, chatId, content });
      onClearEdit();
      setText('');
      clearDraft(chatId);
      return;
    }

    const tempId = `temp_${Date.now()}_${Math.random().toString(36).substr(2)}`;
    const clientId = `${user._id}_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;

    addOptimisticMessage({
      _id: tempId,
      chat: chatId,
      sender: { _id: user._id, name: user.name, avatar: user.avatar },
      type: 'text',
      content,
      createdAt: new Date().toISOString(),
      replyTo: replyTo ? { _id: replyTo._id, content: replyTo.content, sender: replyTo.sender, type: replyTo.type } : undefined
    });

    socket?.emit('message:send', {
      chatId, tempId, clientId, content, type: 'text',
      replyTo: replyTo?._id
    });

    setText('');
    clearDraft(chatId);
    onClearReply();
    stopTyping();
  };

  // Send on Enter
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // File upload with compression + progress
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setShowAttach(false);
    setUploading(true);
    setUploadProgress(0);

    try {
      // Compress images before upload (saves bandwidth)
      const processedFile = await compressImage(file, 1200, 0.7);

      const formData = new FormData();
      formData.append('file', processedFile);

      const { data } = await api.post('/media/upload', formData, {
        onUploadProgress: (e) => {
          if (e.total) setUploadProgress(Math.round((e.loaded / e.total) * 100));
        }
      });

      let type = 'document';
      if (file.type.startsWith('image/')) type = 'image';
      else if (file.type.startsWith('video/')) type = 'video';
      else if (file.type.startsWith('audio/')) type = 'audio';

      const tempId = `temp_${Date.now()}`;
      const clientId = `${user._id}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      addOptimisticMessage({
        _id: tempId,
        chat: chatId,
        sender: { _id: user._id, name: user.name, avatar: user.avatar },
        type,
        content: text.trim() || '',
        media: data.data,
        createdAt: new Date().toISOString()
      });

      const msgPayload = { chatId, tempId, clientId, type, content: text.trim() || '', media: data.data };
      if (socket?.connected) {
        socket.emit('message:send', msgPayload);
      } else {
        enqueueMessage(msgPayload);
        toast('Message queued — will send when back online', { icon: '📶' });
      }
      setText('');
      clearDraft(chatId);
    } catch (err) {
      toast.error('Upload failed');
    }
    setUploading(false);
    setUploadProgress(0);
    e.target.value = '';
  };

  // Voice recording
  const startRecording = () => {
    setIsRecording(true);
    socket?.emit('recording:start', { chatId });
  };

  const handleVoiceSend = async (file, duration) => {
    setIsRecording(false);
    socket?.emit('recording:stop', { chatId });

    try {
      const formData = new FormData();
      formData.append('file', file);
      const { data } = await api.post('/media/upload', formData);

      const tempId = `temp_${Date.now()}`;
      addOptimisticMessage({
        _id: tempId,
        chat: chatId,
        sender: { _id: user._id, name: user.name, avatar: user.avatar },
        type: 'voice',
        content: '',
        media: { ...data.data, duration },
        createdAt: new Date().toISOString()
      });
      socket?.emit('message:send', { chatId, tempId, type: 'voice', content: '', media: { ...data.data, duration } });
      toast.success('Voice note sent!');
    } catch (err) {
      toast.error('Failed to send voice note');
    }
  };

  const handleVoiceCancel = () => {
    setIsRecording(false);
    socket?.emit('recording:stop', { chatId });
  };

  // Send poll
  const handleSendPoll = () => {
    const question = prompt('Enter poll question:');
    if (!question) return;
    const optionsStr = prompt('Enter options separated by comma (min 2):');
    if (!optionsStr) return;
    const options = optionsStr.split(',').map(o => o.trim()).filter(o => o);
    if (options.length < 2) { toast.error('Need at least 2 options'); return; }

    const tempId = `temp_${Date.now()}`;
    addOptimisticMessage({
      _id: tempId,
      chat: chatId,
      sender: { _id: user._id, name: user.name, avatar: user.avatar },
      type: 'poll',
      content: question,
      poll: { question, options: options.map(text => ({ text, votes: [] })) },
      createdAt: new Date().toISOString()
    });
    socket?.emit('message:send', {
      chatId, tempId, type: 'poll', content: question,
      poll: { question, options: options.map(text => ({ text, votes: [] })) }
    });
    setShowAttach(false);
  };

  // Send location
  const handleSendLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation not supported');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        const tempId = `temp_${Date.now()}`;
        addOptimisticMessage({
          _id: tempId,
          chat: chatId,
          sender: { _id: user._id, name: user.name, avatar: user.avatar },
          type: 'location',
          content: 'Location shared',
          location: { lat, lng, address: `${lat.toFixed(4)}, ${lng.toFixed(4)}` },
          createdAt: new Date().toISOString()
        });
        socket?.emit('message:send', {
          chatId, tempId, type: 'location', content: 'Location shared',
          location: { lat, lng, address: `${lat.toFixed(4)}, ${lng.toFixed(4)}` }
        });
        toast.success('Location shared!');
      },
      () => toast.error('Location access denied'),
      { enableHighAccuracy: true }
    );
    setShowAttach(false);
  };

  // Emoji selection
  const handleEmojiClick = (emojiData) => {
    const emoji = emojiData.emoji;
    handleTyping(text + emoji);
    inputRef.current?.focus();
  };

  // Voice recording mode
  if (isRecording) {
    return <VoiceRecorder onSend={handleVoiceSend} onCancel={handleVoiceCancel} />;
  }

  return (
    <div className="bg-wa-panel border-t border-wa-border flex-shrink-0">
      {/* Reply/Edit preview */}
      {(replyTo || editMsg) && (
        <div className="flex items-center gap-2 px-4 py-2 bg-wa-input/50 border-b border-wa-border animate-slide-up">
          <div className="flex-1 border-l-4 border-wa-teal pl-3 min-w-0">
            <p className="text-xs text-wa-teal font-semibold">
              {editMsg ? '✏️ Editing message' : `↩ ${replyTo?.sender?.name || 'Reply'}`}
            </p>
            <p className="text-xs text-wa-text-sec truncate">
              {editMsg?.content || (replyTo?.type === 'image' ? '📷 Photo' : replyTo?.type === 'video' ? '🎥 Video' : replyTo?.type === 'voice' ? '🎤 Voice message' : replyTo?.type === 'document' ? '📄 Document' : replyTo?.content || 'Message')}
            </p>
          </div>
          {/* Reply media thumbnail */}
          {replyTo?.media?.url && replyTo?.type === 'image' && (
            <img src={replyTo.media.url} alt="" className="w-10 h-10 rounded object-cover flex-shrink-0" />
          )}
          <button
            onClick={editMsg ? onClearEdit : onClearReply}
            className="text-wa-icon hover:text-wa-text p-1.5 hover:bg-wa-input rounded-full transition flex-shrink-0"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
      )}

      {/* Upload progress */}
      {uploading && (
        <div className="px-4 py-2 bg-wa-input/30 border-b border-wa-border">
          <div className="flex items-center gap-3">
            <div className="flex-1 h-1.5 bg-wa-border rounded-full overflow-hidden">
              <div
                className="h-full bg-wa-teal rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
            <span className="text-xs text-wa-text-sec font-medium min-w-[3rem] text-right">
              {uploadProgress}%
            </span>
          </div>
          <p className="text-[10px] text-wa-text-sec mt-1">Uploading file...</p>
        </div>
      )}

      {/* Main input row */}
      <div className="flex items-end gap-2 px-3 py-2.5">
        {/* Emoji button */}
        <div className="relative">
          <button
            onClick={() => { setShowEmoji(!showEmoji); setShowAttach(false); }}
            className={`p-2 rounded-full hover:bg-wa-input transition ${showEmoji ? 'text-wa-teal' : 'text-wa-icon'}`}
            title="Emoji"
          >
            {showEmoji ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" strokeWidth={2}/>
                <path d="M8 14s1.5 2 4 2 4-2 4-2" strokeWidth={2} strokeLinecap="round"/>
                <circle cx="9" cy="9.5" r="1" fill="currentColor" stroke="none"/>
                <circle cx="15" cy="9.5" r="1" fill="currentColor" stroke="none"/>
              </svg>
            )}
          </button>

          {/* Emoji picker */}
          {showEmoji && (
            <div className="absolute bottom-full left-0 mb-2 z-30">
              <Suspense fallback={<div className="w-[320px] h-[400px] bg-wa-panel rounded-xl shadow-xl flex items-center justify-center"><div className="w-6 h-6 border-2 border-wa-teal border-t-transparent rounded-full animate-spin" /></div>}>
                <EmojiPicker
                  onEmojiClick={handleEmojiClick}
                  theme="dark"
                  width={320}
                  height={400}
                  searchPlaceholder="Search emoji..."
                  previewConfig={{ showPreview: false }}
                  skinTonesDisabled
                  lazyLoadEmojis
                />
              </Suspense>
            </div>
          )}
        </div>

        {/* Attachment button */}
        <div className="relative">
          <button
            onClick={() => { setShowAttach(!showAttach); setShowEmoji(false); }}
            className={`p-2 rounded-full hover:bg-wa-input transition ${showAttach ? 'text-wa-teal rotate-45' : 'text-wa-icon'}`}
            title="Attach"
          >
            <svg className="w-6 h-6 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>

          {/* Attachment menu */}
          {showAttach && (
            <div className="absolute bottom-full left-0 mb-2 bg-wa-panel rounded-2xl shadow-xl border border-wa-border py-2 w-52 z-30 animate-slide-up">
              {[
                { label: '📷 Photo & Video', accept: 'image/*,video/*', icon: 'bg-violet-500' },
                { label: '📄 Document', accept: '.pdf,.doc,.docx,.xls,.xlsx,.txt,.csv,.zip,.pptx', icon: 'bg-blue-500' },
                { label: '🎤 Audio', accept: 'audio/*', icon: 'bg-orange-500' },
              ].map(item => (
                <button
                  key={item.label}
                  onClick={() => { fileInputRef.current.accept = item.accept; fileInputRef.current.click(); }}
                  className="w-full text-left px-4 py-2.5 text-sm hover:bg-wa-input text-wa-text transition flex items-center gap-3"
                >
                  {item.label}
                </button>
              ))}
              <hr className="border-wa-border my-1" />
              <button onClick={handleSendLocation} className="w-full text-left px-4 py-2.5 text-sm hover:bg-wa-input text-wa-text transition">
                📍 Location
              </button>
              <button onClick={handleSendPoll} className="w-full text-left px-4 py-2.5 text-sm hover:bg-wa-input text-wa-text transition">
                📊 Poll
              </button>
              <button
                onClick={() => {
                  const name = prompt('Contact name:');
                  const phone = prompt('Phone number:');
                  if (name && phone) {
                    const tempId = `temp_${Date.now()}`;
                    addOptimisticMessage({
                      _id: tempId, chat: chatId,
                      sender: { _id: user._id, name: user.name, avatar: user.avatar },
                      type: 'contact', content: name,
                      contact: { name, phone },
                      createdAt: new Date().toISOString()
                    });
                    socket?.emit('message:send', { chatId, tempId, type: 'contact', content: name, contact: { name, phone } });
                    setShowAttach(false);
                  }
                }}
                className="w-full text-left px-4 py-2.5 text-sm hover:bg-wa-input text-wa-text transition"
              >
                👤 Contact
              </button>
            </div>
          )}
        </div>

        {/* Text input */}
        <div className="flex-1 min-w-0">
          <textarea
            ref={inputRef}
            value={text}
            onChange={e => handleTyping(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full bg-wa-input text-wa-text rounded-xl px-4 py-2.5 outline-none resize-none text-sm placeholder:text-wa-text-sec leading-5"
            placeholder="Type a message"
            rows={1}
            style={{ minHeight: '40px', height: 'auto', maxHeight: '128px' }}
            onInput={e => {
              e.target.style.height = 'auto';
              e.target.style.height = Math.min(e.target.scrollHeight, 128) + 'px';
            }}
          />
        </div>

        {/* Send / Mic toggle */}
        {hasText || editMsg ? (
          <button
            onClick={handleSend}
            disabled={uploading}
            className="p-2.5 rounded-full bg-wa-teal hover:bg-wa-teal-dk text-white transition disabled:opacity-50 flex-shrink-0"
            title="Send"
          >
            {uploading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : editMsg ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
            ) : (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
            )}
          </button>
        ) : (
          <button
            onClick={startRecording}
            className="p-2.5 rounded-full hover:bg-wa-input text-wa-icon hover:text-wa-teal transition flex-shrink-0"
            title="Voice note"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
          </button>
        )}
      </div>

      {/* Hidden file input */}
      <input ref={fileInputRef} type="file" hidden onChange={handleFileUpload} />
    </div>
  );
}
