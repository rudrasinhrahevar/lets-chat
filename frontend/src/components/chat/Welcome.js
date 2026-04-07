export default function Welcome() {
  return (
    <div className="flex flex-col items-center justify-center h-full w-full bg-surface-50 dark:bg-gray-950 select-none">
      {/* Decorative Blobs */}
      <div className="absolute top-[15%] left-[10%] w-48 h-48 rounded-full bg-primary-400/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-[15%] right-[10%] w-64 h-64 rounded-full bg-primary-200/10 blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center text-center px-8 max-w-md">
        {/* Logo */}
        <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center shadow-2xl shadow-primary-500/30 mb-8">
          <span className="text-white font-black text-4xl tracking-tight">LC</span>
        </div>

        <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-3">
          Let's Chat
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-base font-medium leading-relaxed mb-8">
          Select a contact from the list to start a conversation. Your messages are private and secure.
        </p>

        {/* Feature Pills */}
        <div className="flex flex-wrap justify-center gap-2">
          {["💬 Real-time messaging", "📎 File sharing", "↩ Reply to messages", "😊 React with emoji"].map((f) => (
            <span
              key={f}
              className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full text-sm font-medium text-gray-600 dark:text-gray-300 shadow-sm"
            >
              {f}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

