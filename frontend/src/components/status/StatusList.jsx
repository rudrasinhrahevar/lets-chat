import { useEffect, useState } from 'react';
import { useStatusStore } from 'store/useStatusStore';
import api from 'services/api';
import toast from 'react-hot-toast';

export default function StatusList() {
  const { statuses, myStatuses, setStatuses, setMyStatuses, setViewingStatus } = useStatusStore();
  const [showCreate, setShowCreate] = useState(false);
  const [text, setText] = useState('');
  const [bg, setBg] = useState('#128C7E');

  useEffect(() => {
    const load = async () => {
      try { const [all, mine] = await Promise.all([api.get('/status'), api.get('/status/my')]); setStatuses(all.data.data); setMyStatuses(mine.data.data); } catch {}
    };
    load();
  }, [setStatuses, setMyStatuses]);

  const handleCreate = async () => {
    try { await api.post('/status', { type: 'text', content: text, background: bg }); toast.success('Status posted!'); setText(''); setShowCreate(false); const { data } = await api.get('/status/my'); setMyStatuses(data.data); } catch (err) { toast.error('Failed to post status'); }
  };

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="p-4">
        <button onClick={() => setShowCreate(true)} className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-wa-input transition mb-4">
          <div className="w-12 h-12 rounded-full bg-wa-teal/20 flex items-center justify-center border-2 border-wa-teal border-dashed"><span className="text-xl">+</span></div>
          <div><p className="text-sm font-semibold text-wa-text">My Status</p><p className="text-xs text-wa-text-sec">{myStatuses.length} updates</p></div>
        </button>
        <p className="text-xs text-wa-text-sec uppercase tracking-wider mb-2 px-1">Recent Updates</p>
        {statuses.map(group => (
          <button key={group.user._id} onClick={() => setViewingStatus(group)} className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-wa-input transition">
            <div className="w-12 h-12 rounded-full bg-wa-teal/20 flex items-center justify-center border-2 border-wa-teal overflow-hidden">{group.user.avatar ? <img src={group.user.avatar} alt="" className="w-full h-full object-cover" /> : <span className="text-wa-teal font-bold">{group.user.name?.[0]}</span>}</div>
            <div className="text-left"><p className="text-sm font-medium text-wa-text">{group.user.name}</p><p className="text-xs text-wa-text-sec">{group.statuses.length} updates</p></div>
          </button>
        ))}
        {statuses.length === 0 && <p className="text-center text-wa-text-sec text-sm py-8">No status updates</p>}
      </div>
      {showCreate && (<div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center" onClick={() => setShowCreate(false)}>
        <div className="w-full max-w-md mx-4 rounded-xl overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
          <div className="p-8 min-h-[300px] flex flex-col items-center justify-center" style={{ background: bg }}>
            <textarea value={text} onChange={e => setText(e.target.value)} className="w-full bg-transparent text-white text-xl text-center resize-none outline-none placeholder:text-white/50" placeholder="Type a status" rows={4} autoFocus />
          </div>
          <div className="bg-wa-panel p-4 flex items-center justify-between">
            <div className="flex gap-2">{['#128C7E','#25D366','#075E54','#FF6B6B','#4834D4','#34495E'].map(c => <button key={c} onClick={() => setBg(c)} className={`w-7 h-7 rounded-full border-2 ${bg === c ? 'border-white' : 'border-transparent'}`} style={{ background: c }} />)}</div>
            <button onClick={handleCreate} disabled={!text.trim()} className="bg-wa-teal text-white px-6 py-2 rounded-full font-medium disabled:opacity-50">Post</button>
          </div>
        </div>
      </div>)}
    </div>
  );
}
