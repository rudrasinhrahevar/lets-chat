import { useState, useMemo } from 'react';
import { List as VirtualList } from 'react-window';
import { AutoSizer } from 'react-virtualized-auto-sizer';
import { useAuthStore } from 'store/useAuthStore';
import { useChatStore } from 'store/useChatStore';
import { useTheme } from 'contexts/ThemeContext';
import ChatListItem from 'components/sidebar/ChatListItem';
import NewChatModal from 'components/sidebar/NewChatModal';
import StatusList from 'components/status/StatusList';
import CallsList from 'components/calls/CallsList';
import ProfilePanel from 'components/sidebar/ProfilePanel';
import toast from 'react-hot-toast';

export default function Sidebar({ view, onViewChange }) {
  const { user, logout } = useAuthStore();
  const { chats, setActiveChat, activeChat } = useChatStore();
  const { toggleTheme, theme } = useTheme();
  const [search, setSearch] = useState('');
  const [showMenu, setShowMenu] = useState(false);
  const [showNewChat, setShowNewChat] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [filter, setFilter] = useState('all');

  const filteredChats = useMemo(() => {
    let filtered = chats;
    if (search) {
      filtered = filtered.filter(c => {
        const name = c.type === 'group'
          ? c.groupInfo?.name
          : c.participants?.find(p => p._id !== user?._id)?.name;
        return name?.toLowerCase().includes(search.toLowerCase());
      });
    }
    if (filter === 'unread') filtered = filtered.filter(c => (c.unreadCount?.[user?._id] || 0) > 0);
    if (filter === 'groups') filtered = filtered.filter(c => c.type === 'group');
    return filtered;
  }, [chats, search, filter, user]);

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out');
  };

  const navItems = [
    { id: 'chats', icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>
      </svg>
    )},
    { id: 'status', icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/>
      </svg>
    )},
    { id: 'calls', icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
      </svg>
    )},
  ];

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-wa-panel border-b border-wa-border">
        <button onClick={() => setShowProfile(true)} className="flex items-center gap-3 hover:opacity-80 transition">
          <div className="w-10 h-10 rounded-full bg-wa-teal/20 flex items-center justify-center text-wa-teal font-bold overflow-hidden">
            {user?.avatar ? (
              <img src={user.avatar} alt="" className="w-full h-full object-cover" />
            ) : (
              user?.name?.[0]?.toUpperCase()
            )}
          </div>
          <span className="font-semibold text-wa-text hidden sm:block text-sm">{user?.name}</span>
        </button>
        <div className="flex items-center gap-1">
          {/* Nav icons */}
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              title={item.id.charAt(0).toUpperCase() + item.id.slice(1)}
              className={`p-2 rounded-full transition ${view === item.id ? 'text-wa-teal bg-wa-teal/10' : 'text-wa-icon hover:bg-wa-input'}`}
            >
              {item.icon}
            </button>
          ))}
          {view === 'chats' && (
            <button onClick={() => setShowNewChat(true)} className="p-2 rounded-full hover:bg-wa-input transition text-wa-icon" title="New chat">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
          )}
          <div className="relative">
            <button onClick={() => setShowMenu(!showMenu)} className="p-2 rounded-full hover:bg-wa-input transition text-wa-icon">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <circle cx="12" cy="5" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="12" cy="19" r="2"/>
              </svg>
            </button>
            {showMenu && (
              <div
                className="absolute right-0 top-full mt-1 bg-wa-panel rounded-lg shadow-xl border border-wa-border py-2 w-52 z-50"
                onMouseLeave={() => setShowMenu(false)}
              >
                <button onClick={() => { setShowProfile(true); setShowMenu(false); }} className="w-full text-left px-4 py-2.5 text-sm hover:bg-wa-input text-wa-text transition">
                  👤 Profile
                </button>
                <button onClick={() => { toggleTheme(); setShowMenu(false); }} className="w-full text-left px-4 py-2.5 text-sm hover:bg-wa-input text-wa-text transition">
                  {theme === 'dark' ? '☀️ Light mode' : '🌙 Dark mode'}
                </button>
                {user?.role === 'admin' && (
                  <a href="/admin" className="block px-4 py-2.5 text-sm hover:bg-wa-input text-wa-text transition">
                    🛡️ Admin Panel
                  </a>
                )}
                <hr className="border-wa-border my-1" />
                <button onClick={handleLogout} className="w-full text-left px-4 py-2.5 text-sm hover:bg-wa-input text-wa-danger transition">
                  🚪 Log out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Search — only for chats view */}
      {view === 'chats' && (
        <>
          <div className="px-3 py-2 bg-wa-bg">
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-wa-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full bg-wa-input text-wa-text rounded-lg pl-10 pr-4 py-2 text-sm outline-none placeholder:text-wa-text-sec"
                placeholder="Search or start new chat"
              />
            </div>
          </div>
          <div className="flex gap-2 px-3 pb-2">
            {['all', 'unread', 'groups'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition ${filter === f ? 'bg-wa-teal text-white' : 'bg-wa-input text-wa-text-sec hover:bg-wa-border'}`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </>
      )}

      {/* Content panels */}
      {view === 'chats' && (
        <div className="flex-1 overflow-hidden">
          {filteredChats.length === 0 ? (
            <div className="text-center text-wa-text-sec text-sm py-12">
              {search ? 'No chats found' : 'No conversations yet.\nClick the pencil icon to start one.'}
            </div>
          ) : filteredChats.length < 20 ? (
            /* Small lists: render directly (no virtualization overhead) */
            <div className="overflow-y-auto h-full">
              {filteredChats.map(chat => (
                <ChatListItem
                  key={chat._id}
                  chat={chat}
                  isActive={activeChat?._id === chat._id}
                  onClick={() => setActiveChat(chat)}
                />
              ))}
            </div>
          ) : (
            /* Large lists: virtualized with react-window */
            <AutoSizer>
              {({ height, width }) => (
                <VirtualList
                  height={height}
                  width={width}
                  itemCount={filteredChats.length}
                  itemSize={72}
                  overscanCount={5}
                >
                  {({ index, style }) => {
                    const chat = filteredChats[index];
                    return (
                      <div style={style}>
                        <ChatListItem
                          key={chat._id}
                          chat={chat}
                          isActive={activeChat?._id === chat._id}
                          onClick={() => setActiveChat(chat)}
                        />
                      </div>
                    );
                  }}
                </VirtualList>
              )}
            </AutoSizer>
          )}
        </div>
      )}

      {view === 'status' && <StatusList />}
      {view === 'calls' && <CallsList />}

      {/* Modals */}
      {showNewChat && <NewChatModal onClose={() => setShowNewChat(false)} />}
      {showProfile && <ProfilePanel onClose={() => setShowProfile(false)} />}
    </>
  );
}
