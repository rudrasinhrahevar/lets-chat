import { useState, useRef } from "react";
import { format } from "timeago.js";
import MessageContextMenu from "./MessageContextMenu";
import { CheckSingle, CheckDouble, FileIcon, DownloadIcon } from "./icons/ChatIcons";

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

function MessageTicks({ status }) {
  if (status === "read") {
    return <CheckDouble className="w-4 h-4 text-blue-500 inline-block" />;
  } else if (status === "delivered") {
    return <CheckDouble className="w-4 h-4 text-gray-400 inline-block" />;
  }
  return <CheckSingle className="w-3.5 h-3.5 text-gray-400 inline-block" />;
}

function AttachmentContent({ attachment }) {
  if (!attachment?.url) return null;
  const { url, fileType, name, size } = attachment;

  if (fileType === "image") {
    return (
      <a href={url} target="_blank" rel="noopener noreferrer" className="block">
        <img
          src={url}
          alt={name || "Image"}
          className="rounded-xl max-w-[240px] max-h-[200px] object-cover w-full shadow-sm cursor-zoom-in hover:opacity-90 transition-opacity"
        />
      </a>
    );
  }

  if (fileType === "audio") {
    return (
      <audio controls className="w-full max-w-[260px] mt-1">
        <source src={url} />
        Your browser does not support audio.
      </audio>
    );
  }

  if (fileType === "video") {
    return (
      <video controls className="rounded-xl max-w-[260px] max-h-[200px] object-cover mt-1">
        <source src={url} />
        Your browser does not support video.
      </video>
    );
  }

  // Default: document/pdf/file
  const sizeLabel = size ? `${(size / 1024).toFixed(1)} KB` : "";
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-3 p-2 rounded-xl bg-black/10 hover:bg-black/20 transition-colors mt-1 max-w-[240px]"
      download={name}
    >
      <FileIcon className="w-8 h-8 shrink-0 opacity-70" />
      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold truncate">{name || "File"}</p>
        {sizeLabel && <p className="text-xs opacity-60">{sizeLabel}</p>}
      </div>
      <DownloadIcon className="w-4 h-4 shrink-0 opacity-70" />
    </a>
  );
}

export default function Message({ message, self, onReply, onDelete }) {
  const isOutgoing = self === message.sender;
  const [contextMenu, setContextMenu] = useState(null);
  const [reactions, setReactions] = useState(message.reactions || {});
  const holdTimer = useRef(null);

  const handleContextMenu = (e) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY });
  };

  // Mobile long-press support
  const handleTouchStart = () => {
    holdTimer.current = setTimeout(() => {
      setContextMenu({ x: window.innerWidth / 2 - 90, y: window.innerHeight / 2 - 120 });
    }, 500);
  };

  const handleTouchEnd = () => clearTimeout(holdTimer.current);

  const handleReact = (emoji) => {
    setReactions((prev) => ({
      ...prev,
      [emoji]: (prev[emoji] || 0) + 1,
    }));
  };

  const handleCopy = () => {
    if (message.message) navigator.clipboard.writeText(message.message);
  };

  const handleDelete = () => {
    onDelete?.(message._id || message.id);
  };

  const reactionEntries = Object.entries(reactions).filter(([, count]) => count > 0);

  return (
    <li
      className={classNames(
        isOutgoing ? "justify-end" : "justify-start",
        "flex mb-3 group"
      )}
    >
      <div
        className={classNames(
          "flex flex-col gap-1 max-w-[75%]",
          isOutgoing ? "items-end" : "items-start"
        )}
      >
        {/* Quoted Reply Preview inside the bubble */}
        {message.replyTo && (
          <div
            className={classNames(
              "px-3 py-1.5 rounded-xl text-xs max-w-full border-l-4 opacity-80",
              isOutgoing
                ? "bg-primary-600/40 border-white/60 text-white"
                : "bg-gray-100 dark:bg-gray-700 border-primary-400 text-gray-700 dark:text-gray-300"
            )}
          >
            <p className="font-bold text-[10px] mb-0.5 opacity-80">
              {message.replyTo.sender === self ? "You" : "Contact"}
            </p>
            <p className="truncate">
              {message.replyTo.message || message.replyTo.attachment?.name || "Attachment"}
            </p>
          </div>
        )}

        {/* Main Bubble */}
        <div
          className={classNames(
            isOutgoing ? "chat-bubble-outgoing" : "chat-bubble-incoming",
            "cursor-pointer select-text relative"
          )}
          onContextMenu={handleContextMenu}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {/* Attachment */}
          <AttachmentContent attachment={message.attachment} />

          {/* Text */}
          {message.message && (
            <span className="block font-medium text-[15px] leading-relaxed break-words whitespace-pre-wrap">
              {message.message}
            </span>
          )}

          {/* Timestamp + Ticks */}
          <div
            className={classNames(
              "flex items-center gap-1 mt-1",
              isOutgoing ? "justify-end" : "justify-start"
            )}
          >
            <span className="text-[10px] opacity-60 font-medium">
              {format(message.createdAt)}
            </span>
            {isOutgoing && <MessageTicks status={message.status || "sent"} />}
          </div>
        </div>

        {/* Emoji Reactions Row */}
        {reactionEntries.length > 0 && (
          <div
            className={classNames(
              "flex items-center gap-1 flex-wrap mt-0.5",
              isOutgoing ? "justify-end" : "justify-start"
            )}
          >
            {reactionEntries.map(([emoji, count]) => (
              <span
                key={emoji}
                className="inline-flex items-center gap-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-full px-2 py-0.5 text-xs shadow-sm cursor-pointer hover:scale-110 transition-transform"
                onClick={() => handleReact(emoji)}
                title={`${count} reaction${count > 1 ? "s" : ""}`}
              >
                {emoji} {count > 1 && <span className="text-gray-500 dark:text-gray-400">{count}</span>}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Context Menu */}
      {contextMenu && (
        <MessageContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          message={message}
          isSelf={isOutgoing}
          onClose={() => setContextMenu(null)}
          onReply={() => onReply?.(message)}
          onCopy={handleCopy}
          onDelete={handleDelete}
          onReact={handleReact}
        />
      )}
    </li>
  );
}

