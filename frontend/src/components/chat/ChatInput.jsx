import { useState, useRef, useEffect, useCallback } from 'react';
import { useSocket } from 'contexts/SocketContext';
import { useAuthStore } from 'store/useAuthStore';
import { useChatStore } from 'store/useChatStore';
import api from 'services/api';
import toast from 'react-hot-toast';

export default function ChatInput({ chatId, replyTo, editMsg, onClearReply, onClearEdit }) {
  const [text, setText] = useState('');
  const [showEmoji, setShowEmoji] = useState(false);
  const [showAttach, setShowAttach] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);
  const inputRef = useRef(null);
  const typingTimeout = useRef(null);
  const socket = useSocket();
  const { user } = useAuthStore();
  const { addOptimisticMessage, drafts, setDraft, clearDraft } = useChatStore();

  useEffect(() => { if (drafts[chatId]) setText(drafts[chatId]); else setText(''); }, [chatId, drafts]);
  useEffect(() => { if (editMsg) { setText(editMsg.content || ''); inputRef.current?.focus(); } }, [editMsg]);

  const handleTyping = useCallback((value) => {
    setText(value);
    setDraft(chatId, value);
    if (value && !typingTimeout.current) socket?.emit('typing:start', { chatId });
    clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => { socket?.emit('typing:stop', { chatId }); typingTimeout.current = null; }, 2000);
  }, [chatId, socket, setDraft]);

  const handleSend = async () => {
    const content = text.trim();
    if (!content) return;
    if (editMsg) { socket?.emit('message:edit', { messageId: editMsg._id, chatId, content }); onClearEdit(); setText(''); clearDraft(chatId); return; }
    const tempId = `temp_${Date.now()}_${Math.random().toString(36).substr(2)}`;
    addOptimisticMessage({ _id: tempId, chat: chatId, sender: { _id: user._id, name: user.name, avatar: user.avatar }, type: 'text', content, createdAt: new Date().toISOString(), replyTo: replyTo ? { _id: replyTo._id, content: replyTo.content, sender: replyTo.sender } : undefined });
    socket?.emit('message:send', { chatId, tempId, content, type: 'text', replyTo: replyTo?._id });
    setText(''); clearDraft(chatId); onClearReply();
    socket?.emit('typing:stop', { chatId }); clearTimeout(typingTimeout.current); typingTimeout.current = null;
  };

  const handleKeyDown = (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setShowAttach(false); setUploading(true);
    try {
      const formData = new FormData(); formData.append('file', file);
      const { data } = await api.post('/media/upload', formData);
      let type = 'document';
      if (file.type.startsWith('image/')) type = 'image';
      else if (file.type.startsWith('video/')) type = 'video';
      else if (file.type.startsWith('audio/')) type = 'audio';
      const tempId = `temp_${Date.now()}`;
      addOptimisticMessage({ _id: tempId, chat: chatId, sender: { _id: user._id, name: user.name, avatar: user.avatar }, type: type, content: text.trim() || '', media: data.data, createdAt: new Date().toISOString() });
      socket?.emit('message:send', { chatId, tempId, type, content: text.trim() || '', media: data.data });
      setText(''); clearDraft(chatId); toast.success('File sent!');
    } catch (err) { toast.error('Upload failed'); }
    setUploading(false); e.target.value = '';
  };

  const emojiList = ['😊','😂','❤️','👍','🙏','🔥','😍','🎉','💯','😢','🤔','😎','🥰','😅','👏','🙌','💪','✨','🌟','💫'];

  return (
    <div className="bg-wa-panel border-t border-wa-border">
      {(replyTo || editMsg) && (
        <div className="flex items-center gap-2 px-4 py-2 bg-wa-input/50 border-b border-wa-border">
          <div className="flex-1 border-l-4 border-wa-teal pl-3"><p className="text-xs text-wa-teal font-medium">{editMsg ? 'Editing message' : replyTo?.sender?.name}</p><p className="text-xs text-wa-text-sec truncate">{editMsg?.content || replyTo?.content}</p></div>
          <button onClick={editMsg ? onClearEdit : onClearReply} className="text-wa-icon hover:text-wa-text p-1">✕</button>
        </div>
      )}
      <div className="flex items-end gap-2 px-4 py-3">
        <div className="relative">
          <button onClick={() => { setShowEmoji(!showEmoji); setShowAttach(false); }} className="p-2 rounded-full hover:bg-wa-input text-wa-icon transition">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>
          </button>
          {showEmoji && (<div className="absolute bottom-full left-0 mb-2 bg-wa-panel rounded-xl shadow-xl border border-wa-border p-3 grid grid-cols-5 gap-2 w-[240px] z-20">{emojiList.map(e => <button key={e} onClick={() => { handleTyping(text + e); setShowEmoji(false); inputRef.current?.focus(); }} className="text-xl hover:scale-125 transition p-1">{e}</button>)}</div>)}
        </div>
        <div className="relative">
          <button onClick={() => { setShowAttach(!showAttach); setShowEmoji(false); }} className="p-2 rounded-full hover:bg-wa-input text-wa-icon transition">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
          </button>
          {showAttach && (<div className="absolute bottom-full left-0 mb-2 bg-wa-panel rounded-xl shadow-xl border border-wa-border py-2 w-48 z-20">
            {[{ label: '📷 Photo/Video', accept: 'image/*,video/*' },{ label: '📄 Document', accept: '.pdf,.doc,.docx,.xls,.xlsx,.txt,.csv,.zip' },{ label: '🎤 Audio', accept: 'audio/*' }].map(item => (
              <button key={item.label} onClick={() => { fileInputRef.current.accept = item.accept; fileInputRef.current.click(); }} className="w-full text-left px-4 py-2 text-sm hover:bg-wa-input text-wa-text transition">{item.label}</button>
            ))}
          </div>)}
        </div>
        <div className="flex-1">
          <textarea ref={inputRef} value={text} onChange={e => handleTyping(e.target.value)} onKeyDown={handleKeyDown} className="w-full bg-wa-input text-wa-text rounded-lg px-4 py-2.5 outline-none resize-none text-sm placeholder:text-wa-text-sec max-h-32" placeholder="Type a message" rows={1} style={{ minHeight: '40px', height: 'auto' }} onInput={e => { e.target.style.height = 'auto'; e.target.style.height = Math.min(e.target.scrollHeight, 128) + 'px'; }} />
        </div>
        <button onClick={handleSend} disabled={uploading || (!text.trim() && !editMsg)} className="p-2.5 rounded-full bg-wa-teal hover:bg-wa-teal-dk text-white transition disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0">
          {uploading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : editMsg ? <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg> : <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>}
        </button>
      </div>
      <input ref={fileInputRef} type="file" hidden onChange={handleFileUpload} />
    </div>
  );
}
