import { useState, useRef, useEffect, useCallback } from 'react';

export default function VoiceRecorder({ onSend, onCancel }) {
  const [duration, setDuration] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [slideOffset, setSlideOffset] = useState(0);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);
  const startYRef = useRef(0);
  const startXRef = useRef(0);
  const containerRef = useRef(null);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm;codecs=opus' });
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        stream.getTracks().forEach(t => t.stop());
      };

      mediaRecorder.start();
      timerRef.current = setInterval(() => setDuration(d => d + 1), 1000);
    } catch (err) {
      console.error('Microphone access denied:', err);
      onCancel();
    }
  }, [onCancel]);

  useEffect(() => {
    startRecording();
    return () => {
      clearInterval(timerRef.current);
      if (mediaRecorderRef.current?.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
    };
  }, [startRecording]);

  const stopAndSend = () => {
    clearInterval(timerRef.current);
    const recorder = mediaRecorderRef.current;
    if (recorder && recorder.state === 'recording') {
      recorder.onstop = () => {
        recorder.stream.getTracks().forEach(t => t.stop());
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        if (blob.size > 0) {
          const file = new File([blob], `voice_${Date.now()}.webm`, { type: 'audio/webm' });
          onSend(file, duration);
        } else {
          onCancel();
        }
      };
      recorder.stop();
    }
  };

  const cancel = () => {
    clearInterval(timerRef.current);
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    onCancel();
  };

  const formatTimer = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  // Touch handlers for slide-to-cancel
  const handleTouchStart = (e) => {
    startXRef.current = e.touches[0].clientX;
    startYRef.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e) => {
    const diffX = startXRef.current - e.touches[0].clientX;
    const diffY = startYRef.current - e.touches[0].clientY;

    // Slide up to lock
    if (diffY > 60 && !isLocked) {
      setIsLocked(true);
      return;
    }

    // Slide left to cancel
    if (diffX > 0) {
      setSlideOffset(Math.min(diffX, 150));
      if (diffX > 120) {
        cancel();
      }
    }
  };

  const handleTouchEnd = () => {
    if (!isLocked && slideOffset < 120) {
      stopAndSend();
    }
    setSlideOffset(0);
  };

  // Generate random waveform bars for visual effect
  const waveformBars = Array.from({ length: 30 }, (_, i) => {
    const height = 8 + Math.sin(i * 0.5 + duration * 2) * 12 + Math.random() * 8;
    return Math.max(4, Math.min(32, height));
  });

  return (
    <div
      ref={containerRef}
      className="voice-recording-bar"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Cancel button (locked mode) or slide indicator */}
      {isLocked ? (
        <button onClick={cancel} className="p-2 text-wa-danger hover:bg-wa-input rounded-full transition" title="Cancel">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
        </button>
      ) : (
        <div className="slide-cancel" style={{ opacity: 1 - slideOffset / 150 }}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          Slide to cancel
        </div>
      )}

      {/* Recording indicator */}
      <div className="recording-dot" />

      {/* Timer */}
      <span className="recording-timer">{formatTimer(duration)}</span>

      {/* Waveform */}
      <div className="flex-1 flex items-center justify-center gap-0.5 h-8 overflow-hidden">
        {waveformBars.map((h, i) => (
          <div
            key={i}
            className="w-[3px] rounded-full bg-wa-teal/60 transition-all duration-100"
            style={{ height: `${h}px` }}
          />
        ))}
      </div>

      {/* Send button (locked mode) or lock indicator */}
      {isLocked ? (
        <button onClick={stopAndSend} className="p-2.5 rounded-full bg-wa-teal hover:bg-wa-teal-dk text-white transition flex-shrink-0">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
        </button>
      ) : (
        <div className="flex flex-col items-center text-wa-text-sec text-xs gap-1">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15V3m0 12l-4-4m4 4l4-4" /></svg>
          <span className="text-[10px]">Lock</span>
        </div>
      )}
    </div>
  );
}
