import React from "react";
import { Phone, VideoCamera } from "./icons/ChatIcons";

export default function IncomingCall({ name, onAccept, onDecline, photoURL, isVoiceOnly }) {
  return (
    <div className="fixed top-8 left-1/2 -translate-x-1/2 z-[200] w-full max-w-sm">
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden animate-bounce-subtle">
        <div className="p-6">
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <img
                src={photoURL || `https://ui-avatars.com/api/?name=${name}`}
                alt={name}
                className="w-20 h-20 rounded-full object-cover border-4 border-primary-500/20"
              />
              <div className={`absolute -bottom-1 -right-1 p-2 rounded-full border-4 border-white dark:border-gray-800 ${isVoiceOnly ? 'bg-green-500' : 'bg-primary-500'}`}>
                {isVoiceOnly ? (
                  <Phone className="w-4 h-4 text-white" />
                ) : (
                  <VideoCamera className="w-4 h-4 text-white" />
                )}
              </div>
            </div>
            
            <div className="text-center">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                Incoming {isVoiceOnly ? 'Voice' : 'Video'} Call
              </h3>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{name} is calling you...</p>
            </div>

            <div className="flex items-center gap-4 w-full mt-2">
              <button
                onClick={onDecline}
                className="flex-1 py-4 bg-red-500 text-white rounded-2xl hover:bg-red-600 transition-all font-bold flex items-center justify-center gap-2 shadow-lg shadow-red-500/20"
              >
                <Phone className="w-5 h-5 rotate-[135deg]" />
                Decline
              </button>
              <button
                onClick={onAccept}
                className="flex-1 py-4 bg-green-500 text-white rounded-2xl hover:bg-green-600 transition-all font-bold flex items-center justify-center gap-2 shadow-lg shadow-green-500/20"
              >
                <Phone className="w-5 h-5" />
                Accept
              </button>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes bounce-subtle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .animate-bounce-subtle {
          animation: bounce-subtle 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
