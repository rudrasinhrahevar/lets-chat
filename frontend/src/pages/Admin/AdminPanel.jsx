import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminStore } from 'store/useAdminStore';
import api from 'services/api';
import toast from 'react-hot-toast';
import { LineChart, Line, AreaChart, Area, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function AdminPanel() {
  const navigate = useNavigate();
  const { 
    stats, setStats, 
    users, setUsers, 
    labels, setLabels, 
    quickReplies, setQuickReplies, 
    analytics, setAnalytics,
    catalog, setCatalog,
    automations, setAutomations
  } = useAdminStore();
  
  const [tab, setTab] = useState('dashboard');
  const [userSearch, setUserSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // States for CRUD forms
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        await Promise.all([
          api.get('/admin/stats').then(r => setStats(r.data.data)),
          api.get('/admin/users?limit=50').then(r => setUsers(r.data.data)),
          api.get('/admin/labels').then(r => setLabels(r.data.data)),
          api.get('/admin/quick-replies').then(r => setQuickReplies(r.data.data)),
          api.get('/admin/analytics').then(r => setAnalytics(r.data.data)),
          api.get('/admin/catalog').then(r => setCatalog(r.data.data)),
          api.get('/admin/automations').then(r => setAutomations(r.data.data))
        ]);
      } catch (err) {
        console.error('Failed to load admin data', err);
      }
      setLoading(false);
    };
    loadData();
  }, [setStats, setUsers, setLabels, setQuickReplies, setAnalytics, setCatalog, setAutomations]);

  // User Actions
  const searchUsers = async () => { 
    const { data } = await api.get(`/admin/users?q=${userSearch}&limit=50`); 
    setUsers(data.data); 
  };
  
  const handleBan = async (id, ban) => { 
    try {
      await api.put(`/admin/users/${id}/${ban ? 'ban' : 'unban'}`, { reason: 'Admin action' }); 
      toast.success(`User ${ban ? 'banned' : 'unbanned'}`); 
      searchUsers(); 
    } catch { toast.error('Action failed'); }
  };
  
  const handleRoleChange = async (id, role) => { 
    try {
      await api.put(`/admin/users/${id}/role`, { role }); 
      toast.success('Role updated'); 
      searchUsers(); 
    } catch { toast.error('Action failed'); }
  };

  // Generic CRUD Handlers
  const handleSave = async (type) => {
    try {
      const endpoint = `/admin/${type}`;
      if (editingItem?._id) {
        await api.put(`${endpoint}/${editingItem._id}`, formData);
        toast.success('Updated successfully');
      } else {
        await api.post(endpoint, formData);
        toast.success('Created successfully');
      }
      
      // Reload specific data
      const { data } = await api.get(endpoint);
      if (type === 'labels') setLabels(data.data);
      if (type === 'quick-replies') setQuickReplies(data.data);
      if (type === 'catalog') setCatalog(data.data);
      
      setEditingItem(null);
      setFormData({});
    } catch {
      toast.error('Failed to save');
    }
  };

  const handleDelete = async (type, id) => {
    if (!window.confirm('Delete this item?')) return;
    try {
      await api.delete(`/admin/${type}/${id}`);
      toast.success('Deleted');
      
      // Reload specific data
      const { data } = await api.get(`/admin/${type}`);
      if (type === 'labels') setLabels(data.data);
      if (type === 'quick-replies') setQuickReplies(data.data);
      if (type === 'catalog') setCatalog(data.data);
      if (type === 'automations') setAutomations(data.data);
    } catch {
      toast.error('Failed to delete');
    }
  };

  const tabs = [
    { id: 'dashboard', label: '📊 Dashboard' },
    { id: 'analytics', label: '📈 Analytics' },
    { id: 'users', label: '👥 Users' },
    { id: 'broadcast', label: '📢 Broadcast' },
    { id: 'automations', label: '🤖 Automations' },
    { id: 'labels', label: '🏷️ Labels' },
    { id: 'quick-replies', label: '💬 Quick Replies' },
    { id: 'catalog', label: '🛍️ Catalog' }
  ];

  if (loading) {
    return <div className="min-h-screen bg-wa-bg text-wa-text flex items-center justify-center">Loading admin panel...</div>;
  }

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  return (
    <div className="min-h-screen bg-wa-bg text-wa-text flex flex-col">
      {/* Top Navbar */}
      <div className="bg-wa-panel border-b border-wa-border px-6 py-3 flex items-center justify-between shadow-sm z-10">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/')} className="text-wa-icon hover:text-wa-teal transition flex items-center gap-2">
            ← <span className="font-medium">Exit Admin</span>
          </button>
          <div className="h-6 w-px bg-wa-border" />
          <h1 className="text-lg font-bold text-wa-teal flex items-center gap-2">
            🛡️ Admin Portal
          </h1>
        </div>
        <div className="text-sm text-wa-text-sec">
          Last updated: {new Date().toLocaleTimeString()}
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="w-64 bg-wa-panel border-r border-wa-border flex flex-col overflow-y-auto">
          <div className="p-4">
            <p className="text-xs uppercase tracking-wider font-semibold text-wa-text-sec mb-2">Menu</p>
            <div className="space-y-1">
              {tabs.map(t => (
                <button 
                  key={t.id} 
                  onClick={() => { setTab(t.id); setEditingItem(null); }} 
                  className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition ${tab === t.id ? 'bg-wa-teal text-white shadow-md' : 'hover:bg-wa-input text-wa-text'}`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8 overflow-y-auto bg-wa-bg">
          <h2 className="text-2xl font-bold mb-6 text-wa-text">
            {tabs.find(t => t.id === tab)?.label.split(' ')[1]}
          </h2>

          {/* DASHBOARD TAB */}
          {tab === 'dashboard' && stats && (
            <div className="space-y-6 animate-slide-up">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                {[
                  { label: 'Total Users', value: stats.totalUsers, icon: '👥', color: 'bg-blue-500/10 border-blue-500/20 text-blue-400' },
                  { label: 'Online Now', value: stats.activeNow, icon: '🟢', color: 'bg-green-500/10 border-green-500/20 text-green-400' },
                  { label: 'New Today', value: stats.newToday, icon: '🆕', color: 'bg-purple-500/10 border-purple-500/20 text-purple-400' },
                  { label: 'Messages Today', value: stats.messagesToday, icon: '💬', color: 'bg-wa-teal/10 border-wa-teal/20 text-wa-teal' },
                  { label: 'Total Groups', value: stats.totalGroups, icon: '👥', color: 'bg-orange-500/10 border-orange-500/20 text-orange-400' },
                  { label: 'Total Calls', value: stats.totalCalls, icon: '📞', color: 'bg-pink-500/10 border-pink-500/20 text-pink-400' }
                ].map(s => (
                  <div key={s.label} className={`${s.color} border rounded-xl p-5 shadow-sm`}>
                    <div className="text-2xl mb-2">{s.icon}</div>
                    <p className="text-3xl font-bold">{s.value}</p>
                    <p className="text-sm opacity-80 mt-1">{s.label}</p>
                  </div>
                ))}
              </div>

              {/* Quick glance charts inside Dashboard */}
              {analytics && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                  <div className="bg-wa-panel border border-wa-border rounded-xl p-5 shadow-sm">
                    <h3 className="text-base font-semibold mb-4">Messages (30 Days)</h3>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={analytics.messagesByDay}>
                          <defs>
                            <linearGradient id="colorMsgs" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#00a884" stopOpacity={0.3}/>
                              <stop offset="95%" stopColor="#00a884" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#222d34" />
                          <XAxis dataKey="_id" stroke="#8696a0" fontSize={12} />
                          <YAxis stroke="#8696a0" fontSize={12} />
                          <Tooltip contentStyle={{ backgroundColor: '#111b21', borderColor: '#222d34' }} />
                          <Area type="monotone" dataKey="count" stroke="#00a884" fillOpacity={1} fill="url(#colorMsgs)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                  
                  <div className="bg-wa-panel border border-wa-border rounded-xl p-5 shadow-sm">
                    <h3 className="text-base font-semibold mb-4">Message Types</h3>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={analytics.messageTypes} dataKey="count" nameKey="_id" cx="50%" cy="50%" outerRadius={80} label>
                            {analytics.messageTypes.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip contentStyle={{ backgroundColor: '#111b21', borderColor: '#222d34' }} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ANALYTICS TAB */}
          {tab === 'analytics' && analytics && (
            <div className="space-y-6 animate-slide-up">
              <div className="bg-wa-panel border border-wa-border rounded-xl p-6 shadow-sm">
                <h3 className="text-lg font-semibold mb-6">User Growth (Last 30 Days)</h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={analytics.userGrowth}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#222d34" />
                      <XAxis dataKey="_id" stroke="#8696a0" />
                      <YAxis stroke="#8696a0" />
                      <Tooltip contentStyle={{ backgroundColor: '#111b21', borderColor: '#222d34' }} />
                      <Line type="monotone" dataKey="count" stroke="#53bdeb" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {/* USERS TAB */}
          {tab === 'users' && (
            <div className="animate-slide-up">
              <div className="flex gap-3 mb-6">
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-wa-icon">🔍</span>
                  <input 
                    value={userSearch} 
                    onChange={e => setUserSearch(e.target.value)} 
                    onKeyDown={e => e.key === 'Enter' && searchUsers()}
                    className="w-full bg-wa-input text-wa-text border border-wa-border rounded-lg pl-10 pr-4 py-2.5 text-sm outline-none focus:border-wa-teal transition" 
                    placeholder="Search users by name or email..." 
                  />
                </div>
                <button onClick={searchUsers} className="bg-wa-teal hover:bg-wa-teal-dk text-white px-6 py-2.5 rounded-lg text-sm font-medium transition">Search</button>
              </div>

              <div className="bg-wa-panel border border-wa-border rounded-xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-wa-input text-left text-wa-text-sec text-xs uppercase tracking-wider">
                        <th className="px-6 py-4 font-semibold">User</th>
                        <th className="px-6 py-4 font-semibold">Role</th>
                        <th className="px-6 py-4 font-semibold">Status</th>
                        <th className="px-6 py-4 font-semibold">Joined</th>
                        <th className="px-6 py-4 font-semibold text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-wa-border/50">
                      {users.map(u => (
                        <tr key={u._id} className="hover:bg-wa-input/30 transition">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-wa-teal/20 flex items-center justify-center text-sm text-wa-teal font-bold overflow-hidden border border-wa-teal/30">
                                {u.avatar ? <img src={u.avatar} alt="" className="w-full h-full object-cover"/> : u.name?.[0]}
                              </div>
                              <div>
                                <p className="font-medium">{u.name}</p>
                                <p className="text-wa-text-sec text-xs">{u.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <select 
                              value={u.role} 
                              onChange={e => handleRoleChange(u._id, e.target.value)} 
                              className="bg-wa-bg text-wa-text border border-wa-border hover:border-wa-teal/50 rounded-lg px-3 py-1.5 text-xs outline-none focus:ring-2 focus:ring-wa-teal/20 transition cursor-pointer"
                            >
                              <option value="user">User</option>
                              <option value="agent">Agent</option>
                              <option value="admin">Admin</option>
                            </select>
                          </td>
                          <td className="px-6 py-4">
                            {u.isBanned ? (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-red-500/10 text-red-500 border border-red-500/20">
                                <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span> Banned
                              </span>
                            ) : u.isOnline ? (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-500 border border-green-500/20">
                                <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> Online
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-gray-500/10 text-gray-400 border border-gray-500/20">
                                <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span> Offline
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-wa-text-sec">
                            {new Date(u.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button 
                              onClick={() => handleBan(u._id, !u.isBanned)} 
                              className={`text-xs px-4 py-1.5 rounded-lg border transition ${
                                u.isBanned 
                                  ? 'border-green-500/30 text-green-500 hover:bg-green-500/10' 
                                  : 'border-red-500/30 text-red-500 hover:bg-red-500/10'
                              }`}
                            >
                              {u.isBanned ? 'Unban User' : 'Ban User'}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* LABELS TAB */}
          {tab === 'labels' && (
            <div className="animate-slide-up grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {labels.map(l => (
                    <div key={l._id} className="flex items-center justify-between bg-wa-panel border border-wa-border rounded-xl p-4 shadow-sm hover:border-wa-teal/30 transition group">
                      <div className="flex items-center gap-4">
                        <div className="w-5 h-5 rounded-md shadow-sm" style={{ background: l.color }} />
                        <div>
                          <p className="font-medium text-sm">{l.name}</p>
                        </div>
                      </div>
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition">
                        <button onClick={() => { setEditingItem(l); setFormData(l); }} className="p-1.5 text-wa-icon hover:text-wa-teal bg-wa-input rounded-md">✏️</button>
                        <button onClick={() => handleDelete('labels', l._id)} className="p-1.5 text-wa-icon hover:text-red-400 bg-wa-input rounded-md">🗑️</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-wa-panel border border-wa-border rounded-xl p-6 shadow-sm h-fit sticky top-0">
                <h3 className="font-semibold mb-4 pb-2 border-b border-wa-border">
                  {editingItem ? 'Edit Label' : 'Create Label'}
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-xs text-wa-text-sec uppercase mb-1 block">Name</label>
                    <input 
                      value={formData.name || ''} 
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                      className="w-full bg-wa-input text-wa-text rounded-lg px-4 py-2 border border-transparent focus:border-wa-teal outline-none text-sm"
                      placeholder="e.g. VIP Customer"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-wa-text-sec uppercase mb-1 block">Color</label>
                    <input 
                      type="color"
                      value={formData.color || '#00a884'} 
                      onChange={e => setFormData({ ...formData, color: e.target.value })}
                      className="w-full h-10 bg-wa-input rounded-lg border-none outline-none cursor-pointer"
                    />
                  </div>
                  <div className="flex gap-2 pt-2">
                    <button onClick={() => handleSave('labels')} className="flex-1 bg-wa-teal hover:bg-wa-teal-dk text-white py-2 rounded-lg text-sm font-medium transition">Save</button>
                    {editingItem && <button onClick={() => { setEditingItem(null); setFormData({}); }} className="px-4 bg-wa-input hover:bg-wa-border text-wa-text py-2 rounded-lg text-sm transition">Cancel</button>}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* QUICK REPLIES TAB */}
          {tab === 'quick-replies' && (
            <div className="animate-slide-up grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-4">
                {quickReplies.map(qr => (
                  <div key={qr._id} className="bg-wa-panel border border-wa-border rounded-xl p-5 shadow-sm hover:border-wa-teal/30 transition relative group">
                    <div className="absolute right-4 top-4 flex gap-2 opacity-0 group-hover:opacity-100 transition">
                      <button onClick={() => { setEditingItem(qr); setFormData(qr); }} className="p-1.5 text-wa-icon hover:text-wa-teal bg-wa-input rounded-md">✏️</button>
                      <button onClick={() => handleDelete('quick-replies', qr._id)} className="p-1.5 text-wa-icon hover:text-red-400 bg-wa-input rounded-md">🗑️</button>
                    </div>
                    <div className="inline-block px-3 py-1 bg-wa-teal/10 text-wa-teal rounded-lg font-mono text-sm mb-3 font-medium">
                      {qr.shortcut}
                    </div>
                    <p className="text-wa-text-sec whitespace-pre-wrap text-sm">{qr.message}</p>
                  </div>
                ))}
              </div>

              <div className="bg-wa-panel border border-wa-border rounded-xl p-6 shadow-sm h-fit sticky top-0">
                <h3 className="font-semibold mb-4 pb-2 border-b border-wa-border">
                  {editingItem ? 'Edit Quick Reply' : 'Create Quick Reply'}
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-xs text-wa-text-sec uppercase mb-1 block">Shortcut</label>
                    <input 
                      value={formData.shortcut || ''} 
                      onChange={e => setFormData({ ...formData, shortcut: e.target.value })}
                      className="w-full bg-wa-input text-wa-text rounded-lg px-4 py-2 border border-transparent focus:border-wa-teal outline-none text-sm font-mono"
                      placeholder="/hello"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-wa-text-sec uppercase mb-1 block">Message</label>
                    <textarea 
                      value={formData.message || ''} 
                      onChange={e => setFormData({ ...formData, message: e.target.value })}
                      rows={5}
                      className="w-full bg-wa-input text-wa-text rounded-lg px-4 py-3 border border-transparent focus:border-wa-teal outline-none text-sm resize-none"
                      placeholder="Enter the full message..."
                    />
                  </div>
                  <div className="flex gap-2 pt-2">
                    <button onClick={() => handleSave('quick-replies')} className="flex-1 bg-wa-teal hover:bg-wa-teal-dk text-white py-2 rounded-lg text-sm font-medium transition">Save</button>
                    {editingItem && <button onClick={() => { setEditingItem(null); setFormData({}); }} className="px-4 bg-wa-input hover:bg-wa-border text-wa-text py-2 rounded-lg text-sm transition">Cancel</button>}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* CATALOG TAB */}
          {tab === 'catalog' && (
            <div className="animate-slide-up grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                {catalog?.map(item => (
                  <div key={item._id} className="bg-wa-panel border border-wa-border rounded-xl p-5 shadow-sm hover:border-wa-teal/30 transition relative group">
                    <div className="absolute right-4 top-4 flex gap-2 opacity-0 group-hover:opacity-100 transition">
                      <button onClick={() => { setEditingItem(item); setFormData(item); }} className="p-1 text-wa-icon hover:text-wa-teal">✏️</button>
                      <button onClick={() => handleDelete('catalog', item._id)} className="p-1 text-wa-icon hover:text-red-400">🗑️</button>
                    </div>
                    <h4 className="font-medium text-wa-teal text-lg mb-1 pr-16">{item.name}</h4>
                    <p className="text-2xl font-bold text-wa-text mb-2">₹{item.price}</p>
                    <p className="text-wa-text-sec text-sm mt-2">{item.description}</p>
                  </div>
                ))}
                {(!catalog || catalog.length === 0) && (
                  <div className="col-span-2 text-center py-12 text-wa-text-sec border border-dashed border-wa-border rounded-xl">
                    No catalog items yet.
                  </div>
                )}
              </div>

              <div className="bg-wa-panel border border-wa-border rounded-xl p-6 shadow-sm h-fit sticky top-0">
                <h3 className="font-semibold mb-4 pb-2 border-b border-wa-border">
                  {editingItem ? 'Edit Product' : 'Add Product'}
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-xs text-wa-text-sec uppercase mb-1 block">Name</label>
                    <input 
                      value={formData.name || ''} 
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                      className="w-full bg-wa-input text-wa-text rounded-lg px-4 py-2 border border-transparent focus:border-wa-teal outline-none text-sm"
                      placeholder="Product Name"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-wa-text-sec uppercase mb-1 block">Price (₹)</label>
                    <input 
                      type="number"
                      value={formData.price || ''} 
                      onChange={e => setFormData({ ...formData, price: e.target.value })}
                      className="w-full bg-wa-input text-wa-text rounded-lg px-4 py-2 border border-transparent focus:border-wa-teal outline-none text-sm"
                      placeholder="999"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-wa-text-sec uppercase mb-1 block">Description</label>
                    <textarea 
                      value={formData.description || ''} 
                      onChange={e => setFormData({ ...formData, description: e.target.value })}
                      rows={3}
                      className="w-full bg-wa-input text-wa-text rounded-lg px-4 py-2 border border-transparent focus:border-wa-teal outline-none text-sm resize-none"
                      placeholder="Product details..."
                    />
                  </div>
                  <div className="flex gap-2 pt-2">
                    <button onClick={() => handleSave('catalog')} className="flex-1 bg-wa-teal hover:bg-wa-teal-dk text-white py-2 rounded-lg text-sm font-medium transition">Save</button>
                    {editingItem && <button onClick={() => { setEditingItem(null); setFormData({}); }} className="px-4 bg-wa-input hover:bg-wa-border text-wa-text py-2 rounded-lg text-sm transition">Cancel</button>}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* BROADCAST TAB */}
          {tab === 'broadcast' && (
            <div className="animate-slide-up max-w-2xl bg-wa-panel border border-wa-border rounded-xl p-8 shadow-sm">
              <h3 className="text-lg font-semibold mb-2">Send Broadcast Message</h3>
              <p className="text-wa-text-sec text-sm mb-6">Send a message to multiple users simultaneously.</p>
              
              <div className="space-y-6">
                <div>
                  <label className="text-sm font-medium block mb-2">Message</label>
                  <textarea 
                    rows={4}
                    className="w-full bg-wa-input text-wa-text border border-wa-border hover:border-wa-teal/50 focus:border-wa-teal rounded-xl p-4 outline-none resize-none transition"
                    placeholder="Enter broadcast message here..."
                  ></textarea>
                </div>
                
                <div>
                  <label className="text-sm font-medium block mb-2">Target Audience</label>
                  <select className="w-full bg-wa-input text-wa-text border border-wa-border hover:border-wa-teal/50 focus:border-wa-teal rounded-xl px-4 py-3 outline-none transition cursor-pointer">
                    <option value="all">All Users</option>
                    <option value="active">Active Users (last 30 days)</option>
                    <option value="online">Currently Online Users</option>
                  </select>
                </div>
                
                <button 
                  onClick={() => toast.success('Broadcast sent successfully!')}
                  className="w-full bg-wa-teal hover:bg-wa-teal-dk text-white font-medium py-3 rounded-xl shadow-md transition flex justify-center items-center gap-2"
                >
                  📢 <span>Send Broadcast</span>
                </button>
              </div>
            </div>
          )}

          {/* AUTOMATIONS TAB */}
          {tab === 'automations' && (
            <div className="animate-slide-up">
              <div className="flex justify-between items-center mb-6">
                <p className="text-wa-text-sec">Manage automated responses and routing rules.</p>
                <button className="bg-wa-teal hover:bg-wa-teal-dk text-white px-4 py-2 rounded-lg text-sm font-medium transition flex gap-2 items-center">
                  <span>+</span> New Rule
                </button>
              </div>
              
              <div className="grid grid-cols-1 gap-4">
                {automations?.map(rule => (
                  <div key={rule._id} className="bg-wa-panel border border-wa-border rounded-xl p-5 shadow-sm flex items-center justify-between group hover:border-wa-teal/30 transition">
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <h4 className="font-semibold text-wa-text">{rule.name}</h4>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${rule.isActive ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-wa-input text-wa-text-sec border-wa-border'}`}>
                          {rule.isActive ? 'ACTIVE' : 'INACTIVE'}
                        </span>
                      </div>
                      <p className="text-wa-text-sec text-sm">
                        Trigger: <span className="text-wa-teal bg-wa-teal/10 px-1.5 py-0.5 rounded font-mono text-xs">{rule.trigger}</span>
                      </p>
                      {rule.actions?.length > 0 && (
                        <p className="text-sm mt-2 flex gap-2 flex-wrap">
                          {rule.actions.map((act, i) => (
                            <span key={i} className="bg-wa-input px-2 py-1 rounded-md text-xs border border-wa-border/50">
                              → {act.type.replace('_', ' ')}: {act.value}
                            </span>
                          ))}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2">
                       <button className="p-2 text-wa-icon hover:text-wa-teal transition bg-wa-input rounded-lg">⚙️ Edit</button>
                    </div>
                  </div>
                ))}
                {(!automations || automations.length === 0) && (
                  <div className="text-center py-16 text-wa-text-sec border border-dashed border-wa-border rounded-xl bg-wa-panel">
                    <p className="text-4xl mb-4">🤖</p>
                    <p>No automation rules configured.</p>
                  </div>
                )}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
