import { useEffect, useRef, useState, useCallback } from 'react';
import { useCallStore } from 'store/useCallStore';
import { useChatStore } from 'store/useChatStore';
import { useSocket } from 'contexts/SocketContext';
import { formatDuration } from 'utils/formatTime';
import toast from 'react-hot-toast';

export default function CallScreen() {
  const { activeCall, clearCall } = useCallStore();
  const socket = useSocket();
  const [duration, setDuration] = useState(0);
  const [muted, setMuted] = useState(false);
  const [cameraOff, setCameraOff] = useState(false);
  const [speakerOff, setSpeakerOff] = useState(false);
  const [connected, setConnected] = useState(false);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const pcRef = useRef(null);
  const streamRef = useRef(null);
  const isVideo = activeCall?.callType === 'video';

  const endCall = useCallback(() => {
    socket?.emit('call:end', { roomId: activeCall?.roomId });
    streamRef.current?.getTracks().forEach(t => t.stop());
    pcRef.current?.close();
    clearCall();
  }, [socket, activeCall, clearCall]);

  // Timer
  useEffect(() => {
    if (!connected) return;
    const interval = setInterval(() => setDuration(d => d + 1), 1000);
    return () => clearInterval(interval);
  }, [connected]);

  // WebRTC setup
  useEffect(() => {
    if (!socket || !activeCall?.roomId) return;

    const setupWebRTC = async () => {
      try {
        const constraints = isVideo ? { video: true, audio: true } : { audio: true };
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        streamRef.current = stream;
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }

        const pc = new RTCPeerConnection({
          iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' }
          ]
        });
        pcRef.current = pc;

        stream.getTracks().forEach(t => pc.addTrack(t, stream));

        pc.ontrack = (e) => {
          setConnected(true);
          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = e.streams[0];
          }
        };

        pc.onicecandidate = (e) => {
          if (e.candidate) {
            socket.emit('webrtc:ice-candidate', {
              roomId: activeCall.roomId,
              candidate: e.candidate
            });
          }
        };

        pc.onconnectionstatechange = () => {
          if (pc.connectionState === 'connected') setConnected(true);
          if (['disconnected', 'failed', 'closed'].includes(pc.connectionState)) {
            setConnected(false);
          }
        };

        // Signaling listeners
        const handleOffer = async ({ offer }) => {
          await pc.setRemoteDescription(new RTCSessionDescription(offer));
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          socket.emit('webrtc:answer', { roomId: activeCall.roomId, answer });
        };

        const handleAnswer = async ({ answer }) => {
          await pc.setRemoteDescription(new RTCSessionDescription(answer));
        };

        const handleCandidate = async ({ candidate }) => {
          try { await pc.addIceCandidate(new RTCIceCandidate(candidate)); } catch {}
        };

        socket.on('webrtc:offer', handleOffer);
        socket.on('webrtc:answer', handleAnswer);
        socket.on('webrtc:ice-candidate', handleCandidate);

        // If initiator — wait for the receiver to finish mounting their peer connection
        const handleWebrtcReady = async () => {
          if (activeCall?.isInitiator) {
            try {
              const offer = await pc.createOffer();
              await pc.setLocalDescription(offer);
              socket.emit('webrtc:offer', { roomId: activeCall.roomId, offer });
            } catch (err) {
              console.error('Offer failed:', err);
              toast.error('Could not start call');
              endCall();
            }
          }
        };

        socket.on('webrtc:ready', handleWebrtcReady);

        // If receiver — notify the initiator that our PEER is fully bound
        if (!activeCall?.isInitiator) {
          socket.emit('webrtc:ready', { roomId: activeCall.roomId });
        }

        return () => {
          socket.off('webrtc:offer', handleOffer);
          socket.off('webrtc:answer', handleAnswer);
          socket.off('webrtc:ice-candidate', handleCandidate);
          socket.off('webrtc:ready', handleWebrtcReady);
        };
      } catch (err) {
        console.error('Media access error:', err);
        toast.error('Camera/microphone access denied');
        endCall();
      }
    };

    const cleanup = setupWebRTC();

    return () => {
      cleanup.then(fn => fn && fn());
      streamRef.current?.getTracks().forEach(t => t.stop());
      pcRef.current?.close();
    };
    // eslint-disable-next-line
  }, [socket, activeCall?.roomId]);

  const toggleMute = () => {
    const track = streamRef.current?.getAudioTracks()[0];
    if (track) { track.enabled = !track.enabled; setMuted(!track.enabled); }
  };

  const { activeChat, chats } = useChatStore();

  const toggleCamera = () => {
    const track = streamRef.current?.getVideoTracks()[0];
    if (track) { track.enabled = !track.enabled; setCameraOff(!track.enabled); }
  };

  const toggleSpeaker = () => {
    if (remoteVideoRef.current) {
      remoteVideoRef.current.muted = !remoteVideoRef.current.muted;
      setSpeakerOff(s => !s);
    }
  };

  const chat = chats.find(c => c._id === activeCall?.chatId) || activeChat;
  const targetUser = chat?.participants?.find(p => p._id === activeCall?.targetUserId);
  const callerName = activeCall?.callerInfo?.name || targetUser?.name || 'Unknown';

  return (
    <div className="fixed inset-0 bg-[#0b141a] z-50 flex flex-col">
      {/* Remote video / audio display */}
      {isVideo ? (
        <div className="relative flex-1">
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
          />
          {/* Local preview */}
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className="absolute bottom-28 right-4 w-32 h-44 rounded-2xl object-cover border-2 border-wa-teal shadow-xl"
          />
          {/* Overlay info */}
          <div className="absolute top-0 left-0 right-0 p-6 bg-gradient-to-b from-black/60 to-transparent">
            <p className="text-white text-xl font-semibold">{callerName}</p>
            <p className="text-white/70 text-sm mt-1">
              {connected ? formatDuration(duration) : 'Connecting...'}
            </p>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center gap-5 bg-[#0b141a]">
          <div
            className="w-28 h-28 rounded-full bg-wa-teal/20 flex items-center justify-center border-4 border-wa-teal/30 shadow-2xl"
            style={{ animation: connected ? 'none' : 'pulse 2s infinite' }}
          >
            <span className="text-5xl text-wa-teal font-bold">
              {callerName?.[0]?.toUpperCase()}
            </span>
          </div>
          <div className="text-center">
            <h2 className="text-white text-2xl font-semibold">{callerName}</h2>
            <p className="text-white/60 mt-2 text-base">
              {connected ? formatDuration(duration) : (
                <span className="flex items-center gap-2 justify-center">
                  <span>Connecting</span>
                  <span className="flex gap-1">
                    {[0,1,2].map(i => (
                      <span key={i} className="w-1.5 h-1.5 bg-white/50 rounded-full animate-bounce" style={{ animationDelay: `${i*150}ms` }} />
                    ))}
                  </span>
                </span>
              )}
            </p>
          </div>
          {/* Hidden audio element for voice call */}
          <video ref={remoteVideoRef} autoPlay playsInline className="hidden" />
          <video ref={localVideoRef} autoPlay playsInline muted className="hidden" />
        </div>
      )}

      {/* Controls bar */}
      <div className="absolute bottom-0 left-0 right-0 flex items-center justify-center gap-5 pb-8 pt-4 bg-gradient-to-t from-black/80 to-transparent">
        {/* Mute */}
        <button
          onClick={toggleMute}
          className={`w-14 h-14 rounded-full flex flex-col items-center justify-center text-lg shadow-lg transition gap-0.5 ${muted ? 'bg-white/20 text-red-400' : 'bg-white/15 text-white hover:bg-white/25'}`}
          title={muted ? 'Unmute' : 'Mute'}
        >
          {muted ? '🔇' : '🎤'}
          <span className="text-[9px] text-white/60">{muted ? 'Unmute' : 'Mute'}</span>
        </button>

        {/* Camera (video only) */}
        {isVideo && (
          <button
            onClick={toggleCamera}
            className={`w-14 h-14 rounded-full flex flex-col items-center justify-center text-lg shadow-lg transition gap-0.5 ${cameraOff ? 'bg-white/20 text-red-400' : 'bg-white/15 text-white hover:bg-white/25'}`}
            title={cameraOff ? 'Turn on camera' : 'Turn off camera'}
          >
            {cameraOff ? '🚫' : '📹'}
            <span className="text-[9px] text-white/60">Camera</span>
          </button>
        )}

        {/* End call */}
        <button
          onClick={endCall}
          className="w-16 h-16 rounded-full bg-red-500 hover:bg-red-600 flex flex-col items-center justify-center text-white text-xl shadow-xl transition gap-0.5"
          title="End call"
        >
          📵
          <span className="text-[9px]">End</span>
        </button>

        {/* Speaker */}
        <button
          onClick={toggleSpeaker}
          className={`w-14 h-14 rounded-full flex flex-col items-center justify-center text-lg shadow-lg transition gap-0.5 ${speakerOff ? 'bg-white/20 text-red-400' : 'bg-white/15 text-white hover:bg-white/25'}`}
          title={speakerOff ? 'Unmute speaker' : 'Mute speaker'}
        >
          {speakerOff ? '🔈' : '🔊'}
          <span className="text-[9px] text-white/60">Speaker</span>
        </button>
      </div>
    </div>
  );
}
