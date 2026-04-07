import { useState, useEffect } from "react";

import { createChatRoom } from "../../services/ChatService";
import Contact from "./Contact";
import UserLayout from "../layouts/UserLayout";

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function AllUsers({
  users = [],
  chatRooms = [],
  setChatRooms,
  onlineUsersId,
  currentUser,
  changeChat,
}) {
  const [selectedChat, setSelectedChat] = useState();
  const [nonContacts, setNonContacts] = useState([]);
  const [contactIds, setContactIds] = useState([]);

  useEffect(() => {
    if (Array.isArray(chatRooms) && chatRooms.length > 0) {
      const Ids = chatRooms.map((chatRoom) => {
        return chatRoom.members.find((member) => member !== currentUser.uid);
      });
      setContactIds(Ids);
    } else {
      setContactIds([]);
    }
  }, [chatRooms, currentUser.uid]);

  useEffect(() => {
    if (Array.isArray(users) && Array.isArray(contactIds)) {
      setNonContacts(
        users.filter(
          (f) => f.uid !== currentUser.uid && !contactIds.includes(f.uid)
        )
      );
    } else {
      setNonContacts([]);
    }
  }, [contactIds, users, currentUser.uid]);

  const changeCurrentChat = (index, chat) => {
    setSelectedChat(index);
    changeChat(chat);
  };

  const handleNewChatRoom = async (user) => {
    const members = {
      senderId: currentUser.uid,
      receiverId: user.uid,
    };
    const res = await createChatRoom(members);
    setChatRooms((prev) => [...prev, res]);
    changeChat(res);
  };

  return (
    <div className="flex-1 overflow-y-auto px-4 pb-4">
      <ul className="space-y-2">
        {Array.isArray(chatRooms) && chatRooms.length > 0 && (
          <>
            <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 mt-4 ml-2">Recent Chats</h2>
            {chatRooms.map((chatRoom, index) => (
              <li key={index}>
                <div
                  className={classNames(
                    index === selectedChat
                      ? "bg-primary-50 dark:bg-primary-900/20 border-primary-200 dark:border-primary-800"
                      : "bg-white dark:bg-gray-800 border-transparent hover:bg-gray-50 dark:hover:bg-gray-700/50",
                    "flex items-center px-4 py-3 text-sm rounded-2xl border transition-all duration-200 cursor-pointer shadow-sm shadow-gray-200/20 dark:shadow-none"
                  )}
                  onClick={() => changeCurrentChat(index, chatRoom)}
                >
                  <Contact
                    chatRoom={chatRoom}
                    onlineUsersId={onlineUsersId}
                    currentUser={currentUser}
                  />
                </div>
              </li>
            ))}
          </>
        )}
        
        {Array.isArray(nonContacts) && nonContacts.length > 0 && (
          <>
            <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 mt-6 ml-2">Other Users</h2>
            {nonContacts.map((nonContact, index) => (
              <li key={`non-${index}`}>
                <div
                  className="flex items-center px-4 py-3 text-sm rounded-2xl bg-white dark:bg-gray-800 border border-transparent hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all duration-200 cursor-pointer shadow-sm shadow-gray-200/20 dark:shadow-none"
                  onClick={() => handleNewChatRoom(nonContact)}
                >
                  <UserLayout user={nonContact} onlineUsersId={onlineUsersId} />
                </div>
              </li>
            ))}
          </>
        )}
      </ul>
    </div>
  );
}
