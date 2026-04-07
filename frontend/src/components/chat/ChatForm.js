import { useState, useEffect, useRef, useCallback } from "react";
import { PaperAirplaneIcon } from "@heroicons/react/solid";
import { EmojiHappyIcon } from "@heroicons/react/outline";
import Picker from "emoji-picker-react";
import ReplyPreview from "./ReplyPreview";
import { Paperclip, FileIcon } from "./icons/ChatIcons";

export default function ChatForm({ handleFormSubmit, socket, currentUser, receiverId, replyTo, onCancelReply }) {
  const [message, setMessage] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [attachment, setAttachment] = useState(null); // { file, preview, fileType }
  const [uploading, setUploading] = useState(false);

  const scrollRef = useRef();
  const fileInputRef = useRef();
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView();
  }, [showEmojiPicker]);

  // Cleanup object URL on unmount
  useEffect(() => {
    return () => {
      if (attachment?.preview) URL.revokeObjectURL(attachment.preview);
    };
  }, [attachment]);

  const emitTyping = useCallback((isTyping) => {
    if (socket?.current && receiverId) {
      socket.current.emit("typing", {
        senderId: currentUser?.uid,
        receiverId,
        isTyping,
      });
    }
  }, [socket, currentUser, receiverId]);

  const handleTextChange = (e) => {
    setMessage(e.target.value);
    // Debounced typing indicator
    emitTyping(true);
    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => emitTyping(false), 1500);
  };

  const handleEmojiClick = (event, emojiObject) => {
    setMessage((prev) => prev + emojiObject.emoji);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const ext = file.name.split(".").pop().toLowerCase();
    let fileType = "document";
    if (["jpg", "jpeg", "png", "gif", "webp", "heic"].includes(ext)) fileType = "image";
    else if (["mp3", "wav", "ogg", "m4a"].includes(ext)) fileType = "audio";
    else if (["mp4", "mov", "webm"].includes(ext)) fileType = "video";

    const preview = fileType === "image" ? URL.createObjectURL(file) : null;
    setAttachment({ file, preview, fileType, name: file.name, size: file.size });

    // Reset input so same file can be re-picked
    e.target.value = "";
  };

  const removeAttachment = () => {
    if (attachment?.preview) URL.revokeObjectURL(attachment.preview);
    setAttachment(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim() && !attachment) return;

    clearTimeout(typingTimeoutRef.current);
    emitTyping(false);

    setUploading(true);
    try {
      await handleFormSubmit(message, attachment, replyTo);
      setMessage("");
      removeAttachment();
      onCancelReply?.();
    } finally {
      setUploading(false);
    }
  };

  return (
    <div ref={scrollRef} className="relative">
      {/* Emoji Picker */}
      {showEmojiPicker && (
        <div className="absolute bottom-full left-0 mb-2 z-50 shadow-2xl rounded-2xl overflow-hidden">
          <Picker onEmojiClick={handleEmojiClick} />
        </div>
      )}

      {/* Reply Preview Strip */}
      <ReplyPreview replyTo={replyTo} onCancelReply={onCancelReply} />

      {/* Attachment Preview */}
      {attachment && (
        <div className="flex items-center gap-3 bg-primary-50 dark:bg-gray-800 border border-primary-200 dark:border-gray-700 rounded-2xl px-4 py-2.5 mb-2">
          {attachment.fileType === "image" ? (
            <img src={attachment.preview} alt="preview" className="w-12 h-12 rounded-xl object-cover" />
          ) : (
            <div className="w-12 h-12 rounded-xl bg-primary-100 dark:bg-gray-700 flex items-center justify-center">
              <FileIcon className="w-6 h-6 text-primary-500" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate">{attachment.name}</p>
            <p className="text-xs text-gray-500">{(attachment.size / 1024).toFixed(1)} KB</p>
          </div>
          <button
            onClick={removeAttachment}
            className="text-gray-400 hover:text-red-500 transition-colors text-lg font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* Form Row */}
      <form onSubmit={handleSubmit}>
        <div className="flex items-center gap-3 w-full">
          {/* Emoji */}
          <button
            type="button"
            className="p-2.5 text-gray-400 hover:text-primary-500 hover:bg-primary-50 dark:hover:bg-gray-800 rounded-full transition-all duration-200 shrink-0"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            title="Emoji"
          >
            <EmojiHappyIcon className="h-5 w-5" />
          </button>

          {/* Attachment */}
          <button
            type="button"
            className="p-2.5 text-gray-400 hover:text-primary-500 hover:bg-primary-50 dark:hover:bg-gray-800 rounded-full transition-all duration-200 shrink-0"
            onClick={() => fileInputRef.current?.click()}
            title="Attach file"
          >
            <Paperclip className="h-5 w-5" />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,audio/*,video/*,.pdf,.doc,.docx,.txt,.xlsx,.pptx,.zip"
            className="hidden"
            onChange={handleFileChange}
          />

          {/* Text Input */}
          <input
            type="text"
            placeholder="Type a message..."
            className="input-field flex-1"
            autoComplete="off"
            value={message}
            onChange={handleTextChange}
          />

          {/* Send */}
          <button
            type="submit"
            disabled={(!message.trim() && !attachment) || uploading}
            className="p-3 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white rounded-full transition-all duration-200 shadow-md shadow-primary-500/30 disabled:opacity-50 disabled:shadow-none active:translate-y-[1px] shrink-0"
          >
            {uploading ? (
              <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin inline-block" />
            ) : (
              <PaperAirplaneIcon className="h-5 w-5 rotate-90" />
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

