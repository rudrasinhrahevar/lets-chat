import { useState } from "react";
import { useEffect } from "react";
import { getUser } from "../../services/ChatService";
import {
  VideoCamera,
  Search,
  DotsVertical,
  Phone,
} from "./icons/ChatIcons";

export default function ChatHeader({
  currentChat,
  currentUser,
  onlineUsersId,
  isTyping,
  onSearchChange,
  onClearChat,
  onVoiceCall,
  onVideoCall,
}) {
  const [contact, setContact] = useState(null);
  const [showMenu, setShowMenu] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const contactId = currentChat?.members?.find(
      (member) => member !== currentUser.uid
    );
    if (contactId) {
      getUser(contactId).then(setContact);
    }
  }, [currentChat, currentUser]);

  const isOnline = onlineUsersId?.includes(contact?.uid);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    onSearchChange?.(e.target.value);
  };

  return (
    <div className="flex items-center justify-between w-full">
      {/* Contact Info */}
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className="relative shrink-0">
          <img
            className="w-10 h-10 rounded-full object-cover border-2 border-white dark:border-gray-800 shadow-sm"
            src={contact?.photoURL || `https://ui-avatars.com/api/?name=${contact?.displayName}`}
            alt={contact?.displayName}
          />
          <span
            className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white dark:border-gray-950 ${
              isOnline ? "bg-green-500" : "bg-gray-400"
            }`}
          />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
            {contact?.displayName || "Loading..."}
          </p>
          <p className="text-xs font-medium">
            {isTyping ? (
              <span className="text-primary-500 animate-pulse">typing...</span>
            ) : isOnline ? (
              <span className="text-green-500">Online</span>
            ) : (
              <span className="text-gray-400">Offline</span>
            )}
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-1 shrink-0">
        {/* Search Toggle */}
        {searchOpen ? (
          <div className="flex items-center gap-2 mr-2">
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              className="input-field !py-2 !px-3 text-sm w-44"
              placeholder="Search in chat..."
              autoFocus
            />
            <button
              onClick={() => { setSearchOpen(false); setSearchQuery(""); onSearchChange?.(""); }}
              className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 text-lg font-bold"
            >
              ✕
            </button>
          </div>
        ) : (
          <button
            onClick={() => setSearchOpen(true)}
            className="sidebar-icon !w-9 !h-9"
            title="Search in chat"
          >
            <Search className="w-5 h-5" />
          </button>
        )}

        <button
          className="sidebar-icon !w-9 !h-9 text-gray-400"
          title="Voice call"
          onClick={() => onVoiceCall(contact?.displayName, contact?.photoURL)}
        >
          <Phone className="w-5 h-5" />
        </button>

        <button
          className="sidebar-icon !w-9 !h-9 text-gray-400"
          title="Video call"
          onClick={() => onVideoCall(contact?.displayName, contact?.photoURL)}
        >
          <VideoCamera className="w-5 h-5" />
        </button>

        {/* More Options */}
        <div className="relative">
          <button
            className="sidebar-icon !w-9 !h-9"
            onClick={() => setShowMenu(!showMenu)}
            title="More options"
          >
            <DotsVertical className="w-5 h-5" />
          </button>

          {showMenu && (
            <div className="absolute right-0 top-11 w-48 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl shadow-xl z-50 overflow-hidden py-1 glass-panel">
              <button
                className="w-full text-left px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                onClick={() => { setShowMenu(false); }}
              >
                👤 View Contact
              </button>
              <button
                className="w-full text-left px-4 py-3 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                onClick={() => { setShowMenu(false); onClearChat?.(); }}
              >
                🗑️ Clear Chat
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
