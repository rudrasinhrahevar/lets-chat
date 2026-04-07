import { useCallStore } from 'store/useCallStore';
import { useSocket } from 'contexts/SocketContext';

export default function IncomingCall() {
  const { incomingCall, setActiveCall, clearCall } = useCallStore();
  const socket = useSocket();
  if (!incomingCall) return null;
  const accept = () => { socket?.emit('call:accept', { roomId: incomingCall.roomId }); setActiveCall({ ...incomingCall, status: 'ongoing' }); };
  const reject = () => { socket?.emit('call:reject', { roomId: incomingCall.roomId }); clearCall(); };

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center">
      <div className="bg-wa-panel rounded-2xl p-8 text-center shadow-2xl w-80 animate-bounce-in">
        <div className="w-20 h-20 rounded-full bg-wa-teal/20 flex items-center justify-center mx-auto mb-4">{incomingCall.callerInfo?.avatar ? <img src={incomingCall.callerInfo.avatar} alt="" className="w-full h-full rounded-full object-cover" /> : <span className="text-3xl text-wa-teal font-bold">{incomingCall.callerInfo?.name?.[0]}</span>}</div>
        <h3 className="text-lg font-semibold text-wa-text">{incomingCall.callerInfo?.name}</h3>
        <p className="text-wa-text-sec text-sm mt-1">Incoming {incomingCall.callType} call...</p>
        <div className="flex justify-center gap-8 mt-8">
          <button onClick={reject} className="w-14 h-14 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center text-white text-xl shadow-lg transition">📞</button>
          <button onClick={accept} className="w-14 h-14 rounded-full bg-green-500 hover:bg-green-600 flex items-center justify-center text-white text-xl shadow-lg transition animate-pulse">📞</button>
        </div>
      </div>
    </div>
  );
}
