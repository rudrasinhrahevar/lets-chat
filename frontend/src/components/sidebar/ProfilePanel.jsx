import { useState, useRef } from 'react';
import { useAuthStore } from 'store/useAuthStore';
import { useTheme } from 'contexts/ThemeContext';
import api from 'services/api';
import toast from 'react-hot-toast';

export default function ProfilePanel({ onClose }) {
  const { user, updateUser } = useAuthStore();
  const { theme, toggleTheme } = useTheme();
  const [tab, setTab] = useState('profile');
  const [name, setName] = useState(user?.name || '');
  const [about, setAbout] = useState(user?.about || '');
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileRef = useRef(null);

  const handleSaveProfile = async () => {
    if (!name.trim()) return toast.error('Name is required');
    setSaving(true);
    try {
      const { data } = await api.put('/users/me', { name: name.trim(), about: about.trim() });
      updateUser(data.data);
      toast.success('Profile updated!');
    } catch {
      toast.error('Failed to update profile');
    }
    setSaving(false);
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) return toast.error('Please select an image file');
    setUploadingAvatar(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const { data } = await api.put('/users/me/avatar', formData);
      updateUser({ avatar: data.data.avatar });
      toast.success('Avatar updated!');
    } catch {
      toast.error('Failed to upload avatar');
    }
    setUploadingAvatar(false);
    e.target.value = '';
  };

  const tabs = [
    { id: 'profile', label: '👤 Profile' },
    { id: 'privacy', label: '🔒 Privacy' },
    { id: 'notifications', label: '🔔 Notifications' },
    { id: 'appearance', label: '🎨 Appearance' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-start">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative z-10 w-full max-w-sm h-full bg-wa-panel flex flex-col shadow-2xl animate-slide-up">
        {/* Header */}
        <div className="flex items-center gap-4 px-4 py-4 bg-wa-teal">
          <button onClick={onClose} className="text-white hover:text-white/80 transition">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h2 className="text-white text-lg font-semibold">Settings</h2>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-wa-border bg-wa-panel overflow-x-auto flex-shrink-0">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex-1 px-3 py-3 text-xs font-medium whitespace-nowrap transition border-b-2 ${tab === t.id ? 'border-wa-teal text-wa-teal' : 'border-transparent text-wa-text-sec hover:text-wa-text'}`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* Profile Tab */}
          {tab === 'profile' && (
            <div className="p-5 space-y-5">
              {/* Avatar */}
              <div className="flex flex-col items-center gap-3">
                <div
                  className="relative w-24 h-24 rounded-full bg-wa-teal/20 flex items-center justify-center cursor-pointer group overflow-hidden"
                  onClick={() => fileRef.current?.click()}
                >
                  {user?.avatar
                    ? <img src={user.avatar} alt="" className="w-full h-full object-cover" />
                    : <span className="text-3xl text-wa-teal font-bold">{user?.name?.[0]?.toUpperCase()}</span>
                  }
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                    {uploadingAvatar
                      ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      : <span className="text-white text-sm">📷</span>
                    }
                  </div>
                </div>
                <input ref={fileRef} type="file" hidden accept="image/*" onChange={handleAvatarUpload} />
                <p className="text-xs text-wa-text-sec">Tap to change photo</p>
              </div>

              {/* Name */}
              <div>
                <label className="block text-xs text-wa-teal font-medium mb-2">Your name</label>
                <input
                  value={name}
                  onChange={e => setName(e.target.value)}
                  maxLength={50}
                  className="w-full bg-wa-input text-wa-text rounded-lg px-4 py-3 text-sm outline-none border border-transparent focus:border-wa-teal transition"
                  placeholder="Enter your name"
                />
                <p className="text-xs text-wa-text-sec mt-1 text-right">{name.length}/50</p>
              </div>

              {/* About */}
              <div>
                <label className="block text-xs text-wa-teal font-medium mb-2">About</label>
                <textarea
                  value={about}
                  onChange={e => setAbout(e.target.value)}
                  maxLength={139}
                  rows={3}
                  className="w-full bg-wa-input text-wa-text rounded-lg px-4 py-3 text-sm outline-none resize-none border border-transparent focus:border-wa-teal transition"
                  placeholder="Hey there! I'm using ChatApp."
                />
                <p className="text-xs text-wa-text-sec mt-1 text-right">{about.length}/139</p>
              </div>

              {/* Email (read-only) */}
              <div>
                <label className="block text-xs text-wa-teal font-medium mb-2">Email</label>
                <div className="bg-wa-input text-wa-text-sec rounded-lg px-4 py-3 text-sm">{user?.email}</div>
              </div>

              {/* Save */}
              <button
                onClick={handleSaveProfile}
                disabled={saving}
                className="w-full bg-wa-teal hover:bg-wa-teal-dk text-white font-semibold py-3 rounded-lg transition disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {saving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : null}
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          )}

          {/* Privacy Tab */}
          {tab === 'privacy' && (
            <div className="p-5 space-y-4">
              <p className="text-xs text-wa-text-sec uppercase tracking-wider font-semibold">Privacy Settings</p>
              {[
                { label: 'Last seen & Online', key: 'lastSeen' },
                { label: 'Profile photo', key: 'profilePhoto' },
                { label: 'About', key: 'about' },
                { label: 'Status', key: 'status' },
              ].map(({ label, key }) => (
                <div key={key} className="flex items-center justify-between py-3 border-b border-wa-border/50">
                  <span className="text-wa-text text-sm">{label}</span>
                  <select
                    defaultValue={user?.privacy?.[key] || 'everyone'}
                    onChange={async (e) => {
                      try {
                        await api.put('/users/privacy', { [key]: e.target.value });
                        updateUser({ privacy: { ...user?.privacy, [key]: e.target.value } });
                        toast.success('Privacy updated');
                      } catch { toast.error('Failed'); }
                    }}
                    className="bg-wa-input text-wa-text text-xs rounded-lg px-3 py-1.5 outline-none"
                  >
                    <option value="everyone">Everyone</option>
                    <option value="contacts">My Contacts</option>
                    <option value="nobody">Nobody</option>
                  </select>
                </div>
              ))}
              <div className="flex items-center justify-between py-3">
                <div>
                  <p className="text-wa-text text-sm">Read Receipts</p>
                  <p className="text-wa-text-sec text-xs mt-0.5">If turned off, you won't see read receipts</p>
                </div>
                <button
                  onClick={async () => {
                    const newVal = !(user?.privacy?.readReceipts ?? true);
                    try {
                      await api.put('/users/privacy', { readReceipts: newVal });
                      updateUser({ privacy: { ...user?.privacy, readReceipts: newVal } });
                    } catch {}
                  }}
                  className={`w-11 h-6 rounded-full transition relative ${user?.privacy?.readReceipts !== false ? 'bg-wa-teal' : 'bg-wa-border'}`}
                >
                  <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${user?.privacy?.readReceipts !== false ? 'left-5' : 'left-0.5'}`} />
                </button>
              </div>
            </div>
          )}

          {/* Notifications Tab */}
          {tab === 'notifications' && (
            <div className="p-5 space-y-2">
              <p className="text-xs text-wa-text-sec uppercase tracking-wider font-semibold mb-3">Notification Settings</p>
              {[
                { label: 'Messages', key: 'messages', desc: 'Get notified for new messages' },
                { label: 'Groups', key: 'groups', desc: 'Get notified for group messages' },
                { label: 'Calls', key: 'calls', desc: 'Get notified for incoming calls' },
                { label: 'Sound', key: 'sound', desc: 'Play notification sounds' },
              ].map(({ label, key, desc }) => (
                <div key={key} className="flex items-center justify-between py-3 border-b border-wa-border/50">
                  <div>
                    <p className="text-wa-text text-sm">{label}</p>
                    <p className="text-wa-text-sec text-xs mt-0.5">{desc}</p>
                  </div>
                  <button
                    onClick={async () => {
                      const newVal = !(user?.notifications?.[key] ?? true);
                      try {
                        await api.put('/users/notifications', { [key]: newVal });
                        updateUser({ notifications: { ...user?.notifications, [key]: newVal } });
                      } catch {}
                    }}
                    className={`w-11 h-6 rounded-full transition relative flex-shrink-0 ${user?.notifications?.[key] !== false ? 'bg-wa-teal' : 'bg-wa-border'}`}
                  >
                    <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${user?.notifications?.[key] !== false ? 'left-5' : 'left-0.5'}`} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Appearance Tab */}
          {tab === 'appearance' && (
            <div className="p-5 space-y-4">
              <p className="text-xs text-wa-text-sec uppercase tracking-wider font-semibold">Theme</p>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { id: 'dark', label: '🌙 Dark', desc: 'Easy on eyes' },
                  { id: 'light', label: '☀️ Light', desc: 'Bright & clean' },
                ].map(t => (
                  <button
                    key={t.id}
                    onClick={() => { if (theme !== t.id) toggleTheme(); }}
                    className={`p-4 rounded-xl border-2 text-left transition ${theme === t.id ? 'border-wa-teal bg-wa-teal/10' : 'border-wa-border hover:border-wa-teal/50'}`}
                  >
                    <div className="text-xl mb-1">{t.label.split(' ')[0]}</div>
                    <p className="text-wa-text text-sm font-medium">{t.label.split(' ').slice(1).join(' ')}</p>
                    <p className="text-wa-text-sec text-xs mt-0.5">{t.desc}</p>
                  </button>
                ))}
              </div>

              {/* Account info */}
              <div className="mt-6 pt-4 border-t border-wa-border">
                <p className="text-xs text-wa-text-sec uppercase tracking-wider font-semibold mb-3">Account</p>
                <div className="space-y-2 text-sm text-wa-text-sec">
                  <div className="flex justify-between">
                    <span>Role</span>
                    <span className={`capitalize font-medium ${user?.role === 'admin' ? 'text-wa-teal' : 'text-wa-text'}`}>{user?.role}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Account verified</span>
                    <span className={user?.isVerified ? 'text-green-400' : 'text-red-400'}>{user?.isVerified ? '✓ Yes' : '✗ No'}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
