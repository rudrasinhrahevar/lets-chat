import { useState, useCallback, useEffect } from 'react';
import { useChatStore } from 'store/useChatStore';
import { useCallStore } from 'store/useCallStore';
import { useStatusStore } from 'store/useStatusStore';
import api from 'services/api';
import Sidebar from 'components/sidebar/Sidebar';
import ChatWindow from 'components/chat/ChatWindow';
import IncomingCall from 'components/calls/IncomingCall';
import CallScreen from 'components/calls/CallScreen';
import StatusViewer from 'components/status/StatusViewer';
import { Toaster } from 'react-hot-toast';

export default function AppLayout() {
  const { activeChat, setChats } = useChatStore();
  const { incomingCall, activeCall } = useCallStore();
  const { viewingStatus } = useStatusStore();
  const [view, setView] = useState('chats');

  const loadChats = useCallback(async () => {
    try { const { data } = await api.get('/chats'); setChats(data.data); } catch (err) { console.error('Load chats failed:', err); }
  }, [setChats]);

  useEffect(() => { loadChats(); }, [loadChats]);

  return (
    <div className="flex h-screen bg-wa-bg text-wa-text overflow-hidden select-none">
      <aside className={`flex flex-col border-r border-wa-border w-full md:w-[380px] lg:w-[420px] flex-shrink-0 ${activeChat ? 'hidden md:flex' : 'flex'}`}>
        <Sidebar view={view} onViewChange={setView} />
      </aside>
      <main className={`flex-1 flex flex-col ${activeChat ? 'flex' : 'hidden md:flex'}`}>
        {activeChat ? <ChatWindow /> : (
          <div className="flex-1 flex items-center justify-center bg-wa-panel/30">
            <div className="text-center p-8">
              <div className="w-36 h-36 rounded-full bg-wa-teal/10 flex items-center justify-center mx-auto mb-6">
                <svg className="w-20 h-20 text-wa-teal/60" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/>
                </svg>
              </div>
              <h2 className="text-3xl font-light text-wa-text mb-3">ChatApp Web</h2>
              <p className="text-wa-text-sec text-sm max-w-md">Send and receive messages. Use on multiple devices at the same time.</p>
              <div className="mt-6 flex items-center justify-center gap-2 text-wa-text-sec text-xs">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/></svg>
                End-to-end encrypted
              </div>
            </div>
          </div>
        )}
      </main>
      {incomingCall && <IncomingCall />}
      {activeCall && <CallScreen />}
      {viewingStatus && <StatusViewer />}
      <Toaster position="top-center" toastOptions={{ style: { background: '#202c33', color: '#e9edef', border: '1px solid #222d34' } }} />
    </div>
  );
}
