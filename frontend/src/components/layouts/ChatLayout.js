import { useEffect, useRef, useState } from "react";

import {
  getAllUsers,
  getChatRooms,
  initiateSocketConnection,
} from "../../services/ChatService";
import { useAuth } from "../../contexts/AuthContext";

import ChatRoom from "../chat/ChatRoom";
import Welcome from "../chat/Welcome";
import AllUsers from "../chat/AllUsers";
import SearchUsers from "../chat/SearchUsers";
import VideoCall from "../chat/VideoCall";
import IncomingCall from "../chat/IncomingCall";
import Peer from "simple-peer";

export default function ChatLayout() {
  const [users, SetUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [chatRooms, setChatRooms] = useState([]);
  const [filteredRooms, setFilteredRooms] = useState([]);

  const [currentChat, setCurrentChat] = useState();
  const [onlineUsersId, setonlineUsersId] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  const [isContact, setIsContact] = useState(false);

  // Video Call States
  const [call, setCall] = useState({});
  const [callAccepted, setCallAccepted] = useState(false);
  const [callEnded, setCallEnded] = useState(false);
  const [stream, setStream] = useState();
  const [remoteStream, setRemoteStream] = useState();
  const [receivingCall, setReceivingCall] = useState(false);

  const socket = useRef();
  const connectionRef = useRef();

  const { currentUser } = useAuth();

  useEffect(() => {
    const getSocket = async () => {
      const res = await initiateSocketConnection();
      socket.current = res;
      socket.current.emit("addUser", currentUser.uid);
      
      socket.current.on("getUsers", (users) => {
        const userId = users.map((u) => u[0]);
        setonlineUsersId(userId);
      });

      // Video/Voice Call Signaling
      socket.current.on("callUser", ({ from, name: callerName, signal, photoURL, isVoiceOnly }) => {
        setReceivingCall(true);
        setCall({ isReceivingCall: true, from, name: callerName, signal, photoURL, isVoiceOnly: !!isVoiceOnly });
      });

      socket.current.on("callEnded", () => {
        socket.current.off("callAccepted");
        if (connectionRef.current) {
          connectionRef.current.destroy();
          connectionRef.current = null;
        }
        setCallEnded(false);
        setCallAccepted(false);
        setReceivingCall(false);
        setStream(null);
        setRemoteStream(null);
        setCall({});
      });
    };

    getSocket();

    return () => {
      if (socket.current) {
        socket.current.off("getUsers");
        socket.current.off("callUser");
        socket.current.off("callEnded");
      }
    };
  }, [currentUser.uid]);

  const answerCall = () => {
    setCallAccepted(true);
    setReceivingCall(false);
    setCall(prev => ({ ...prev, isReceivingCall: false }));

    const isVoice = call.isVoiceOnly;
    navigator.mediaDevices.getUserMedia({ video: !isVoice, audio: true }).then((currentStream) => {
      setStream(currentStream);

      const peer = new Peer({ initiator: false, trickle: false, stream: currentStream });

      peer.on("signal", (data) => {
        socket.current.emit("answerCall", { signal: data, to: call.from });
      });

      peer.on("stream", (currentStream) => {
        setRemoteStream(currentStream);
      });

      peer.on("error", (err) => {
        console.error("Peer error (answerer):", err.message);
      });

      peer.signal(call.signal);
      connectionRef.current = peer;
    });
  };

  const callUser = (targetUserId, targetUserName, targetUserPhoto, isVoiceOnly = false) => {
    navigator.mediaDevices.getUserMedia({ video: !isVoiceOnly, audio: true }).then((currentStream) => {
      setStream(currentStream);

      const peer = new Peer({ initiator: true, trickle: false, stream: currentStream });

      peer.on("error", (err) => {
        console.error("Peer error (caller):", err.message);
      });

      peer.on("signal", (data) => {
        socket.current.emit("callUser", {
          userToCall: targetUserId,
          signalData: data,
          from: currentUser.uid,
          name: currentUser.displayName,
          photoURL: currentUser.photoURL,
          isVoiceOnly,
        });
      });

      peer.on("stream", (currentStream) => {
        setRemoteStream(currentStream);
      });

      const onCallAccepted = (signal) => {
        setCallAccepted(true);
        if (!peer.destroyed) {
          peer.signal(signal);
        }
      };
      socket.current.on("callAccepted", onCallAccepted);

      connectionRef.current = peer;
      setCall({ isReceivingCall: false, name: targetUserName, from: targetUserId, photoURL: targetUserPhoto, isVoiceOnly });
    });
  };

  const leaveCall = () => {
    setCallEnded(true);
    socket.current.off("callAccepted");
    if (connectionRef.current) {
      connectionRef.current.destroy();
    }
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }
    const otherUserId = call.from;
    socket.current.emit("endCall", { id: otherUserId });
    setStream(null);
    setRemoteStream(null);
    setCallAccepted(false);
    setCallEnded(false);
    setCall({});
    connectionRef.current = null;
  };

  useEffect(() => {
    const fetchData = async () => {
      const res = await getChatRooms(currentUser.uid);
      setChatRooms(Array.isArray(res) ? res : []);
    };

    fetchData();
  }, [currentUser.uid]);

  useEffect(() => {
    const fetchData = async () => {
      const res = await getAllUsers();
      SetUsers(Array.isArray(res) ? res : []);
    };

    fetchData();
  }, []);

  useEffect(() => {
    setFilteredUsers(users);
    setFilteredRooms(chatRooms);
  }, [users, chatRooms]);

  useEffect(() => {
    if (isContact) {
      setFilteredUsers([]);
    } else {
      setFilteredRooms([]);
    }
  }, [isContact]);

  const handleChatChange = (chat) => {
    setCurrentChat(chat);
  };

  const handleSearch = (newSearchQuery) => {
    setSearchQuery(newSearchQuery);

    const safeUsers = Array.isArray(users) ? users : [];
    const safeChatRooms = Array.isArray(chatRooms) ? chatRooms : [];

    const searchedUsers = safeUsers.filter((user) => {
      const name = (user?.displayName || "").toLowerCase();
      return name.includes(newSearchQuery.toLowerCase());
    });

    const searchedUsersId = searchedUsers.map((u) => u.uid);

    // If there are initial contacts
    if (safeChatRooms.length !== 0) {
      safeChatRooms.forEach((chatRoom) => {
        // Check if searched user is a contact or not.
        const members = Array.isArray(chatRoom?.members) ? chatRoom.members : [];
        const isUserContact = members.some(
          (e) => e !== currentUser.uid && searchedUsersId.includes(e)
        );
        setIsContact(isUserContact);

        isUserContact
          ? setFilteredRooms([chatRoom])
          : setFilteredUsers(searchedUsers);
      });
    } else {
      setFilteredUsers(searchedUsers);
    }
  };

  return (
    <div className="flex h-full w-full bg-surface-50 dark:bg-gray-950">
      {/* Sidebar / Contacts List */}
      <div className="w-80 lg:w-96 flex flex-col bg-surface-100 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 z-10 shrink-0">
        <div className="px-4 pt-6 pb-2">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white px-2 mb-4">Messages</h1>
          <SearchUsers handleSearch={handleSearch} />
        </div>

        <AllUsers
          users={searchQuery !== "" ? filteredUsers : users}
          chatRooms={searchQuery !== "" ? filteredRooms : chatRooms}
          setChatRooms={setChatRooms}
          onlineUsersId={onlineUsersId}
          currentUser={currentUser}
          changeChat={handleChatChange}
        />
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col relative h-full bg-white dark:bg-gray-950">
        {currentChat ? (
          <ChatRoom
            currentChat={currentChat}
            currentUser={currentUser}
            socket={socket}
            onlineUsersId={onlineUsersId}
            onVideoCall={(isVoice, contactName, contactPhoto) => {
              const contactId = currentChat.members?.find(m => m !== currentUser.uid);
              callUser(contactId, contactName || "Contact", contactPhoto, isVoice);
            }}
          />
        ) : (
          <Welcome />
        )}
      </div>

      {/* Call Overlay (Video or Voice) */}
      {stream && (callAccepted || !call.isReceivingCall) ? (
        <VideoCall 
          stream={stream}
          remoteStream={remoteStream}
          callEnded={callEnded}
          leaveCall={leaveCall}
          name={call.name || "User"}
          isVoiceOnly={call.isVoiceOnly}
        />
      ) : null}

      {/* Incoming Call Notification */}
      {receivingCall && !callAccepted && (
        <IncomingCall 
          name={call.name}
          photoURL={call.photoURL}
          onAccept={answerCall}
          onDecline={() => setReceivingCall(false)}
          isVoiceOnly={call.isVoiceOnly}
        />
      )}
    </div>
  );
}
