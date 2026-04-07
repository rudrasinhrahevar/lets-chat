import { useState, useEffect, useCallback, useRef } from 'react';

export default function MediaViewer({ media, allMedia, onClose }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [scale, setScale] = useState(1);
  const containerRef = useRef(null);

  // Find current media index
  useEffect(() => {
    if (allMedia && media) {
      const idx = allMedia.findIndex(m => m.url === media.url);
      if (idx !== -1) setCurrentIndex(idx);
    }
  }, [media, allMedia]);

  const currentMedia = allMedia ? allMedia[currentIndex] : media;

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape') onClose();
    if (e.key === 'ArrowLeft' && allMedia && currentIndex > 0) setCurrentIndex(i => i - 1);
    if (e.key === 'ArrowRight' && allMedia && currentIndex < allMedia.length - 1) setCurrentIndex(i => i + 1);
  }, [onClose, currentIndex, allMedia]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [handleKeyDown]);

  const handleWheel = (e) => {
    e.preventDefault();
    setScale(s => Math.min(Math.max(0.5, s + (e.deltaY > 0 ? -0.1 : 0.1)), 4));
  };

  if (!currentMedia) return null;

  const isVideo = currentMedia.mimeType?.startsWith('video') || currentMedia.url?.match(/\.(mp4|webm|ogg)$/i);

  return (
    <div className="media-viewer-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 text-white">
        <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
        {allMedia && (
          <span className="text-sm text-white/70">{currentIndex + 1} / {allMedia.length}</span>
        )}
        <div className="flex items-center gap-2">
          <button onClick={() => setScale(1)} className="p-2 hover:bg-white/10 rounded-full transition text-sm text-white/70" title="Reset zoom">
            {Math.round(scale * 100)}%
          </button>
          <a href={currentMedia.url} download target="_blank" rel="noreferrer" className="p-2 hover:bg-white/10 rounded-full transition" title="Download">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
          </a>
        </div>
      </div>

      {/* Content */}
      <div ref={containerRef} className="media-viewer-content" onWheel={handleWheel}>
        {/* Nav arrows */}
        {allMedia && currentIndex > 0 && (
          <button onClick={() => { setCurrentIndex(i => i - 1); setScale(1); }} className="absolute left-4 text-white/70 hover:text-white p-3 hover:bg-white/10 rounded-full transition z-10">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </button>
        )}
        {allMedia && currentIndex < allMedia.length - 1 && (
          <button onClick={() => { setCurrentIndex(i => i + 1); setScale(1); }} className="absolute right-4 text-white/70 hover:text-white p-3 hover:bg-white/10 rounded-full transition z-10">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          </button>
        )}

        {isVideo ? (
          <video
            key={currentMedia.url}
            src={currentMedia.url}
            controls
            autoPlay
            className="max-w-[90vw] max-h-[85vh] object-contain"
            style={{ transform: `scale(${scale})` }}
          />
        ) : (
          <img
            key={currentMedia.url}
            src={currentMedia.url}
            alt={currentMedia.filename || ''}
            className="max-w-[90vw] max-h-[85vh] object-contain transition-transform duration-200"
            style={{ transform: `scale(${scale})` }}
            draggable={false}
          />
        )}
      </div>

      {/* Caption */}
      {currentMedia.filename && (
        <div className="px-4 py-2 text-center text-white/60 text-sm">
          {currentMedia.filename}
        </div>
      )}
    </div>
  );
}
