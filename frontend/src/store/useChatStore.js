import { create } from 'zustand';
import { useAuthStore } from './useAuthStore';

export const useChatStore = create((set, get) => ({
  chats: [],
  activeChat: null,
  messages: {},
  historyLoaded: {},
  pagination: {},
  typing: {},
  recording: {},
  onlineUsers: {},
  drafts: {},
  searchQuery: '',
  searchResults: [],
  highlightMessageId: null,
  newMessagesCount: {},

  setChats: (chats) => set({ chats }),
  setActiveChat: (chat) => {
    const prev = get().activeChat;
    if (prev?._id !== chat?._id) {
      set({ activeChat: chat, searchQuery: '', searchResults: [], highlightMessageId: null });
      // Reset new messages count for this chat
      if (chat) {
        set(state => ({ newMessagesCount: { ...state.newMessagesCount, [chat._id]: 0 } }));
      }
    } else {
      set({ activeChat: chat });
    }
  },

  receiveMessage: (message) => {
    set(state => {
      const chatId = message.chat?._id || message.chat;
      const existing = state.messages[chatId] || [];
      if (existing.find(m => m._id === message._id)) return state;
      const msgs = [...existing, message];

      const currentUser = useAuthStore.getState().user?._id;
      const isActiveChat = state.activeChat?._id === chatId;
      const isOthersMessage = message.sender?._id !== currentUser && message.sender !== currentUser;

      const chats = state.chats.map(c => {
        if (c._id === chatId) {
          const updates = { lastMessage: message, updatedAt: new Date().toISOString() };
          if (!isActiveChat && isOthersMessage && currentUser) {
            updates.unreadCount = { ...c.unreadCount, [currentUser]: (c.unreadCount?.[currentUser] || 0) + 1 };
          }
          return { ...c, ...updates };
        }
        return c;
      });

      // Track new messages for scroll-to-bottom badge
      const newMessagesCount = { ...state.newMessagesCount };
      if (!isActiveChat && isOthersMessage) {
        newMessagesCount[chatId] = (newMessagesCount[chatId] || 0) + 1;
      }

      return { messages: { ...state.messages, [chatId]: msgs }, chats, newMessagesCount };
    });
  },

  confirmSent: (tempId, messageId) => {
    set(state => {
      const updated = {};
      for (const chatId in state.messages) {
        updated[chatId] = state.messages[chatId].map(m =>
          m._id === tempId ? { ...m, _id: messageId, _status: 'sent' } : m
        );
      }
      return { messages: updated };
    });
  },

  loadMessages: (chatId, messages, prepend = false) => {
    set(state => ({
      messages: { ...state.messages, [chatId]: prepend ? [...messages, ...(state.messages[chatId] || [])] : messages },
      historyLoaded: { ...state.historyLoaded, [chatId]: !prepend }
    }));
  },

  setPagination: (chatId, paginationData) => {
    set(state => ({
      pagination: { ...state.pagination, [chatId]: paginationData }
    }));
  },

  addOptimisticMessage: (message) => {
    set(state => ({
      messages: { ...state.messages, [message.chat]: [...(state.messages[message.chat] || []), { ...message, _status: 'sending' }] }
    }));
  },

  updateMessageStatus: ({ messageId, userId, status }) => {
    set(state => {
      const updated = {};
      for (const chatId in state.messages) {
        updated[chatId] = state.messages[chatId].map(m =>
          m._id === messageId
            ? { ...m, status: { ...(m.status || {}), [userId]: { ...((m.status || {})[userId] || {}), [status]: new Date() } } }
            : m
        );
      }
      return { messages: updated };
    });
  },

  markRead: (chatId, userId) => {
    set(state => ({
      chats: state.chats.map(c => c._id === chatId ? { ...c, unreadCount: { ...c.unreadCount, [userId]: 0 } } : c),
      messages: {
        ...state.messages,
        [chatId]: (state.messages[chatId] || []).map(m => ({
          ...m, status: { ...(m.status || {}), [userId]: { ...(m.status?.[userId] || {}), read: new Date() } }
        }))
      },
      newMessagesCount: { ...state.newMessagesCount, [chatId]: 0 }
    }));
  },

  updateReactions: ({ messageId, reactions }) => {
    set(state => {
      const updated = {};
      for (const chatId in state.messages) {
        updated[chatId] = state.messages[chatId].map(m => m._id === messageId ? { ...m, reactions } : m);
      }
      return { messages: updated };
    });
  },

  editMessage: ({ messageId, content, editedAt }) => {
    set(state => {
      const updated = {};
      for (const chatId in state.messages) {
        updated[chatId] = state.messages[chatId].map(m => m._id === messageId ? { ...m, content, isEdited: true, editedAt } : m);
      }
      return { messages: updated };
    });
  },

  deleteMessage: ({ messageId, deleteForEveryone }) => {
    set(state => {
      const updated = {};
      for (const chatId in state.messages) {
        updated[chatId] = state.messages[chatId].map(m =>
          m._id === messageId
            ? deleteForEveryone ? { ...m, isDeletedForEveryone: true, content: 'This message was deleted', type: 'system' } : { ...m, isDeleted: true }
            : m
        );
      }
      return { messages: updated };
    });
  },

  updatePollVote: ({ messageId, poll }) => {
    set(state => {
      const updated = {};
      for (const chatId in state.messages) {
        updated[chatId] = state.messages[chatId].map(m =>
          m._id === messageId ? { ...m, poll } : m
        );
      }
      return { messages: updated };
    });
  },

  setTyping: (chatId, userId, isTyping) => {
    set(state => {
      const current = new Set(state.typing[chatId] || []);
      isTyping ? current.add(userId) : current.delete(userId);
      return { typing: { ...state.typing, [chatId]: current } };
    });
  },

  setRecording: (chatId, userId, isRecording) => {
    set(state => {
      const current = new Set(state.recording[chatId] || []);
      isRecording ? current.add(userId) : current.delete(userId);
      return { recording: { ...state.recording, [chatId]: current } };
    });
  },

  setUserOnline: (userId, isOnline, lastSeen = null) => {
    set(state => ({ onlineUsers: { ...state.onlineUsers, [userId]: { isOnline, lastSeen } } }));
  },

  setSearchQuery: (query) => set({ searchQuery: query }),
  setSearchResults: (results) => set({ searchResults: results }),
  setHighlightMessage: (messageId) => {
    set({ highlightMessageId: messageId });
    // Auto-clear after animation
    setTimeout(() => set({ highlightMessageId: null }), 2000);
  },

  incrementNewMessages: (chatId) => {
    set(state => ({
      newMessagesCount: { ...state.newMessagesCount, [chatId]: (state.newMessagesCount[chatId] || 0) + 1 }
    }));
  },

  resetNewMessages: (chatId) => {
    set(state => ({ newMessagesCount: { ...state.newMessagesCount, [chatId]: 0 } }));
  },

  setDraft: (chatId, text) => set(state => ({ drafts: { ...state.drafts, [chatId]: text } })),
  clearDraft: (chatId) => set(state => { const d = { ...state.drafts }; delete d[chatId]; return { drafts: d }; }),
  updateChat: (chatId, updates) => set(state => ({
    chats: state.chats.map(c => c._id === chatId ? { ...c, ...updates } : c)
  }))
}));
