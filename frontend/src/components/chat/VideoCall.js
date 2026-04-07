import React, { useEffect, useRef, useState } from "react";
import { Phone, VideoCamera, Microphone, MicrophoneOff, VideoCameraOff } from "./icons/ChatIcons";

export default function VideoCall({ 
  stream, 
  remoteStream, 
  callEnded, 
  leaveCall, 
  name, 
  isVoiceOnly,
}) {
  const myVideo = useRef();
  const userVideo = useRef();
  const [micActive, setMicActive] = useState(true);
  const [videoActive, setVideoActive] = useState(true);

  useEffect(() => {
    if (myVideo.current && stream) {
      myVideo.current.srcObject = stream;
    }
  }, [stream]);

  useEffect(() => {
    if (userVideo.current && remoteStream) {
      userVideo.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  const toggleMic = () => {
    if (stream) {
      const audioTrack = stream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !micActive;
        setMicActive(!micActive);
      }
    }
  };

  const toggleVideo = () => {
    if (stream) {
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoActive;
        setVideoActive(!videoActive);
      }
    }
  };

  // ─── Voice-only call UI ───────────────────────────────────────────────
  if (isVoiceOnly) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4">
        <div className="flex flex-col items-center gap-8">
          {/* Avatar & Name */}
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center shadow-2xl shadow-green-500/30 border-4 border-white/10">
                <span className="text-5xl font-bold text-white">
                  {name?.charAt(0)?.toUpperCase() || "?"}
                </span>
              </div>
              {/* Pulsing ring when connected */}
              {remoteStream && (
                <>
                  <div className="absolute inset-0 rounded-full border-4 border-green-400/50 animate-ping" />
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 bg-green-500 text-white text-xs font-bold rounded-full">
                    Connected
                  </div>
                </>
              )}
              {!remoteStream && (
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 bg-yellow-500 text-white text-xs font-bold rounded-full animate-pulse">
                  Connecting...
                </div>
              )}
            </div>

            <div className="text-center mt-4">
              <p className="text-2xl font-bold text-white">{name || "User"}</p>
              <p className="text-sm text-gray-400 mt-1 flex items-center gap-2 justify-center">
                <Phone className="w-4 h-4" />
                Voice Call
              </p>
            </div>
          </div>

          {/* Hidden audio element for remote stream */}
          {remoteStream && (
            <audio ref={userVideo} autoPlay playsInline className="hidden" />
          )}

          {/* Call timer area */}
          <div className="w-48 h-px bg-white/10" />

          {/* Controls */}
          <div className="flex items-center gap-4 px-8 py-4 bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10">
            <button
              onClick={toggleMic}
              className={`p-5 rounded-2xl transition-all ${
                micActive 
                ? "bg-white/10 text-white hover:bg-white/20" 
                : "bg-red-500/20 text-red-500 hover:bg-red-500/30 border border-red-500/50"
              }`}
            >
              {micActive ? <Microphone className="w-7 h-7" /> : <MicrophoneOff className="w-7 h-7" />}
            </button>

            <button
              onClick={leaveCall}
              className="p-5 bg-red-500 text-white rounded-2xl hover:bg-red-600 shadow-lg shadow-red-500/30 transition-all"
            >
              <Phone className="w-7 h-7 rotate-[135deg]" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─── Video call UI ────────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 md:p-8">
      <div className="relative w-full max-w-5xl aspect-video bg-gray-900 rounded-3xl overflow-hidden shadow-2xl border border-white/10 flex flex-col">
        
        {/* Remote Video (Main) */}
        <div className="flex-1 relative overflow-hidden bg-gray-800">
          {remoteStream ? (
            <video
              playsInline
              ref={userVideo}
              autoPlay
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-white">
              <div className="w-24 h-24 rounded-full bg-primary-500/20 flex items-center justify-center border-2 border-primary-500/50 animate-pulse">
                <VideoCamera className="w-10 h-10 text-primary-500" />
              </div>
              <p className="text-xl font-medium">Connecting with {name || "User"}...</p>
            </div>
          )}
          
          {/* User Name Tag */}
          <div className="absolute top-6 left-6 px-4 py-2 bg-black/40 backdrop-blur-md rounded-full border border-white/10">
            <p className="text-sm font-medium text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              {name || "User"}
            </p>
          </div>
        </div>

        {/* Local Video (Floating) */}
        <div className="absolute top-6 right-6 w-48 md:w-64 aspect-video bg-gray-800 rounded-2xl overflow-hidden shadow-xl border-2 border-white/20 z-10 group">
          {stream ? (
            <video
              playsInline
              muted
              ref={myVideo}
              autoPlay
              className="w-full h-full object-cover mirror"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
               <VideoCamera className="w-8 h-8 opacity-50" />
            </div>
          )}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <p className="text-xs font-medium text-white uppercase tracking-wider">You</p>
          </div>
        </div>

        {/* Controls Overlay */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4 px-8 py-4 bg-gray-900/60 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl transition-transform hover:scale-105">
          <button
            onClick={toggleMic}
            className={`p-4 rounded-2xl transition-all ${
              micActive 
              ? "bg-white/10 text-white hover:bg-white/20" 
              : "bg-red-500/20 text-red-500 hover:bg-red-500/30 border border-red-500/50"
            }`}
          >
            {micActive ? <Microphone className="w-6 h-6" /> : <MicrophoneOff className="w-6 h-6" />}
          </button>

          <button
            onClick={toggleVideo}
            className={`p-4 rounded-2xl transition-all ${
              videoActive 
              ? "bg-white/10 text-white hover:bg-white/20" 
              : "bg-red-500/20 text-red-500 hover:bg-red-500/30 border border-red-500/50"
            }`}
          >
            {videoActive ? <VideoCamera className="w-6 h-6" /> : <VideoCameraOff className="w-6 h-6" />}
          </button>

          <div className="w-px h-8 bg-white/10 mx-2" />

          <button
            onClick={leaveCall}
            className="p-4 bg-red-500 text-white rounded-2xl hover:bg-red-600 shadow-lg shadow-red-500/30 transition-all flex items-center gap-3 px-8 font-bold"
          >
            <Phone className="w-6 h-6 rotate-[135deg]" />
            Hangup
          </button>
        </div>
      </div>
      
      <style>{`
        .mirror {
          transform: rotateY(180deg);
        }
      `}</style>
    </div>
  );
}
