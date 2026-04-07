import { useEffect, useRef } from "react";
import { Reply, Copy, Trash } from "./icons/ChatIcons";

const REACTIONS = ["❤️", "👍", "😂", "😮", "😢", "👏"];

export default function MessageContextMenu({
  x,
  y,
  message,
  isSelf,
  onClose,
  onReply,
  onCopy,
  onDelete,
  onReact,
}) {
  const menuRef = useRef();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  // Adjust position to stay within viewport
  const adjustedX = Math.min(x, window.innerWidth - 200);
  const adjustedY = Math.min(y, window.innerHeight - 250);

  return (
    <div
      ref={menuRef}
      className="fixed z-[999] bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl shadow-2xl w-48 py-1 overflow-hidden"
      style={{ left: adjustedX, top: adjustedY }}
    >
      {/* Quick Emoji Reactions */}
      <div className="flex items-center justify-around px-3 py-2 border-b border-gray-100 dark:border-gray-700">
        {REACTIONS.map((emoji) => (
          <button
            key={emoji}
            className="text-lg hover:scale-125 transition-transform duration-150"
            onClick={() => { onReact(emoji); onClose(); }}
            title={emoji}
          >
            {emoji}
          </button>
        ))}
      </div>

      {/* Actions */}
      <button
        className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
        onClick={() => { onReply(); onClose(); }}
      >
        <Reply className="w-4 h-4 text-gray-400" />
        Reply
      </button>

      <button
        className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
        onClick={() => { onCopy(); onClose(); }}
      >
        <Copy className="w-4 h-4 text-gray-400" />
        Copy
      </button>

      {isSelf && (
        <button
          className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          onClick={() => { onDelete(); onClose(); }}
        >
          <Trash className="w-4 h-4" />
          Delete
        </button>
      )}
    </div>
  );
}
