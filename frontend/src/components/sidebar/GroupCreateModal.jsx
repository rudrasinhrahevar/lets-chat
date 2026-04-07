import { useState, useEffect } from 'react';
import api from 'services/api';
import { useChatStore } from 'store/useChatStore';
import toast from 'react-hot-toast';

export default function GroupCreateModal({ onClose }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [search, setSearch] = useState('');
  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const { setActiveChat, chats, setChats } = useChatStore();

  useEffect(() => {
    if (!search.trim()) { setUsers([]); return; }
    const t = setTimeout(async () => {
      setLoading(true);
      try { 
        const { data } = await api.get(`/users/search?q=${search}`);
        // Filter out already selected users
        setUsers(data.data.filter(u => !selectedUsers.find(su => su._id === u._id)));
      } catch {}
      setLoading(false);
    }, 300);
    return () => clearTimeout(t);
  }, [search, selectedUsers]);

  const toggleUser = (user) => {
    if (selectedUsers.find(u => u._id === user._id)) {
      setSelectedUsers(selectedUsers.filter(u => u._id !== user._id));
      setUsers([...users, user]);
    } else {
      setSelectedUsers([...selectedUsers, user]);
      setUsers(users.filter(u => u._id !== user._id));
      setSearch(''); // Clear search after picking someone
    }
  };

  const removeUser = (userId) => {
    setSelectedUsers(selectedUsers.filter(u => u._id !== userId));
  };

  const createGroup = async () => {
    if (!name.trim()) return toast.error('Group name is required');
    if (selectedUsers.length === 0) return toast.error('Select at least one member');

    setCreating(true);
    try {
      const participantIds = selectedUsers.map(u => u._id);
      const { data } = await api.post('/groups', { 
        name: name.trim(), 
        description: description.trim(), 
        participants: participantIds 
      });
      setChats([data.data, ...chats]);
      setActiveChat(data.data);
      onClose(true); // pass true to indicate it was created
    } catch (err) {
      toast.error('Failed to create group');
    }
    setCreating(false);
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4" onClick={() => onClose(false)}>
      <div className="bg-wa-panel rounded-xl w-full max-w-md shadow-2xl flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center gap-3 p-4 border-b border-wa-border bg-wa-teal rounded-t-xl text-white">
          <button onClick={() => onClose(false)} className="hover:text-white/80 transition">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <h3 className="text-lg font-semibold">New Group</h3>
        </div>

        {/* Form area */}
        <div className="p-4 space-y-4 overflow-y-auto">
          <div>
            <label className="text-xs text-wa-teal font-semibold mb-1 block">Group Name</label>
            <input 
              value={name} 
              onChange={e => setName(e.target.value)} 
              className="w-full bg-wa-input text-wa-text rounded-lg px-3 py-2 outline-none border border-transparent focus:border-wa-teal transition text-sm" 
              placeholder="E.g. Weekend Trip" 
              maxLength={50}
            />
          </div>

          <div>
            <label className="text-xs text-wa-teal font-semibold mb-1 block">Description (optional)</label>
            <input 
              value={description} 
              onChange={e => setDescription(e.target.value)} 
              className="w-full bg-wa-input text-wa-text rounded-lg px-3 py-2 outline-none border border-transparent focus:border-wa-teal transition text-sm" 
              placeholder="Group description..." 
            />
          </div>

          <div>
            <label className="text-xs text-wa-teal font-semibold mb-1 block">Add Members</label>
            <input 
              value={search} 
              onChange={e => setSearch(e.target.value)} 
              className="w-full bg-wa-input text-wa-text rounded-lg px-3 py-2 outline-none placeholder:text-wa-text-sec text-sm" 
              placeholder="Search users to add..." 
            />
          </div>

          {/* Selected users chips */}
          {selectedUsers.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-2">
              {selectedUsers.map(u => (
                <div key={u._id} className="flex items-center gap-1.5 bg-wa-teal/20 text-wa-teal px-2 py-1 rounded-full text-xs font-medium">
                  <div className="w-4 h-4 rounded-full bg-wa-teal/40 flex items-center justify-center overflow-hidden">
                    {u.avatar ? <img src={u.avatar} alt="" className="w-full h-full object-cover" /> : <span className="text-[10px] text-wa-teal">{u.name?.[0]}</span>}
                  </div>
                  <span>{u.name.split(' ')[0]}</span>
                  <button onClick={() => removeUser(u._id)} className="ml-0.5 hover:text-red-400">✕</button>
                </div>
              ))}
            </div>
          )}

          {/* Search Results */}
          <div className="min-h-[150px]">
            {loading && search && <div className="text-center text-wa-text-sec text-sm py-4">Searching...</div>}
            {!loading && users.length === 0 && search && <div className="text-center text-wa-text-sec text-sm py-4">No users found</div>}
            {!loading && !search && selectedUsers.length === 0 && <div className="text-center text-wa-text-sec text-xs py-8 opacity-70">Search for users to add them to the group</div>}

            <div className="space-y-1 mt-2">
              {users.map(u => (
                <button 
                  key={u._id} 
                  onClick={() => toggleUser(u)} 
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-wa-input transition"
                >
                  <div className="w-8 h-8 rounded-full bg-wa-teal/20 flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {u.avatar ? <img src={u.avatar} alt="" className="w-full h-full object-cover" /> : <span className="text-wa-teal font-bold text-sm">{u.name?.[0]}</span>}
                  </div>
                  <div className="text-left flex-1 min-w-0">
                    <p className="text-wa-text font-medium text-sm truncate">{u.name}</p>
                    <p className="text-wa-text-sec text-xs truncate">{u.email}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-wa-border flex justify-end">
          <button 
            onClick={createGroup}
            disabled={creating || !name.trim() || selectedUsers.length === 0}
            className="bg-wa-teal hover:bg-wa-teal-dk text-white font-medium py-2 px-6 rounded-lg transition disabled:opacity-50 flex items-center gap-2"
          >
            {creating ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : null}
            {creating ? 'Creating...' : `Create Group (${selectedUsers.length} members)`}
          </button>
        </div>

      </div>
    </div>
  );
}
