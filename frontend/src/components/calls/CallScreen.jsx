import { useEffect, useRef, useState, useCallback } from 'react';
import { useCallStore } from 'store/useCallStore';
import { useChatStore } from 'store/useChatStore';
import { useSocket } from 'contexts/SocketContext';
import { formatDuration } from 'utils/formatTime';
import toast from 'react-hot-toast';

// Free TURN servers for NAT traversal (Metered.ca public relays)
const ICE_SERVERS = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
  { urls: 'stun:stun2.l.google.com:19302' },
  { urls: 'stun:stun.relay.metered.ca:80' },
  {
    urls: 'turn:a.relay.metered.ca:80',
    username: 'e8dd65b92f6dfbc5e9277f48',
    credential: '4F5qFMTpQe/9gdkb',
  },
  {
    urls: 'turn:a.relay.metered.ca:443',
    username: 'e8dd65b92f6dfbc5e9277f48',
    credential: '4F5qFMTpQe/9gdkb',
  },
  {
    urls: 'turn:a.relay.metered.ca:443?transport=tcp',
    username: 'e8dd65b92f6dfbc5e9277f48',
    credential: '4F5qFMTpQe/9gdkb',
  },
];

export default function CallScreen() {
  const { activeCall, clearCall } = useCallStore();
  const { chats, activeChat } = useChatStore();
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
  const remoteStreamRef = useRef(null); // Buffer for remote stream
  const iceCandidateBuffer = useRef([]); // Buffer ICE candidates before remote description
  const isVideo = activeCall?.callType === 'video';

  const endCall = useCallback(() => {
    socket?.emit('call:end', { roomId: activeCall?.roomId });
    streamRef.current?.getTracks().forEach(t => t.stop());
    pcRef.current?.close();
    pcRef.current = null;
    streamRef.current = null;
    remoteStreamRef.current = null;
    clearCall();
  }, [socket, activeCall, clearCall]);

  // Timer
  useEffect(() => {
    if (!connected) return;
    const interval = setInterval(() => setDuration(d => d + 1), 1000);
    return () => clearInterval(interval);
  }, [connected]);

  // Apply remote stream to video element when ref becomes available
  useEffect(() => {
    if (remoteVideoRef.current && remoteStreamRef.current) {
      remoteVideoRef.current.srcObject = remoteStreamRef.current;
    }
  });

  // ─── WebRTC Setup ───
  useEffect(() => {
    if (!socket || !activeCall?.roomId) return;

    const roomId = activeCall.roomId;
    const isInitiator = activeCall.isInitiator;
    let cancelled = false;
    const cleanupHandlers = [];

    const setupWebRTC = async () => {
      try {
        // 1. Get media stream
        const constraints = isVideo
          ? { video: { width: { ideal: 1280 }, height: { ideal: 720 } }, audio: true }
          : { audio: true };
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        if (cancelled) { stream.getTracks().forEach(t => t.stop()); return; }
        streamRef.current = stream;

        // Set local video
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }

        // 2. Create PeerConnection
        const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });
        pcRef.current = pc;

        // 3. Add local tracks to PeerConnection
        stream.getTracks().forEach(track => pc.addTrack(track, stream));

        // 4. Handle remote tracks
        pc.ontrack = (event) => {
          const [remoteStream] = event.streams;
          remoteStreamRef.current = remoteStream;
          setConnected(true);
          // Apply immediately if ref is available
          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = remoteStream;
          }
        };

        // 5. Handle ICE candidates — send to other peer
        pc.onicecandidate = (event) => {
          if (event.candidate) {
            socket.emit('webrtc:ice-candidate', { roomId, candidate: event.candidate });
          }
        };

        // 6. Connection state monitoring
        pc.onconnectionstatechange = () => {
          const state = pc.connectionState;
          if (state === 'connected') {
            setConnected(true);
          } else if (state === 'disconnected') {
            setConnected(false);
            // Try ICE restart after brief disconnect
            setTimeout(() => {
              if (pcRef.current && pcRef.current.connectionState === 'disconnected') {
                console.log('[WebRTC] Attempting ICE restart...');
                pcRef.current.restartIce();
              }
            }, 3000);
          } else if (state === 'failed') {
            setConnected(false);
            toast.error('Call connection failed');
            endCall();
          }
        };

        pc.oniceconnectionstatechange = () => {
          if (pc.iceConnectionState === 'connected' || pc.iceConnectionState === 'completed') {
            setConnected(true);
          }
        };

        // ─── Helper: Flush buffered ICE candidates ───
        const flushIceCandidates = async () => {
          while (iceCandidateBuffer.current.length > 0) {
            const candidate = iceCandidateBuffer.current.shift();
            try {
              await pc.addIceCandidate(new RTCIceCandidate(candidate));
            } catch (err) {
              console.warn('[WebRTC] Failed to add buffered ICE candidate:', err);
            }
          }
        };

        // ─── Signaling Handlers ───

        // Handle incoming offer (receiver side)
        const handleOffer = async ({ offer }) => {
          try {
            if (pc.signalingState !== 'stable') {
              console.warn('[WebRTC] Received offer in non-stable state:', pc.signalingState);
              return;
            }
            await pc.setRemoteDescription(new RTCSessionDescription(offer));
            await flushIceCandidates();
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);
            socket.emit('webrtc:answer', { roomId, answer });
          } catch (err) {
            console.error('[WebRTC] Handle offer failed:', err);
          }
        };

        // Handle incoming answer (initiator side)
        const handleAnswer = async ({ answer }) => {
          try {
            if (pc.signalingState !== 'have-local-offer') {
              console.warn('[WebRTC] Received answer in wrong state:', pc.signalingState);
              return;
            }
            await pc.setRemoteDescription(new RTCSessionDescription(answer));
            await flushIceCandidates();
          } catch (err) {
            console.error('[WebRTC] Handle answer failed:', err);
          }
        };

        // Handle incoming ICE candidate
        const handleCandidate = async ({ candidate }) => {
          try {
            if (pc.remoteDescription && pc.remoteDescription.type) {
              await pc.addIceCandidate(new RTCIceCandidate(candidate));
            } else {
              // Buffer until remote description is set
              iceCandidateBuffer.current.push(candidate);
            }
          } catch (err) {
            console.warn('[WebRTC] Add ICE candidate failed:', err);
          }
        };

        // Handle webrtc:ready — the other peer's PeerConnection is ready
        const handleWebrtcReady = async () => {
          if (isInitiator) {
            try {
              const offer = await pc.createOffer();
              await pc.setLocalDescription(offer);
              socket.emit('webrtc:offer', { roomId, offer });
            } catch (err) {
              console.error('[WebRTC] Create offer failed:', err);
              toast.error('Could not start call');
              endCall();
            }
          }
        };

        // Handle renegotiate — other peer refreshed and rejoined
        const handleRenegotiate = async () => {
          try {
            // Reset ICE buffer for fresh negotiation
            iceCandidateBuffer.current = [];
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);
            socket.emit('webrtc:offer', { roomId, offer });
          } catch (err) {
            console.error('[WebRTC] Renegotiate failed:', err);
          }
        };

        // Register all socket listeners
        socket.on('webrtc:offer', handleOffer);
        socket.on('webrtc:answer', handleAnswer);
        socket.on('webrtc:ice-candidate', handleCandidate);
        socket.on('webrtc:ready', handleWebrtcReady);
        socket.on('webrtc:renegotiate', handleRenegotiate);

        cleanupHandlers.push(() => {
          socket.off('webrtc:offer', handleOffer);
          socket.off('webrtc:answer', handleAnswer);
          socket.off('webrtc:ice-candidate', handleCandidate);
          socket.off('webrtc:ready', handleWebrtcReady);
          socket.off('webrtc:renegotiate', handleRenegotiate);
        });

        // ─── Start Negotiation ───
        // Both sides need time for PeerConnection to be created.
        // Receiver signals "ready" first, initiator waits for it.
        if (!isInitiator) {
          // Small delay to ensure socket listeners are registered on the initiator side
          setTimeout(() => {
            if (!cancelled) {
              socket.emit('webrtc:ready', { roomId });
            }
          }, 500);
        }
      } catch (err) {
        console.error('[WebRTC] Media access error:', err);
        if (!cancelled) {
          toast.error('Camera/microphone access denied');
          endCall();
        }
      }
    };

    setupWebRTC();

    // Handle call:ended from remote
    const handleCallEnded = () => {
      streamRef.current?.getTracks().forEach(t => t.stop());
      pcRef.current?.close();
      pcRef.current = null;
      clearCall();
    };
    socket.on('call:ended', handleCallEnded);
    cleanupHandlers.push(() => socket.off('call:ended', handleCallEnded));

    return () => {
      cancelled = true;
      cleanupHandlers.forEach(fn => fn());
      streamRef.current?.getTracks().forEach(t => t.stop());
      if (pcRef.current) {
        pcRef.current.close();
        pcRef.current = null;
      }
    };
    // eslint-disable-next-line
  }, [socket, activeCall?.roomId]);

  // ─── Controls ───
  const toggleMute = () => {
    const track = streamRef.current?.getAudioTracks()[0];
    if (track) { track.enabled = !track.enabled; setMuted(!track.enabled); }
  };

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
          {!connected && (
            <div className="absolute inset-0 flex items-center justify-center bg-[#0b141a]">
              <div className="text-center">
                <div className="w-28 h-28 rounded-full bg-wa-teal/20 flex items-center justify-center mx-auto mb-4 border-4 border-wa-teal/30"
                  style={{ animation: 'pulse 2s infinite' }}>
                  <span className="text-5xl text-wa-teal font-bold">{callerName?.[0]?.toUpperCase()}</span>
                </div>
                <p className="text-white/60 mt-2">Connecting video...</p>
              </div>
            </div>
          )}
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
          <audio ref={remoteVideoRef} autoPlay playsInline className="hidden" />
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
