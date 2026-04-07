import { useState, useEffect } from 'react';
import api from 'services/api';
import { useChatStore } from 'store/useChatStore';
import GroupCreateModal from './GroupCreateModal';
import toast from 'react-hot-toast';

export default function NewChatModal({ onClose }) {
  const [search, setSearch] = useState('');
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showGroupCreate, setShowGroupCreate] = useState(false);
  
  // Add Contact logic
  const [addEmail, setAddEmail] = useState('');
  const [addingContact, setAddingContact] = useState(false);
  const [inviteEmail, setInviteEmail] = useState(null);

  const { setActiveChat, chats, setChats } = useChatStore();

  const fetchContacts = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/users/me/contacts');
      setContacts(data.data || []);
    } catch (err) {
      toast.error('Failed to load contacts');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  const handleAddContact = async (e) => {
    e.preventDefault();
    if (!addEmail.trim()) return;
    setAddingContact(true);
    setInviteEmail(null);
    try {
      const { data } = await api.post('/users/me/contacts', { email: addEmail.trim() });
      setContacts([data.data, ...contacts.filter(c => c._id !== data.data._id)]);
      setAddEmail('');
      toast.success('Contact added successfully!');
    } catch (err) {
      if (err.response?.status === 404) {
        setInviteEmail(addEmail.trim());
      } else {
        toast.error(err.response?.data?.message || 'Failed to add contact');
      }
    }
    setAddingContact(false);
  };

  const startChat = async (userId) => {
    try {
      const { data } = await api.post('/chats/private', { userId });
      const existing = chats.find(c => c._id === data.data._id);
      if (!existing) setChats([data.data, ...chats]);
      setActiveChat(data.data);
      onClose();
    } catch (err) { 
      toast.error('Failed to start chat'); 
    }
  };

  if (showGroupCreate) {
    return <GroupCreateModal onClose={(created) => created ? onClose() : setShowGroupCreate(false)} />;
  }

  const filteredContacts = contacts.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    c.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center pt-20" onClick={onClose}>
      <div className="bg-wa-panel rounded-xl w-full max-w-md mx-4 shadow-2xl flex flex-col max-h-[85vh]" onClick={e => e.stopPropagation()}>
        <div className="flex items-center gap-3 p-4 border-b border-wa-border">
          <button onClick={onClose} className="text-wa-icon hover:text-wa-text"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
          <h3 className="text-lg font-semibold text-wa-text">New Chat</h3>
        </div>
        
        <div className="p-4 border-b border-wa-border/50">
          <button onClick={() => setShowGroupCreate(true)} className="w-full flex items-center gap-4 px-4 py-3 rounded-lg bg-wa-teal/10 hover:bg-wa-teal/20 text-wa-teal transition text-sm font-medium">
            <div className="w-10 h-10 rounded-full bg-wa-teal flex items-center justify-center text-white text-lg">👥</div>
            Create New Group
          </button>
        </div>

        <form onSubmit={handleAddContact} className="p-4 border-b border-wa-border/50 flex flex-col gap-2">
          <label className="text-xs font-semibold text-wa-text-sec uppercase tracking-wider">Add Contact</label>
          <div className="flex gap-2">
            <input value={addEmail} onChange={e => {setAddEmail(e.target.value); setInviteEmail(null);}} type="email" placeholder="Contact's Email Address" className="flex-1 bg-wa-input text-wa-text rounded-lg px-4 py-2 outline-none text-sm placeholder:text-wa-text-sec" />
            <button type="submit" disabled={addingContact || !addEmail.trim()} className="bg-wa-teal hover:bg-emerald-600 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-semibold transition">
              {addingContact ? 'Adding...' : 'Add'}
            </button>
          </div>
          {inviteEmail && (
            <div className="mt-2 text-sm bg-red-500/10 text-red-400 p-3 rounded-lg border border-red-500/20 flex flex-col items-center gap-2">
              <p>User not found on platform.</p>
              <a href={`mailto:${inviteEmail}?subject=Join me on LetsChat!&body=Hey! I'm using LetsChat. Join me here: ${window.location.origin}`} target="_blank" rel="noreferrer" className="bg-red-500 text-white px-4 py-1.5 rounded-md text-xs font-semibold hover:bg-red-600 transition w-full text-center">
                Invite via Mail
              </a>
            </div>
          )}
        </form>

        <div className="p-4">
          <input value={search} onChange={e => setSearch(e.target.value)} className="w-full bg-wa-input text-wa-text rounded-lg px-4 py-2.5 outline-none text-sm placeholder:text-wa-text-sec" placeholder="Search saved contacts" />
        </div>

        <div className="flex-1 overflow-y-auto min-h-[200px]">
          {loading && <p className="text-center text-wa-text-sec text-sm py-4">Loading contacts...</p>}
          {!loading && filteredContacts.length === 0 && <p className="text-center text-wa-text-sec text-sm py-4">{contacts.length === 0 ? "You have no saved contacts" : "No contacts match search"}</p>}
          {filteredContacts.map(u => (
            <button key={u._id} onClick={() => startChat(u._id)} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-wa-input transition">
              <div className="w-10 h-10 rounded-full bg-wa-teal/20 flex items-center justify-center flex-shrink-0">
                {u.avatar ? <img src={u.avatar} alt="" className="w-full h-full rounded-full object-cover" /> : <span className="text-wa-teal font-bold">{u.name?.[0]?.toUpperCase()}</span>}
              </div>
              <div className="text-left"><p className="text-wa-text font-medium text-sm">{u.name}</p><p className="text-wa-text-sec text-xs">{u.email}</p></div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
