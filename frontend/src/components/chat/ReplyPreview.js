import { Reply } from "./icons/ChatIcons";

export default function ReplyPreview({ replyTo, onCancelReply }) {
  if (!replyTo) return null;

  const previewText =
    replyTo.message
      ? (replyTo.message.length > 80 ? replyTo.message.slice(0, 80) + "…" : replyTo.message)
      : replyTo.attachment?.name || "Attachment";

  return (
    <div className="flex items-center gap-2 bg-primary-50 dark:bg-gray-800 border-l-4 border-primary-500 rounded-xl px-4 py-2.5 mb-2">
      <Reply className="w-4 h-4 text-primary-500 shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-xs font-bold text-primary-600 dark:text-primary-400">Replying to</p>
        <p className="text-xs text-gray-600 dark:text-gray-400 truncate">{previewText}</p>
      </div>
      <button
        onClick={onCancelReply}
        className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 text-sm font-bold shrink-0 ml-1"
        title="Cancel reply"
      >
        ✕
      </button>
    </div>
  );
}
