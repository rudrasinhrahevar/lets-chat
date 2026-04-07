import { useState, useEffect } from 'react';
import { useStatusStore } from 'store/useStatusStore';
import { useSocket } from 'contexts/SocketContext';
import { formatTime } from 'utils/formatTime';

export default function StatusViewer() {
  const { viewingStatus, setViewingStatus } = useStatusStore();
  const socket = useSocket();
  const [index, setIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const statuses = viewingStatus?.statuses || [];
  const current = statuses[index];

  useEffect(() => {
    if (!current) return;
    socket?.emit('status:view', { statusId: current._id, ownerId: viewingStatus.user._id });
    setProgress(0);
    const interval = setInterval(() => {
      setProgress(p => { if (p >= 100) { if (index < statuses.length - 1) setIndex(i => i + 1); else setViewingStatus(null); return 0; } return p + 2; });
    }, 100);
    return () => clearInterval(interval);
  }, [index, current, socket, viewingStatus, statuses.length, setViewingStatus]);

  if (!current) return null;
  const goNext = () => { if (index < statuses.length - 1) setIndex(i => i + 1); else setViewingStatus(null); };
  const goPrev = () => { if (index > 0) setIndex(i => i - 1); };

  return (
    <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
      <div className="absolute top-0 left-0 right-0 flex gap-1 p-2 z-10">{statuses.map((_, i) => (<div key={i} className="flex-1 h-0.5 bg-white/20 rounded-full overflow-hidden"><div className={`h-full bg-white transition-all duration-100 ${i < index ? 'w-full' : i === index ? '' : 'w-0'}`} style={i === index ? { width: `${progress}%` } : {}} /></div>))}</div>
      <div className="absolute top-6 left-0 right-0 flex items-center gap-3 p-4 z-10">
        <div className="w-10 h-10 rounded-full bg-wa-teal/20 flex items-center justify-center overflow-hidden">{viewingStatus.user.avatar ? <img src={viewingStatus.user.avatar} alt="" className="w-full h-full object-cover" /> : <span className="text-wa-teal font-bold">{viewingStatus.user.name?.[0]}</span>}</div>
        <div><p className="text-white font-medium text-sm">{viewingStatus.user.name}</p><p className="text-white/60 text-xs">{formatTime(current.createdAt)}</p></div>
        <button onClick={() => setViewingStatus(null)} className="ml-auto text-white/80 hover:text-white text-xl">✕</button>
      </div>
      <div className="w-full max-w-lg h-[70vh] flex items-center justify-center" style={{ background: current.background || '#128C7E' }}>
        {current.type === 'text' ? <p className="text-white text-2xl text-center font-medium px-8">{current.content}</p> : current.media?.url ? (current.type === 'video' ? <video src={current.media.url} autoPlay className="max-w-full max-h-full object-contain" /> : <img src={current.media.url} alt="" className="max-w-full max-h-full object-contain" />) : null}
      </div>
      <button onClick={goPrev} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-white text-3xl" disabled={index === 0}>‹</button>
      <button onClick={goNext} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-white text-3xl">›</button>
    </div>
  );
}
