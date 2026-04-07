import { useEffect, useState } from 'react';
import api from 'services/api';
import { formatDuration, formatLastSeen } from 'utils/formatTime';
import { useAuthStore } from 'store/useAuthStore';

export default function CallsList() {
  const { user } = useAuthStore();
  const [calls, setCalls] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get('/calls/history');
        setCalls(data.data || []);
      } catch {
        setCalls([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const getCallIcon = (call) => {
    const isIncoming = call.initiator?._id !== user?._id && call.initiator !== user?._id;
    const statusIcons = { missed: '📵', rejected: '❌', ended: isIncoming ? '📲' : '📞', ongoing: '📞', ringing: '📞' };
    const typeIcon = call.type === 'video' ? '🎥' : '📞';
    return { typeIcon, statusIcon: statusIcons[call.status] || '📞', isIncoming };
  };

  const getCallLabel = (call) => {
    const isIncoming = call.initiator?._id !== user?._id && call.initiator !== user?._id;
    if (call.status === 'missed') return { label: 'Missed', color: 'text-red-400' };
    if (call.status === 'rejected') return { label: isIncoming ? 'Declined' : 'Rejected', color: 'text-red-400' };
    if (call.status === 'ended') return { label: isIncoming ? 'Incoming' : 'Outgoing', color: 'text-wa-text-sec' };
    return { label: call.status, color: 'text-wa-text-sec' };
  };

  const getOtherParticipant = (call) => {
    const me = user?._id;
    if (call.initiator?._id === me || call.initiator === me) {
      return call.participants?.find(p => (p._id || p) !== me);
    }
    return call.initiator;
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-wa-teal border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="px-4 py-3 border-b border-wa-border">
        <h3 className="text-wa-text-sec text-xs font-semibold uppercase tracking-wider">Recent Calls</h3>
      </div>
      {calls.length === 0 ? (
        <div className="text-center text-wa-text-sec text-sm py-16 px-6">
          <div className="text-4xl mb-4">📞</div>
          <p>No call history yet.</p>
          <p className="text-xs mt-1 opacity-70">Your calls will appear here.</p>
        </div>
      ) : calls.map(call => {
        const other = getOtherParticipant(call);
        const { typeIcon, isIncoming } = getCallIcon(call);
        const { label, color } = getCallLabel(call);
        const otherName = other?.name || 'Unknown';

        return (
          <div key={call._id} className="flex items-center gap-3 px-4 py-3 hover:bg-wa-input/50 transition cursor-pointer border-b border-wa-border/30">
            {/* Avatar */}
            <div className="w-12 h-12 rounded-full bg-wa-teal/20 flex items-center justify-center flex-shrink-0 overflow-hidden">
              {other?.avatar
                ? <img src={other.avatar} alt="" className="w-full h-full object-cover" />
                : <span className="text-wa-teal font-bold text-lg">{otherName[0]?.toUpperCase()}</span>
              }
            </div>
            {/* Info */}
            <div className="flex-1 min-w-0">
              <p className="text-wa-text font-medium truncate">{otherName}</p>
              <p className={`text-xs ${color} flex items-center gap-1 mt-0.5`}>
                <span>{isIncoming ? '↙' : '↗'}</span>
                <span>{label}</span>
                {call.duration > 0 && <span className="text-wa-text-sec">· {formatDuration(call.duration)}</span>}
              </p>
            </div>
            {/* Type + Time */}
            <div className="flex flex-col items-end gap-1">
              <span className="text-wa-text-sec text-xs">{formatLastSeen(call.createdAt)}</span>
              <span className="text-base">{typeIcon}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
