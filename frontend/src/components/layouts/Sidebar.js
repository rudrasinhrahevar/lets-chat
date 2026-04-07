import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import Logout from "../accounts/Logout";
import ThemeToggler from "./ThemeToggler";
import {
  ChatAlt2Icon,
  UserGroupIcon,
  CogIcon,
  QuestionMarkCircleIcon,
  InformationCircleIcon,
  LogoutIcon,
} from "@heroicons/react/outline";

export default function Sidebar() {
  const [modal, setModal] = useState(false);
  const { currentUser } = useAuth();
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path ? "sidebar-icon-active" : "sidebar-icon";
  };

  return (
    <>
      <div className="w-20 md:w-24 h-screen bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col justify-between py-6 items-center shrink-0 z-20 shadow-sm relative">
        {/* Top Section */}
        <div className="flex flex-col items-center w-full gap-8">
          {/* Logo */}
          <Link to="/" className="flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-400 to-primary-600 text-white font-bold text-xl shadow-lg shadow-primary-500/30">
            LC
          </Link>

          {/* Navigation Links */}
          <nav className="flex flex-col gap-4 w-full items-center">
            <Link to="/" className={isActive("/")} title="Chats">
              <ChatAlt2Icon className="w-6 h-6" />
            </Link>
            <Link to="/profile" className={isActive("/profile")} title="Profile">
              <UserGroupIcon className="w-6 h-6" />
            </Link>
            <Link to="/settings" className={isActive("/settings")} title="Settings">
              <CogIcon className="w-6 h-6" />
            </Link>
            <Link to="/help" className={isActive("/help")} title="Help">
              <QuestionMarkCircleIcon className="w-6 h-6" />
            </Link>
            <Link to="/about" className={isActive("/about")} title="About">
              <InformationCircleIcon className="w-6 h-6" />
            </Link>
            {/* Add more links here if needed */}
          </nav>
        </div>

        {/* Bottom Section */}
        <div className="flex flex-col items-center gap-6 w-full">
          <ThemeToggler />

          {currentUser && (
            <div className="flex flex-col items-center gap-4">
              <Link to="/profile" title="Profile">
                <img
                  className="w-10 h-10 rounded-full border-2 border-white dark:border-gray-800 shadow-md object-cover cursor-pointer hover:ring-2 hover:ring-primary-500 transition-all"
                  src={currentUser.photoURL || "https://ui-avatars.com/api/?name=" + currentUser.displayName}
                  alt="Avatar"
                />
              </Link>
              <button
                className="sidebar-icon !text-red-500 hover:!bg-red-50 dark:hover:!bg-red-900/30"
                onClick={() => setModal(true)}
                title="Logout"
              >
                <LogoutIcon className="w-6 h-6" />
              </button>
            </div>
          )}
        </div>
      </div>
      {modal && <Logout modal={modal} setModal={setModal} />}
    </>
  );
}
