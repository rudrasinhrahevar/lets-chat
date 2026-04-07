import { useState, useEffect, useRef, useCallback } from "react";

import {
  getMessagesOfChatRoom,
  sendMessage,
  markMessagesAsRead,
} from "../../services/ChatService";

import Message from "./Message";
import ChatForm from "./ChatForm";
import ChatHeader from "./ChatHeader";

export default function ChatRoom({ currentChat, currentUser, socket, onlineUsersId, onVideoCall }) {
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [replyTo, setReplyTo] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const scrollRef = useRef();
  const typingTimeoutRef = useRef(null);
  const receiverId = currentChat.members?.find((m) => m !== currentUser.uid);

  // Fetch messages on room change
  useEffect(() => {
    const fetchData = async () => {
      const res = await getMessagesOfChatRoom(currentChat._id);
      setMessages(res || []);
      // Mark messages as read after fetching
      if (currentUser?.uid) {
        markMessagesAsRead(currentChat._id, currentUser.uid).catch(() => {});
        socket.current?.emit("markAsRead", {
          chatRoomId: currentChat._id,
          userId: currentUser.uid,
          receiverId: currentChat.members?.find((m) => m !== currentUser.uid),
        });
      }
    };
    fetchData();
    setReplyTo(null);
    setSearchQuery("");
    setIsTyping(false);
  }, [currentChat._id]);

  // Auto-scroll to latest message
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Socket listeners
  useEffect(() => {
    const s = socket.current;
    if (!s) return;

    const onGetMessage = (data) => {
      setMessages((prev) => [
        ...prev,
        {
          senderId: data.senderId,
          sender: data.senderId,
          message: data.message,
          attachment: data.attachment,
          replyTo: data.replyTo,
          status: "delivered",
          readBy: [],
          createdAt: new Date().toISOString(),
        },
      ]);
    };

    const onMessageDelivered = ({ messageId }) => {
      setMessages((prev) =>
        prev.map((m) =>
          (m._id === messageId || m.tempId === messageId)
            ? { ...m, status: "delivered" }
            : m
        )
      );
    };

    const onMessagesRead = ({ chatRoomId, userId }) => {
      if (chatRoomId === currentChat._id) {
        // Only mark messages from the OTHER user (the one who read them) as read
        setMessages((prev) =>
          prev.map((m) =>
            m.sender === userId ? m : { ...m, status: "read" }
          )
        );
      }
    };

    const onUserTyping = ({ senderId, isTyping: typing }) => {
      if (senderId === receiverId) {
        setIsTyping(typing);
        if (typing) {
          clearTimeout(typingTimeoutRef.current);
          typingTimeoutRef.current = setTimeout(() => setIsTyping(false), 3000);
        }
      }
    };

    s.on("getMessage", onGetMessage);
    s.on("messageDelivered", onMessageDelivered);
    s.on("messagesRead", onMessagesRead);
    s.on("userTyping", onUserTyping);

    return () => {
      s.off("getMessage", onGetMessage);
      s.off("messageDelivered", onMessageDelivered);
      s.off("messagesRead", onMessagesRead);
      s.off("userTyping", onUserTyping);
    };
  }, [socket, receiverId, currentChat._id]);

  const uploadToCloudinary = async (file, fileType) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append(
      "upload_preset",
      process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET || "lets_chat"
    );

    const resourceType =
      fileType === "image" ? "image" : fileType === "video" ? "video" : "raw";
    const cloudName =
      process.env.REACT_APP_CLOUDINARY_CLOUD_NAME || "dnucxmp2s";
    const endpoint = `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`;

    const res = await fetch(endpoint, { method: "POST", body: formData });
    if (!res.ok) throw new Error(`Cloudinary ${res.status}`);
    const data = await res.json();
    if (!data.secure_url) throw new Error("No secure_url returned");
    return { url: data.secure_url, publicId: data.public_id };
  };

  const handleFormSubmit = useCallback(
    async (text, attachmentLocal, replyToMsg) => {
      const tempId = `temp-${Date.now()}`;

      // ── 1. Build a LOCAL attachment object for immediate preview ──────────
      let localAttachment = null;
      if (attachmentLocal?.file) {
        localAttachment = {
          // Use a local object URL so the preview renders instantly
          url: attachmentLocal.preview || URL.createObjectURL(attachmentLocal.file),
          fileType: attachmentLocal.fileType,
          name: attachmentLocal.name,
          size: attachmentLocal.size,
          isLocal: true, // flag so we know it's not persisted yet
        };
      }

      // ── 2. Optimistically add message to the chat immediately ─────────────
      const optimisticMsg = {
        tempId,
        sender: currentUser.uid,
        message: text,
        attachment: localAttachment,
        replyTo: replyToMsg,
        status: "sent",
        createdAt: new Date().toISOString(),
        _uploading: !!localAttachment, // shows a spinner while uploading
      };
      setMessages((prev) => [...prev, optimisticMsg]);

      // ── 3. Upload file to Cloudinary (async, after showing preview) ───────
      let attachmentPayload = null;
      if (attachmentLocal?.file) {
        try {
          const { url, publicId } = await uploadToCloudinary(
            attachmentLocal.file,
            attachmentLocal.fileType
          );
          attachmentPayload = {
            url,
            publicId,
            fileType: attachmentLocal.fileType,
            name: attachmentLocal.name,
            size: attachmentLocal.size,
          };
          // Update the optimistic message with the real Cloudinary URL
          setMessages((prev) =>
            prev.map((m) =>
              m.tempId === tempId
                ? { ...m, attachment: attachmentPayload, _uploading: false }
                : m
            )
          );
        } catch (err) {
          console.error("Cloudinary upload failed:", err.message);
          // Keep the local preview but mark as not uploading
          setMessages((prev) =>
            prev.map((m) =>
              m.tempId === tempId ? { ...m, _uploading: false } : m
            )
          );
        }
      }

      // ── 4. Emit socket event ──────────────────────────────────────────────
      socket.current?.emit("sendMessage", {
        senderId: currentUser.uid,
        receiverId,
        message: text,
        messageId: tempId,
        attachment: attachmentPayload,
        replyTo: replyToMsg,
        chatRoomId: currentChat._id,
      });

      // ── 5. Persist to DB ──────────────────────────────────────────────────
      try {
        const messageBody = {
          chatRoomId: currentChat._id,
          sender: currentUser.uid,
          message: text,
          attachment: attachmentPayload,
          replyTo: replyToMsg,
        };
        const res = await sendMessage(messageBody);
        // Replace optimistic entry with the server response (adds _id, etc.)
        if (res?._id) {
          setMessages((prev) =>
            prev.map((m) =>
              m.tempId === tempId
                ? { 
                    ...res, 
                    tempId, 
                    status: "delivered", // Message is delivered once saved to DB
                  }
                : m
            )
          );
        }
      } catch (err) {
        console.error("sendMessage failed:", err.message);
      }
    },
    [socket, currentUser, receiverId, currentChat._id]
  );



  const handleReply = (message) => setReplyTo(message);
  const handleCancelReply = () => setReplyTo(null);

  const handleDeleteMessage = (messageId) => {
    setMessages((prev) => prev.filter((m) => m._id !== messageId && m.tempId !== messageId));
  };

  const handleClearChat = () => setMessages([]);

  const displayedMessages = searchQuery
    ? messages.filter((m) =>
        m.message?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : messages;

  return (
    <div className="flex flex-col h-full w-full relative">
      {/* Header */}
      <div className="flex-none px-5 py-3 bg-white/80 dark:bg-gray-950/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 z-10 sticky top-0 shadow-sm shadow-gray-100/50 dark:shadow-none">
        <ChatHeader
          currentChat={currentChat}
          currentUser={currentUser}
          onlineUsersId={onlineUsersId}
          isTyping={isTyping}
          onSearchChange={setSearchQuery}
          onClearChat={handleClearChat}
          onVideoCall={(contactName, contactPhoto) => onVideoCall(false, contactName, contactPhoto)}
          onVoiceCall={(contactName, contactPhoto) => onVideoCall(true, contactName, contactPhoto)}
        />
      </div>

      {/* Message List */}
      <div
        className="flex-1 overflow-y-auto w-full p-6 bg-surface-50 dark:bg-black/20"
        style={{ scrollBehavior: "smooth" }}
      >
        <ul className="flex flex-col justify-end min-h-full">
          {displayedMessages.map((message, index) => (
            <div key={message._id || message.tempId || index} ref={scrollRef}>
              <Message
                message={message}
                self={currentUser.uid}
                onReply={handleReply}
                onDelete={handleDeleteMessage}
              />
            </div>
          ))}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex mb-3">
              <div className="chat-bubble-incoming flex items-center gap-1 px-4 py-3">
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          )}
        </ul>
      </div>

      {/* Chat Form */}
      <div className="flex-none p-4 bg-white dark:bg-gray-950 border-t border-gray-100 dark:border-gray-800">
        <ChatForm
          handleFormSubmit={handleFormSubmit}
          socket={socket}
          currentUser={currentUser}
          receiverId={receiverId}
          replyTo={replyTo}
          onCancelReply={handleCancelReply}
        />
      </div>
    </div>
  );
}

